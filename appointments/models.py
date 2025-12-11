from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from datetime import datetime, timedelta, date, time as dt_time
from core.models import User
from vehicles.models import Vehicle
from services.models import Service


class Appointment(models.Model):
    """
    Modelo para agendamentos
    """
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('confirmed', 'Confirmado'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', verbose_name='Cliente')
    veiculo = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='appointments', verbose_name='Veículo')
    data_agendamento = models.DateField(verbose_name='Data do Agendamento')
    horario_agendamento = models.TimeField(verbose_name='Horário do Agendamento')
    situacao = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Status')
    preco_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço Total')
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    posicao_fila = models.IntegerField(default=1, verbose_name='Posição na Fila')
    
    # Timestamps
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    iniciado_em = models.DateTimeField(blank=True, null=True, verbose_name='Iniciado em')
    concluido_em = models.DateTimeField(blank=True, null=True, verbose_name='Concluído em')
    
    class Meta:
        db_table = 'appointments_appointment'
        verbose_name = 'Agendamento'
        verbose_name_plural = 'Agendamentos'
        ordering = ['-data_agendamento', '-horario_agendamento']
        unique_together = ['data_agendamento', 'horario_agendamento']
    
    def __str__(self):
        return f"{self.usuario.full_name} - {self.data_agendamento} {self.horario_agendamento}"
    
    @property
    def datetime(self):
        """Retorna datetime combinado da data e hora"""
        from datetime import datetime, time
        return datetime.combine(self.data_agendamento, self.horario_agendamento)
    
    def can_be_cancelled(self):
        """Verifica se o agendamento pode ser cancelado"""
        return self.situacao in ['pending', 'confirmed']
    
    def can_be_modified(self):
        """Verifica se o agendamento pode ser modificado"""
        return self.situacao == 'pending'
    
    def clean(self):
        """Validação customizada para agendamentos"""
        errors = {}
        
        # 1. Validar data não pode ser no passado
        if self.data_agendamento and self.data_agendamento < date.today():
            errors['data_agendamento'] = "Não é possível agendar para uma data passada."
        
        # 2. Validar horário de funcionamento
        if self.data_agendamento and self.horario_agendamento:
            try:
                working_hour = WorkingHours.objects.get(dia_semana=self.data_agendamento.weekday())
                if not working_hour.aberto:
                    errors['data_agendamento'] = f"Estabelecimento fechado em {self.data_agendamento.strftime('%A')}."
                elif (self.horario_agendamento < working_hour.horario_inicio or 
                      self.horario_agendamento >= working_hour.horario_fim):
                    errors['horario_agendamento'] = f"Horário fora do funcionamento ({working_hour.horario_inicio} às {working_hour.horario_fim})."
            except WorkingHours.DoesNotExist:
                errors['data_agendamento'] = "Horário de funcionamento não configurado para este dia."
        
        # 3. Validar feriados
        if self.data_agendamento:
            holiday = Holiday.objects.filter(data=self.data_agendamento).first()
            if holiday:
                errors['data_agendamento'] = f"Não é possível agendar no feriado: {holiday.nome}."
        
        # 4. Validar sobreposição de horários (considerando duração dos serviços)
        if self.data_agendamento and self.horario_agendamento:
            overlapping_appointments = self._get_overlapping_appointments()
            if overlapping_appointments:
                errors['horario_agendamento'] = "Conflito de horário com outro agendamento."
        
        # 5. Validar limite de agendamentos por cliente por dia
        if self.usuario and self.data_agendamento:
            same_day_appointments = Appointment.objects.filter(
                usuario=self.usuario,
                data_agendamento=self.data_agendamento,
                situacao__in=['pending', 'confirmed', 'in_progress']
            )
            if self.pk:
                same_day_appointments = same_day_appointments.exclude(pk=self.pk)
            
            if same_day_appointments.count() >= 2:  # Máximo 2 agendamentos por dia
                errors['data_agendamento'] = "Cliente já possui agendamentos suficientes para este dia."
        
        if errors:
            raise ValidationError(errors)
    
    def _get_overlapping_appointments(self):
        """Verifica se há sobreposição com outros agendamentos considerando duração"""
        if not (self.data_agendamento and self.horario_agendamento):
            return None
        
        # Estimar duração total dos serviços deste agendamento
        total_duration = 60  # Padrão: 60 minutos
        
        if self.pk:  # Se agendamento já existe, pegar serviços reais
            try:
                appointment_services = AppointmentService.objects.filter(agendamento=self)
                if appointment_services.exists():
                    total_duration = sum(
                        service.servico.duracao_minutos or 60 
                        for service in appointment_services
                    )
            except:
                pass
        
        # Calcular janela de tempo deste agendamento
        start_datetime = datetime.combine(self.data_agendamento, self.horario_agendamento)
        end_datetime = start_datetime + timedelta(minutes=total_duration)
        
        # Buscar agendamentos que podem conflitar
        conflicting_appointments = Appointment.objects.filter(
            data_agendamento=self.data_agendamento,
            situacao__in=['pending', 'confirmed', 'in_progress']
        )
        
        if self.pk:
            conflicting_appointments = conflicting_appointments.exclude(pk=self.pk)
        
        # Verificar sobreposição real
        for other_apt in conflicting_appointments:
            # Estimar duração do outro agendamento
            other_duration = 60
            try:
                other_services = AppointmentService.objects.filter(agendamento=other_apt)
                if other_services.exists():
                    other_duration = sum(
                        service.servico.duracao_minutos or 60 
                        for service in other_services
                    )
            except:
                pass
            
            # Calcular janela do outro agendamento
            other_start = datetime.combine(other_apt.data_agendamento, other_apt.horario_agendamento)
            other_end = other_start + timedelta(minutes=other_duration)
            
            # Verificar sobreposição
            if (start_datetime < other_end and end_datetime > other_start):
                return other_apt
        
        return None
    
    def save(self, *args, **kwargs):
        """Salvar com validação"""
        self.full_clean()  # Chama clean() automaticamente
        super().save(*args, **kwargs)


class AppointmentService(models.Model):
    """
    Serviços incluídos em um agendamento (many-to-many)
    """
    agendamento = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='appointment_services', verbose_name='Agendamento')
    servico = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name='Serviço')
    preco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço')
    concluido = models.BooleanField(default=False, verbose_name='Concluído')
    
    class Meta:
        db_table = 'appointments_appointmentservice'
        verbose_name = 'Serviço do Agendamento'
        verbose_name_plural = 'Serviços dos Agendamentos'
        unique_together = ['agendamento', 'servico']
    
    def __str__(self):
        return f"{self.agendamento} - {self.servico.nome}"


class AppointmentReview(models.Model):
    """
    Avaliação do cliente sobre o agendamento
    """
    agendamento = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='review', verbose_name='Agendamento')
    avaliacao = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Avaliação (1-5)'
    )
    comentario = models.TextField(blank=True, null=True, verbose_name='Comentário')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    
    class Meta:
        db_table = 'appointments_appointmentreview'
        verbose_name = 'Avaliação do Agendamento'
        verbose_name_plural = 'Avaliações dos Agendamentos'
    
    def __str__(self):
        return f"Avaliação {self.avaliacao}/5 - {self.agendamento}"


class WorkingHours(models.Model):
    """
    Horários de funcionamento
    """
    WEEKDAY_CHOICES = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    dia_semana = models.IntegerField(choices=WEEKDAY_CHOICES, unique=True, verbose_name='Dia da Semana')
    horario_inicio = models.TimeField(verbose_name='Horário de Início')
    horario_fim = models.TimeField(verbose_name='Horário de Término')
    aberto = models.BooleanField(default=True, verbose_name='Está Aberto')
    
    class Meta:
        db_table = 'appointments_workinghours'
        verbose_name = 'Horário de Funcionamento'
        verbose_name_plural = 'Horários de Funcionamento'
        ordering = ['dia_semana']
    
    def __str__(self):
        weekday_name = dict(self.WEEKDAY_CHOICES)[self.dia_semana]
        if self.aberto:
            return f"{weekday_name}: {self.horario_inicio} - {self.horario_fim}"
        return f"{weekday_name}: Fechado"


class Holiday(models.Model):
    """
    Feriados e dias em que não haverá atendimento
    """
    data = models.DateField(unique=True, verbose_name='Data')
    nome = models.CharField(max_length=100, verbose_name='Nome do Feriado')
    recorrente = models.BooleanField(default=False, verbose_name='Recorrente Anualmente')
    
    class Meta:
        db_table = 'appointments_holiday'
        verbose_name = 'Feriado'
        verbose_name_plural = 'Feriados'
        ordering = ['data']
    
    def __str__(self):
        return f"{self.nome} - {self.data}"

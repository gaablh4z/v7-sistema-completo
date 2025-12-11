from django.db import models
from django.utils import timezone


class ServiceCategory(models.Model):
    """
    Categoria de serviços (Lavagem, Enceramento, etc.)
    """
    nome = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    
    class Meta:
        db_table = 'services_servicecategory'
        verbose_name = 'Categoria de Serviço'
        verbose_name_plural = 'Categorias de Serviços'
        ordering = ['nome']
    
    def __str__(self):
        return self.nome


class Service(models.Model):
    """
    Modelo para serviços oferecidos
    """
    categoria = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services', verbose_name='Categoria')
    nome = models.CharField(max_length=100, verbose_name='Nome')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    preco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço')
    duracao_minutos = models.IntegerField(verbose_name='Duração (minutos)')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    # Campos para diferentes tipos de veículos
    aplica_sedan = models.BooleanField(default=True, verbose_name='Aplica-se a Sedan/Hatch')
    aplica_suv = models.BooleanField(default=True, verbose_name='Aplica-se a SUV')
    aplica_pickup = models.BooleanField(default=True, verbose_name='Aplica-se a Pickup/Van')
    aplica_moto = models.BooleanField(default=False, verbose_name='Aplica-se a Motocicleta')
    
    class Meta:
        db_table = 'services_service'
        verbose_name = 'Serviço'
        verbose_name_plural = 'Serviços'
        ordering = ['categoria', 'nome']
    
    def __str__(self):
        return f"{self.nome} - R$ {self.preco}"
    
    def is_available_for_vehicle(self, vehicle_category):
        """
        Verifica se o serviço está disponível para o tipo de veículo
        """
        mapping = {
            'sedan': self.aplica_sedan,
            'hatch': self.aplica_sedan,  # Hatch usa as mesmas regras de sedan
            'suv': self.aplica_suv,
            'pickup': self.aplica_pickup,
            'van': self.aplica_pickup,  # Van usa as mesmas regras de pickup
            'motorcycle': self.aplica_moto,
        }
        return mapping.get(vehicle_category, True)


class ServiceImage(models.Model):
    """
    Imagens dos serviços para exibição
    """
    servico = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images', verbose_name='Serviço')
    imagem = models.ImageField(upload_to='services/images/', verbose_name='Imagem')
    descricao = models.CharField(max_length=200, blank=True, null=True, verbose_name='Descrição')
    principal = models.BooleanField(default=False, verbose_name='Imagem principal')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    
    class Meta:
        db_table = 'services_serviceimage'
        verbose_name = 'Imagem do Serviço'
        verbose_name_plural = 'Imagens dos Serviços'
    
    def __str__(self):
        return f"Imagem de {self.servico.nome}"

from django.contrib import admin
from .models import Appointment, AppointmentService, AppointmentReview, WorkingHours, Holiday
from core.admin import admin_site  # Importa o site admin customizado


class AppointmentServiceInline(admin.TabularInline):
    """
    Inline para serviços de um agendamento
    """
    model = AppointmentService
    extra = 1


class AppointmentAdmin(admin.ModelAdmin):
    """
    Admin para agendamentos
    """
    list_display = ('usuario', 'veiculo', 'data_agendamento', 'horario_agendamento', 'situacao', 'preco_total', 'posicao_fila')
    list_filter = ('situacao', 'data_agendamento', 'criado_em')
    search_fields = ('usuario__email', 'usuario__first_name', 'usuario__last_name', 'veiculo__placa', 'veiculo__marca', 'veiculo__modelo')
    ordering = ('-data_agendamento', '-horario_agendamento')
    readonly_fields = ('criado_em', 'atualizado_em')
    inlines = [AppointmentServiceInline]
    
    fieldsets = (
        ('Informações do Agendamento', {
            'fields': ('usuario', 'veiculo', 'data_agendamento', 'horario_agendamento', 'situacao', 'posicao_fila')
        }),
        ('Detalhes Financeiros', {
            'fields': ('preco_total',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Controle de Tempo', {
            'fields': ('iniciado_em', 'concluido_em')
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )


class AppointmentServiceAdmin(admin.ModelAdmin):
    """
    Admin para serviços dos agendamentos
    """
    list_display = ('agendamento', 'servico', 'preco', 'concluido')
    list_filter = ('concluido', 'servico__categoria')
    search_fields = ('agendamento__usuario__email', 'servico__nome')
    ordering = ('-agendamento__data_agendamento',)


class AppointmentReviewAdmin(admin.ModelAdmin):
    """
    Admin para avaliações dos agendamentos
    """
    list_display = ('agendamento', 'avaliacao', 'criada_em')
    list_filter = ('avaliacao', 'criada_em')
    search_fields = ('agendamento__usuario__email', 'comentario')
    ordering = ('-criada_em',)
    readonly_fields = ('criada_em',)


class WorkingHoursAdmin(admin.ModelAdmin):
    """
    Admin para horários de funcionamento
    """
    list_display = ('get_dia_semana_display', 'horario_inicio', 'horario_fim', 'aberto')
    list_filter = ('aberto',)
    ordering = ('dia_semana',)


class HolidayAdmin(admin.ModelAdmin):
    """
    Admin para feriados
    """
    list_display = ('nome', 'data', 'recorrente')
    list_filter = ('recorrente', 'data')
    search_fields = ('nome',)
    ordering = ('data',)


# Registra no site admin customizado
admin_site.register(Appointment, AppointmentAdmin)
admin_site.register(AppointmentReview, AppointmentReviewAdmin)  
admin_site.register(WorkingHours, WorkingHoursAdmin)
admin_site.register(Holiday, HolidayAdmin)

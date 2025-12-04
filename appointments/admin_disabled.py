from django.contrib import admin
from .models import Appointment, AppointmentService, AppointmentReview, WorkingHours, Holiday


class AppointmentServiceInline(admin.TabularInline):
    """
    Inline para serviços de um agendamento
    """
    model = AppointmentService
    extra = 1


@admin.register(Appointment)
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


@admin.register(AppointmentService)
class AppointmentServiceAdmin(admin.ModelAdmin):
    """
    Admin para serviços dos agendamentos
    """
    list_display = ('agendamento', 'servico', 'preco', 'concluido')
    list_filter = ('concluido', 'servico__categoria')
    search_fields = ('agendamento__usuario__email', 'servico__nome')
    ordering = ('-agendamento__data_agendamento',)


@admin.register(AppointmentReview)
class AppointmentReviewAdmin(admin.ModelAdmin):
    """
    Admin para avaliações dos agendamentos
    """
    list_display = ('agendamento', 'avaliacao', 'criado_em')
    list_filter = ('avaliacao', 'criado_em')
    search_fields = ('agendamento__usuario__email', 'comentario')
    ordering = ('-criado_em',)
    readonly_fields = ('criado_em',)


@admin.register(WorkingHours)
class WorkingHoursAdmin(admin.ModelAdmin):
    """
    Admin para horários de funcionamento
    """
    list_display = ('get_dia_semana_display', 'horario_inicio', 'horario_fim', 'aberto')
    list_filter = ('aberto',)
    ordering = ('dia_semana',)


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    """
    Admin para feriados
    """
    list_display = ('nome', 'data', 'recorrente')
    list_filter = ('recorrente', 'data')
    search_fields = ('nome',)
    ordering = ('data',)

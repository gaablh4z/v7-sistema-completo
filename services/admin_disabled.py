from django.contrib import admin
from .models import ServiceCategory, Service, ServiceImage


class ServiceImageInline(admin.TabularInline):
    """
    Inline para imagens de serviços
    """
    model = ServiceImage
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    """
    Admin para categorias de serviços
    """
    list_display = ('nome', 'ativa', 'criada_em')
    list_filter = ('ativa', 'criada_em')
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)
    readonly_fields = ('criada_em',)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """
    Admin para serviços
    """
    list_display = ('nome', 'categoria', 'preco', 'duracao_minutos', 'ativo', 'criado_em')
    list_filter = ('categoria', 'ativo', 'aplica_sedan', 'aplica_suv', 'aplica_pickup', 'aplica_moto', 'criado_em')
    search_fields = ('nome', 'descricao', 'categoria__nome')
    ordering = ('categoria', 'nome')
    readonly_fields = ('criado_em', 'atualizado_em')
    inlines = [ServiceImageInline]
    
    fieldsets = (
        ('Informações do Serviço', {
            'fields': ('categoria', 'nome', 'descricao', 'preco', 'duracao_minutos', 'ativo')
        }),
        ('Aplicabilidade por Tipo de Veículo', {
            'fields': ('aplica_sedan', 'aplica_suv', 'aplica_pickup', 'aplica_moto')
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens de serviços
    """
    list_display = ('servico', 'descricao', 'principal', 'criada_em')
    list_filter = ('principal', 'criada_em')
    search_fields = ('servico__nome', 'descricao')
    ordering = ('-criada_em',)

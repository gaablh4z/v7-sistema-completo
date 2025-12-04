from django.contrib import admin
from .models import Vehicle, VehicleImage
from core.admin import admin_site


class VehicleImageInline(admin.TabularInline):
    """
    Inline para imagens de veículos
    """
    model = VehicleImage
    extra = 1
    readonly_fields = ('criada_em',)


class VehicleAdmin(admin.ModelAdmin):
    """
    Admin para veículos
    """
    list_display = ('placa', 'marca', 'modelo', 'ano', 'cor', 'usuario', 'categoria', 'ativo', 'criado_em')
    list_filter = ('marca', 'categoria', 'ano', 'ativo', 'criado_em')
    search_fields = ('placa', 'marca', 'modelo', 'usuario__email', 'usuario__first_name', 'usuario__last_name')
    ordering = ('-criado_em',)
    readonly_fields = ('criado_em', 'atualizado_em')
    inlines = [VehicleImageInline]
    
    fieldsets = (
        ('Informações do Veículo', {
            'fields': ('usuario', 'marca', 'modelo', 'ano', 'cor', 'placa', 'categoria')
        }),
        ('Detalhes Adicionais', {
            'fields': ('quilometragem', 'ativo')
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )


class VehicleImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens de veículos
    """
    list_display = ('veiculo', 'descricao', 'principal', 'criada_em')
    list_filter = ('principal', 'criada_em')
    search_fields = ('veiculo__placa', 'veiculo__marca', 'veiculo__modelo', 'descricao')
    ordering = ('-criada_em',)


# Registra no site admin customizado
admin_site.register(Vehicle, VehicleAdmin)
admin_site.register(VehicleImage, VehicleImageAdmin)
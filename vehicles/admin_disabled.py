from django.contrib import admin
from .models import Vehicle, VehicleImage


class VehicleImageInline(admin.TabularInline):
    """
    Inline para imagens de veículos
    """
    model = VehicleImage
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """
    Admin para veículos
    """
    list_display = ('plate', 'make', 'model', 'year', 'color', 'user', 'category', 'is_active', 'created_at')
    list_filter = ('make', 'category', 'year', 'is_active', 'created_at')
    search_fields = ('plate', 'make', 'model', 'user__email', 'user__first_name', 'user__last_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [VehicleImageInline]
    
    fieldsets = (
        ('Informações do Veículo', {
            'fields': ('user', 'make', 'model', 'year', 'color', 'plate', 'category')
        }),
        ('Detalhes Adicionais', {
            'fields': ('mileage', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VehicleImage)
class VehicleImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens de veículos
    """
    list_display = ('vehicle', 'description', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('vehicle__plate', 'vehicle__make', 'vehicle__model', 'description')
    ordering = ('-created_at',)

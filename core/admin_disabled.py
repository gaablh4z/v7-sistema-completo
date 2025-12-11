from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, Notification, GalleryImage, ServiceImage, HeroImage, HeroBackground, ServiceIcon


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin personalizado para o modelo User
    """
    list_display = ('email', 'first_name', 'last_name', 'funcao', 'ativo', 'criado_em')
    list_filter = ('funcao', 'ativo', 'is_staff', 'criado_em')
    search_fields = ('email', 'first_name', 'last_name', 'telefone')
    ordering = ('-criado_em',)
    
    fieldsets = list(BaseUserAdmin.fieldsets) + [
        ('Informações Adicionais', {
            'fields': ('telefone', 'funcao', 'data_nascimento', 'endereco', 'pontos_fidelidade')
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    ]
    
    readonly_fields = ('criado_em', 'atualizado_em')
    
    add_fieldsets = list(BaseUserAdmin.add_fieldsets) + [
        ('Informações Adicionais', {
            'fields': ('email', 'telefone', 'funcao', 'first_name', 'last_name')
        }),
    ]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """
    Admin para notificações
    """
    list_display = ('titulo', 'usuario', 'tipo', 'lida', 'criada_em')
    list_filter = ('tipo', 'lida', 'criada_em')
    search_fields = ('titulo', 'mensagem', 'usuario__email', 'usuario__first_name', 'usuario__last_name')
    ordering = ('-criada_em',)
    readonly_fields = ('criada_em',)


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens da galeria
    """
    list_display = ('titulo', 'categoria', 'image_preview', 'destacada', 'ativa', 'ordem', 'criada_em')
    list_filter = ('categoria', 'destacada', 'ativa', 'criada_em')
    search_fields = ('titulo', 'descricao', 'texto_alternativo')
    ordering = ('ordem', '-criada_em')
    readonly_fields = ('criada_em', 'atualizada_em', 'image_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'texto_alternativo')
        }),
        ('Imagem', {
            'fields': ('imagem', 'image_preview')
        }),
        ('Configurações', {
            'fields': ('categoria', 'destacada', 'ativa', 'ordem')
        }),
        ('Timestamps', {
            'fields': ('criada_em', 'atualizada_em'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.imagem:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 150px;" />',
                obj.imagem.url
            )
        return "Sem imagem"
    image_preview.short_description = "Preview"


@admin.register(ServiceImage)
class ServiceImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens de serviços
    """
    list_display = ('titulo', 'tipo_servico', 'image_preview', 'ativa', 'ordem', 'criada_em')
    list_filter = ('tipo_servico', 'ativa', 'criada_em')
    search_fields = ('titulo', 'descricao', 'texto_alternativo')
    ordering = ('ordem', '-criada_em')
    readonly_fields = ('criada_em', 'atualizada_em', 'image_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'texto_alternativo')
        }),
        ('Imagem', {
            'fields': ('imagem', 'image_preview')
        }),
        ('Configurações', {
            'fields': ('tipo_servico', 'ativa', 'ordem')
        }),
        ('Timestamps', {
            'fields': ('criada_em', 'atualizada_em'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.imagem:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 150px;" />',
                obj.imagem.url
            )
        return "Sem imagem"
    image_preview.short_description = "Preview"


@admin.register(HeroImage)
class HeroImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens hero/banner
    """
    list_display = ('titulo', 'image_preview', 'ativa', 'ordem', 'criada_em')
    list_filter = ('ativa', 'criada_em')
    search_fields = ('titulo', 'descricao', 'texto_alternativo')
    ordering = ('ordem', '-criada_em')
    readonly_fields = ('criada_em', 'atualizada_em', 'image_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'texto_alternativo')
        }),
        ('Imagem', {
            'fields': ('imagem', 'image_preview')
        }),
        ('Configurações', {
            'fields': ('ativa', 'ordem')
        }),
        ('Timestamps', {
            'fields': ('criada_em', 'atualizada_em'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.imagem:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 150px;" />',
                obj.imagem.url
            )
        return "Sem imagem"
    image_preview.short_description = "Preview"


@admin.register(HeroBackground)
class HeroBackgroundAdmin(admin.ModelAdmin):
    """
    Admin para imagens de background do hero com transparência
    """
    list_display = ('title', 'background_preview', 'transparency_display', 'blur_effect', 'is_active', 'order', 'created_at')
    list_filter = ('transparency', 'blur_effect', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'alt_text')
    ordering = ('order', '-created_at')
    readonly_fields = ('created_at', 'updated_at', 'background_preview', 'css_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'alt_text')
        }),
        ('Imagem de Background', {
            'fields': ('background_image', 'background_preview')
        }),
        ('Efeitos Visuais', {
            'fields': ('transparency', 'blur_effect', 'css_preview'),
            'description': 'Configure a aparência da imagem de background'
        }),
        ('Configurações', {
            'fields': ('is_active', 'order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def background_preview(self, obj):
        if obj.background_image:
            return format_html(
                '<div style="position: relative; display: inline-block;">'
                '<img src="{}" style="max-height: 100px; max-width: 150px; opacity: {}; filter: {};" />'
                '<div style="position: absolute; bottom: 0; left: 0; background: rgba(0,0,0,0.7); color: white; padding: 2px 5px; font-size: 10px;">'
                'Transparência: {}%</div>'
                '</div>',
                obj.background_image.url,
                obj.css_opacity,
                obj.css_blur,
                int(obj.transparency * 100)
            )
        return "Sem imagem"
    background_preview.short_description = "Preview com Efeitos"
    
    def transparency_display(self, obj):
        return f"{int(obj.transparency * 100)}%"
    transparency_display.short_description = "Transparência"
    
    def css_preview(self, obj):
        if obj.background_image:
            return format_html(
                '<div style="font-family: monospace; background: #f8f9fa; padding: 10px; border-radius: 4px;">'
                '<strong>CSS gerado:</strong><br>'
                'opacity: {};<br>'
                'filter: {};<br>'
                '</div>',
                obj.css_opacity,
                obj.css_blur
            )
        return "Nenhum CSS gerado"
    css_preview.short_description = "Pré-visualização CSS"


@admin.register(ServiceIcon)
class ServiceIconAdmin(admin.ModelAdmin):
    """
    Admin para ícones personalizados dos serviços
    """
    list_display = ('title', 'service_type', 'icon_preview', 'badge_display', 'price_display', 'is_active', 'order')
    list_filter = ('service_type', 'badge', 'card_color', 'is_active')
    search_fields = ('title', 'description', 'service_type')
    ordering = ('order', 'service_type')
    readonly_fields = ('created_at', 'updated_at', 'icon_preview', 'card_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('service_type', 'title', 'description', 'price_from')
        }),
        ('Ícone e Visual', {
            'fields': ('custom_icon', 'icon_preview', 'fallback_icon', 'card_color'),
            'description': 'Configure o ícone e aparência do card'
        }),
        ('Badge e Destaque', {
            'fields': ('badge', 'card_preview'),
            'description': 'Adicione badges para destacar serviços especiais'
        }),
        ('Configurações', {
            'fields': ('is_active', 'order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def icon_preview(self, obj):
        if obj.custom_icon:
            return format_html(
                '<div style="display: flex; align-items: center; gap: 10px;">'
                '<img src="{}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" />'
                '<span>Ícone Personalizado</span>'
                '</div>',
                obj.custom_icon.url
            )
        else:
            return format_html(
                '<div style="display: flex; align-items: center; gap: 10px;">'
                '<div style="width: 32px; height: 32px; background: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px;">📷</div>'
                '<span>Ícone padrão: {}</span>'
                '</div>',
                obj.fallback_icon
            )
    icon_preview.short_description = "Preview do Ícone"
    
    def badge_display(self, obj):
        if obj.badge != 'none' and obj.badge_config:
            return format_html(
                '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold;">{}</span>',
                obj.badge_config['color'].replace('bg-', '#').replace('blue-500', '3b82f6').replace('yellow-500', 'eab308').replace('green-500', '22c55e').replace('red-500', 'ef4444'),
                obj.badge_config['text']
            )
        return "Nenhum"
    badge_display.short_description = "Badge"
    
    def price_display(self, obj):
        return obj.formatted_price
    price_display.short_description = "Preço"
    
    def card_preview(self, obj):
        badge_html = ""
        if obj.badge != 'none' and obj.badge_config:
            badge_html = f'<div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: {obj.badge_config["color"].replace("bg-", "#").replace("blue-500", "#3b82f6").replace("yellow-500", "#eab308").replace("green-500", "#22c55e").replace("red-500", "#ef4444")}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold;">{obj.badge_config["text"]}</div>'
        
        icon_html = ""
        if obj.custom_icon:
            icon_html = f'<img src="{obj.custom_icon.url}" style="width: 32px; height: 32px; object-fit: cover;" />'
        else:
            icon_html = f'<div style="width: 32px; height: 32px; background: #3b82f6; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📷</div>'
        
        return format_html(
            '<div style="position: relative; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; width: 250px; text-align: center;">'
            '{}'
            '<div style="margin-bottom: 12px;">{}</div>'
            '<h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">{}</h4>'
            '<p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b; line-height: 1.4;">{}</p>'
            '<div style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; display: inline-block;">{}</div>'
            '</div>',
            badge_html,
            icon_html,
            obj.title,
            obj.description[:50] + "..." if len(obj.description) > 50 else obj.description,
            obj.formatted_price
        )
    card_preview.short_description = "Preview do Card"

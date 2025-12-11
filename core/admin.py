from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import path, reverse
from django.http import HttpResponseRedirect
from .models import User, Notification, GalleryImage, ServiceImage, HeroImage, HeroBackground, ServiceIcon

# Importa views customizadas
from .admin_custom_views import cadastrar_funcionario_view


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin personalizado para o modelo User
    """
    list_display = ('email', 'first_name', 'last_name', 'funcao_badge', 'ativo', 'criado_em')
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
    
    add_fieldsets = [
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'email', 'telefone')
        }),
        ('Função e Permissões', {
            'fields': ('funcao', 'is_staff', 'is_active')
        }),
    ]
    
    def funcao_badge(self, obj):
        """Exibe a função com badge colorido"""
        colors = {
            'admin': 'red',
            'employee': 'blue', 
            'client': 'green'
        }
        color = colors.get(obj.funcao, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">{}</span>',
            color,
            obj.get_funcao_display()
        )
    funcao_badge.short_description = 'Função'
    
    def save_model(self, request, obj, form, change):
        """Override para configurar permissões automaticamente"""
        # Se é um funcionário novo, configura permissões básicas
        if not change and obj.funcao == 'employee':
            obj.is_staff = True
            obj.is_active = True
        
        super().save_model(request, obj, form, change)
        
        # Configura permissões específicas para funcionários
        if obj.funcao == 'employee' and not change:
            # Adiciona ao grupo de funcionários ou cria permissões específicas
            from django.contrib.auth.models import Group, Permission
            from django.contrib.contenttypes.models import ContentType
            
            # Cria ou obtém grupo de funcionários
            funcionarios_group, created = Group.objects.get_or_create(name='Funcionários')
            
            if created:
                # Define permissões para funcionários
                models_permitidos = [
                    'appointment', 'appointmentservice', 'appointmentreview',
                    'vehicle', 'service', 'user'
                ]
                
                for model_name in models_permitidos:
                    try:
                        content_type = ContentType.objects.get(model=model_name.lower())
                        permissions = Permission.objects.filter(content_type=content_type)
                        for perm in permissions:
                            funcionarios_group.permissions.add(perm)
                    except ContentType.DoesNotExist:
                        continue
            
            # Adiciona usuário ao grupo
            obj.groups.add(funcionarios_group)
    
    def get_form(self, request, obj=None, **kwargs):
        """Customiza o formulário baseado no contexto"""
        form = super().get_form(request, obj, **kwargs)
        
        # Se está criando funcionário via URL especial
        if not obj and 'funcao=employee' in request.META.get('QUERY_STRING', ''):
            if 'funcao' in form.base_fields:
                form.base_fields['funcao'].initial = 'employee'
                form.base_fields['funcao'].help_text = 'Funcionários têm acesso ao sistema administrativo'
            
            if 'is_staff' in form.base_fields:
                form.base_fields['is_staff'].initial = True
                form.base_fields['is_staff'].help_text = 'Permite acesso ao admin (recomendado para funcionários)'
        
        return form


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
    list_display = ('titulo', 'background_preview', 'transparency_display', 'efeito_blur', 'ativa', 'ordem', 'criada_em')
    list_filter = ('transparencia', 'efeito_blur', 'ativa', 'criada_em')
    search_fields = ('titulo', 'descricao', 'texto_alternativo')
    ordering = ('ordem', '-criada_em')
    readonly_fields = ('criada_em', 'atualizada_em', 'background_preview', 'css_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('titulo', 'descricao', 'texto_alternativo')
        }),
        ('Imagem de Background', {
            'fields': ('imagem_fundo', 'background_preview')
        }),
        ('Efeitos Visuais', {
            'fields': ('transparencia', 'efeito_blur', 'css_preview'),
            'description': 'Configure a aparência da imagem de background'
        }),
        ('Configurações', {
            'fields': ('ativa', 'ordem')
        }),
        ('Timestamps', {
            'fields': ('criada_em', 'atualizada_em'),
            'classes': ('collapse',)
        }),
    )
    
    def background_preview(self, obj):
        if obj.imagem_fundo:
            return format_html(
                '<div style="position: relative; display: inline-block;">'
                '<img src="{}" style="max-height: 100px; max-width: 150px; opacity: {}; filter: {};" />'
                '<div style="position: absolute; bottom: 0; left: 0; background: rgba(0,0,0,0.7); color: white; padding: 2px 5px; font-size: 10px;">'
                'Transparência: {}%</div>'
                '</div>',
                obj.imagem_fundo.url,
                obj.css_opacity,
                obj.css_blur,
                int(obj.transparencia * 100)
            )
        return "Sem imagem"
    background_preview.short_description = "Preview com Efeitos"
    
    def transparency_display(self, obj):
        return f"{int(obj.transparencia * 100)}%"
    transparency_display.short_description = "Transparência"
    
    def css_preview(self, obj):
        if obj.imagem_fundo:
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
    list_display = ('titulo', 'tipo_servico', 'icon_preview', 'badge_display', 'price_display', 'ativo', 'ordem')
    list_filter = ('tipo_servico', 'badge', 'cor_card', 'ativo')
    search_fields = ('titulo', 'descricao', 'tipo_servico')
    ordering = ('ordem', 'tipo_servico')
    readonly_fields = ('criado_em', 'atualizado_em', 'icon_preview', 'card_preview')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('tipo_servico', 'titulo', 'descricao', 'preco_a_partir_de')
        }),
        ('Ícone e Visual', {
            'fields': ('icone_personalizado', 'icon_preview', 'icone_fallback', 'cor_card'),
            'description': 'Configure o ícone e aparência do card'
        }),
        ('Badge e Destaque', {
            'fields': ('badge', 'card_preview'),
            'description': 'Adicione badges para destacar serviços especiais'
        }),
        ('Configurações', {
            'fields': ('ativo', 'ordem')
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
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


# Customiza o AdminSite para adicionar URLs personalizadas
class AutoV7AdminSite(admin.AdminSite):
    site_header = "AutoV7 - Administração"
    site_title = "AutoV7 Admin"
    index_title = "Painel Administrativo AutoV7"
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('cadastrar-funcionario/', self.admin_view(cadastrar_funcionario_view), name='cadastrar_funcionario'),
        ]
        return custom_urls + urls

# Substitui o site admin padrão
admin_site = AutoV7AdminSite(name='autov7_admin')

# Re-registra todos os modelos no site customizado
admin_site.register(User, UserAdmin)
admin_site.register(Notification, NotificationAdmin)
admin_site.register(GalleryImage, GalleryImageAdmin)
admin_site.register(ServiceImage, ServiceImageAdmin)
admin_site.register(HeroImage, HeroImageAdmin)
admin_site.register(HeroBackground, HeroBackgroundAdmin)
admin_site.register(ServiceIcon, ServiceIconAdmin)

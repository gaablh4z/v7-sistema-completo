from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from decimal import Decimal


class User(AbstractUser):
    """
    Modelo de usuário customizado para o sistema AutoV7
    """
    ROLE_CHOICES = [
        ('client', 'Cliente'),
        ('admin', 'Administrador'),
        ('employee', 'Funcionário'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='E-mail')
    telefone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Telefone')
    funcao = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client', verbose_name='Função')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    
    # Campos específicos para clientes
    data_nascimento = models.DateField(blank=True, null=True, verbose_name='Data de nascimento')
    endereco = models.TextField(blank=True, null=True, verbose_name='Endereço')
    pontos_fidelidade = models.IntegerField(default=0, verbose_name='Pontos de fidelidade')
    foto_perfil = models.ImageField(upload_to='profile_pics/', blank=True, null=True, verbose_name='Foto do perfil')
    avaliacao_media = models.DecimalField(max_digits=3, decimal_places=1, default=Decimal('0.0'), verbose_name='Avaliação média')
    total_servicos = models.IntegerField(default=0, verbose_name='Total de serviços')
    
    # Preferências de marketing e comunicação
    aceita_marketing = models.BooleanField(default=False, verbose_name='Aceita marketing')
    email_verificado = models.BooleanField(default=False, verbose_name='E-mail verificado')
    ultimo_ip_login = models.GenericIPAddressField(blank=True, null=True, verbose_name='Último IP de login')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'core_user'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_client(self):
        return self.funcao == 'client'
    
    def is_admin(self):
        return self.funcao == 'admin'
    
    def is_employee(self):
        return self.funcao == 'employee'


class Notification(models.Model):
    """
    Modelo para notificações do sistema
    """
    TYPE_CHOICES = [
        ('appointment', 'Agendamento'),
        ('reminder', 'Lembrete'),
        ('promotion', 'Promoção'),
        ('system', 'Sistema'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name='Usuário')
    titulo = models.CharField(max_length=200, verbose_name='Título')
    mensagem = models.TextField(verbose_name='Mensagem')
    tipo = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system', verbose_name='Tipo')
    lida = models.BooleanField(default=False, verbose_name='Lida')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    
    class Meta:
        db_table = 'core_notification'
        ordering = ['-criada_em']
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'
    
    def __str__(self):
        return f"{self.titulo} - {self.usuario.full_name}"


class GalleryImage(models.Model):
    """
    Modelo para gerenciar imagens da galeria
    """
    CATEGORY_CHOICES = [
        ('work', 'Trabalho Realizado'),
        ('before_after', 'Antes e Depois'),
        ('vehicle', 'Veículo'),
        ('detail', 'Detalhe'),
    ]
    
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    imagem = models.ImageField(upload_to='gallery/', verbose_name='Imagem')
    categoria = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='work', verbose_name='Categoria')
    texto_alternativo = models.CharField(max_length=200, verbose_name='Texto alternativo')
    destacada = models.BooleanField(default=False, verbose_name='Destacada')
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem de exibição')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    atualizada_em = models.DateTimeField(auto_now=True, verbose_name='Atualizada em')
    
    class Meta:
        db_table = 'core_gallery_image'
        ordering = ['ordem', '-criada_em']
        verbose_name = 'Imagem da Galeria'
        verbose_name_plural = 'Imagens da Galeria'
    
    def __str__(self):
        return self.titulo


class ServiceImage(models.Model):
    """
    Modelo para gerenciar imagens dos serviços
    """
    SERVICE_TYPE_CHOICES = [
        ('washing', 'Lavagem'),
        ('detailing', 'Detalhamento'),
        ('polishing', 'Polimento'),
        ('ceramic', 'Proteção Cerâmica'),
        ('wheel_cleaning', 'Limpeza de Rodas'),
        ('interior', 'Limpeza Interna'),
        ('waxing', 'Enceramento'),
        ('other', 'Outro'),
    ]
    
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    imagem = models.ImageField(upload_to='services/', verbose_name='Imagem')
    tipo_servico = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES, verbose_name='Tipo de Serviço')
    texto_alternativo = models.CharField(max_length=200, verbose_name='Texto alternativo')
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem de exibição')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    atualizada_em = models.DateTimeField(auto_now=True, verbose_name='Atualizada em')
    
    class Meta:
        db_table = 'core_service_image'
        ordering = ['ordem', '-criada_em']
        verbose_name = 'Imagem de Serviço'
        verbose_name_plural = 'Imagens de Serviços'
    
    def __str__(self):
        return f"{self.titulo} - {dict(self.SERVICE_TYPE_CHOICES).get(self.tipo_servico, self.tipo_servico)}"


class HeroImage(models.Model):
    """
    Modelo para gerenciar imagens do hero/banner principal
    """
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    imagem = models.ImageField(upload_to='hero/', verbose_name='Imagem')
    texto_alternativo = models.CharField(max_length=200, verbose_name='Texto alternativo')
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem de exibição')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    atualizada_em = models.DateTimeField(auto_now=True, verbose_name='Atualizada em')
    
    class Meta:
        db_table = 'core_hero_image'
        ordering = ['ordem', '-criada_em']
        verbose_name = 'Imagem Hero'
        verbose_name_plural = 'Imagens Hero'
    
    def __str__(self):
        return self.titulo


class HeroBackground(models.Model):
    """
    Modelo para gerenciar imagem de background do hero com transparência
    """
    TRANSPARENCY_CHOICES = [
        (0.1, '10% - Muito sutil'),
        (0.2, '20% - Sutil'),
        (0.3, '30% - Leve'),
        (0.4, '40% - Moderado'),
        (0.5, '50% - Meio termo'),
        (0.6, '60% - Visível'),
        (0.7, '70% - Forte'),
        (0.8, '80% - Muito forte'),
        (0.9, '90% - Quase opaco'),
        (1.0, '100% - Totalmente opaco'),
    ]
    
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    imagem_fundo = models.ImageField(upload_to='hero/backgrounds/', verbose_name='Imagem de Background')
    texto_alternativo = models.CharField(max_length=200, verbose_name='Texto alternativo')
    transparencia = models.FloatField(
        choices=TRANSPARENCY_CHOICES, 
        default=0.3, 
        verbose_name='Transparência',
        help_text='Controla a opacidade da imagem de background'
    )
    efeito_blur = models.BooleanField(default=False, verbose_name='Efeito Blur', help_text='Aplica desfoque na imagem')
    ativa = models.BooleanField(default=True, verbose_name='Ativa')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem de exibição')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    atualizada_em = models.DateTimeField(auto_now=True, verbose_name='Atualizada em')
    
    class Meta:
        db_table = 'core_hero_background'
        ordering = ['ordem', '-criada_em']
        verbose_name = 'Hero Background'
        verbose_name_plural = 'Hero Backgrounds'
    
    def __str__(self):
        return f"{self.titulo} (Transparência: {int(self.transparencia * 100)}%)"
    
    @property
    def css_opacity(self):
        """Retorna o valor de opacidade para CSS"""
        return self.transparencia
    
    @property
    def css_blur(self):
        """Retorna o valor de blur para CSS"""
        return 'blur(2px)' if self.efeito_blur else 'none'


class ServiceIcon(models.Model):
    """
    Modelo para gerenciar ícones personalizados dos serviços
    """
    SERVICE_TYPES = [
        ('washing', 'Lavagem Detalhada'),
        ('polishing', 'Polimento Profissional'),
        ('ceramic', 'Proteção Cerâmica'),
        ('interior', 'Higienização Interna'),
        ('headlight', 'Revitalização de Faróis'),
        ('leather', 'Hidratação de Couro'),
        ('wheel_cleaning', 'Limpeza de Rodas'),
        ('detailing', 'Detalhamento'),
        ('waxing', 'Enceramento'),
        ('other', 'Outro'),
    ]
    
    BADGE_CHOICES = [
        ('none', 'Nenhum'),
        ('popular', 'Mais Popular'),
        ('premium', 'Premium'),
        ('new', 'Novo'),
        ('promocao', 'Promoção'),
    ]
    
    tipo_servico = models.CharField(
        max_length=20, 
        choices=SERVICE_TYPES, 
        unique=True,
        verbose_name='Tipo de Serviço'
    )
    titulo = models.CharField(max_length=100, verbose_name='Título do Serviço')
    descricao = models.TextField(verbose_name='Descrição do Serviço')
    preco_apartir = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        verbose_name='Preço A Partir De (R$)',
        help_text='Preço base do serviço'
    )
    
    # Opções de ícone
    icone_personalizado = models.ImageField(
        upload_to='service_icons/', 
        blank=True, 
        null=True,
        verbose_name='Ícone Personalizado',
        help_text='Imagem pequena (64x64px recomendado) para substituir o ícone padrão'
    )
    icone_fallback = models.CharField(
        max_length=50, 
        default='settings',
        verbose_name='Ícone Fallback',
        help_text='Nome do ícone Lucide para usar se não houver imagem personalizada'
    )
    
    # Visual do card
    badge = models.CharField(
        max_length=20,
        choices=BADGE_CHOICES,
        default='none',
        verbose_name='Badge do Card'
    )
    cor_card = models.CharField(
        max_length=20,
        default='blue',
        verbose_name='Cor do Card',
        choices=[
            ('blue', 'Azul'),
            ('green', 'Verde'),
            ('purple', 'Roxo'),
            ('orange', 'Laranja'),
            ('red', 'Vermelho'),
            ('teal', 'Verde-água'),
        ]
    )
    
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    ordem = models.PositiveIntegerField(default=0, verbose_name='Ordem de Exibição')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'core_service_icon'
        ordering = ['ordem', 'tipo_servico']
        verbose_name = 'Ícone de Serviço'
        verbose_name_plural = 'Ícones de Serviços'
    
    def __str__(self):
        return f"{self.titulo} ({dict(self.SERVICE_TYPES).get(self.tipo_servico)})"
    
    @property
    def has_custom_icon(self):
        """Verifica se há ícone personalizado"""
        return bool(self.icone_personalizado)
    
    @property
    def icon_url(self):
        """Retorna URL do ícone personalizado ou None"""
        return self.icone_personalizado.url if self.icone_personalizado else None
    
    @property
    def badge_config(self):
        """Retorna configuração do badge"""
        badge_configs = {
            'popular': {'text': 'MAIS POPULAR', 'color': 'bg-blue-500'},
            'premium': {'text': 'PREMIUM', 'color': 'bg-yellow-500'},
            'new': {'text': 'NOVO', 'color': 'bg-green-500'},
            'promocao': {'text': 'PROMOÇÃO', 'color': 'bg-red-500'},
        }
        return badge_configs.get(self.badge, None)
    
    @property
    def formatted_price(self):
        """Retorna preço formatado"""
        if self.preco_apartir:
            return f"A partir de R$ {self.preco_apartir:.0f}"
        return "Preço sob consulta"

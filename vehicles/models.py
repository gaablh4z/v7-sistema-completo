from django.db import models
from django.utils import timezone
from core.models import User


class Vehicle(models.Model):
    """
    Modelo para veículos dos clientes
    """
    CATEGORY_CHOICES = [
        ('sedan', 'Sedan'),
        ('hatch', 'Hatchback'),
        ('suv', 'SUV'),
        ('pickup', 'Pickup'),
        ('van', 'Van'),
        ('motorcycle', 'Motocicleta'),
        ('other', 'Outro'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles', verbose_name='Proprietário')
    marca = models.CharField(max_length=50, verbose_name='Marca')  # Toyota, Honda, etc.
    modelo = models.CharField(max_length=50, verbose_name='Modelo')  # Corolla, Civic, etc.
    ano = models.IntegerField(verbose_name='Ano')
    cor = models.CharField(max_length=30, verbose_name='Cor')
    placa = models.CharField(max_length=10, unique=True, verbose_name='Placa')
    categoria = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='sedan', verbose_name='Categoria')
    quilometragem = models.IntegerField(blank=True, null=True, verbose_name='Quilometragem')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    
    class Meta:
        db_table = 'vehicles_vehicle'
        verbose_name = 'Veículo'
        verbose_name_plural = 'Veículos'
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"{self.marca} {self.modelo} {self.ano} - {self.placa}"
    
    @property
    def full_name(self):
        return f"{self.marca} {self.modelo} {self.ano}"


class VehicleImage(models.Model):
    """
    Modelo para imagens dos veículos
    """
    veiculo = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images', verbose_name='Veículo')
    imagem = models.ImageField(upload_to='vehicles/images/', verbose_name='Imagem')
    descricao = models.CharField(max_length=200, blank=True, null=True, verbose_name='Descrição')
    principal = models.BooleanField(default=False, verbose_name='Imagem principal')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    
    class Meta:
        db_table = 'vehicles_vehicleimage'
        verbose_name = 'Imagem do Veículo'
        verbose_name_plural = 'Imagens dos Veículos'
    
    def __str__(self):
        return f"Imagem de {self.veiculo}"

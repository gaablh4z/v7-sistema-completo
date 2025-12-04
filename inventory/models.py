from django.db import models
from django.utils import timezone
from decimal import Decimal
from core.models import User


class ProductCategory(models.Model):
    """
    Categoria de produtos para estoque
    """
    nome = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    
    class Meta:
        db_table = 'inventory_productcategory'
        verbose_name = 'Categoria de Produto'
        verbose_name_plural = 'Categorias de Produtos'
        ordering = ['nome']
    
    def __str__(self):
        return self.nome


class Supplier(models.Model):
    """
    Fornecedores de produtos
    """
    nome = models.CharField(max_length=100, verbose_name='Nome')
    pessoa_contato = models.CharField(max_length=100, blank=True, null=True, verbose_name='Pessoa de Contato')
    email = models.EmailField(blank=True, null=True, verbose_name='E-mail')
    telefone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Telefone')
    endereco = models.TextField(blank=True, null=True, verbose_name='Endereço')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    
    class Meta:
        db_table = 'inventory_supplier'
        verbose_name = 'Fornecedor'
        verbose_name_plural = 'Fornecedores'
        ordering = ['nome']
    
    def __str__(self):
        return self.nome


class Product(models.Model):
    """
    Produtos em estoque
    """
    nome = models.CharField(max_length=100, verbose_name='Nome')
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    categoria = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name='products', verbose_name='Categoria')
    fornecedor = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name='Fornecedor')
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name='SKU')
    codigo_barras = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name='Código de Barras')
    
    # Quantidade e preços
    quantidade = models.IntegerField(default=0, verbose_name='Quantidade em Estoque')
    quantidade_minima = models.IntegerField(default=0, verbose_name='Quantidade Mínima')
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço Unitário')
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Preço de Custo')
    
    # Localização e outros dados
    localizacao = models.CharField(max_length=100, blank=True, null=True, verbose_name='Localização no Estoque')
    ativo = models.BooleanField(default=True, verbose_name='Ativo')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'inventory_product'
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['nome']
    
    def __str__(self):
        return f"{self.nome} (Estoque: {self.quantidade})"
    
    @property
    def is_low_stock(self):
        """Verifica se o produto está com estoque baixo"""
        return self.quantidade <= self.quantidade_minima
    
    @property
    def is_out_of_stock(self):
        """Verifica se o produto está sem estoque"""
        return self.quantidade <= 0


class StockMovement(models.Model):
    """
    Movimentações de estoque
    """
    MOVEMENT_TYPE_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
        ('ajuste', 'Ajuste'),
        ('perda', 'Perda'),
        ('transferencia', 'Transferência'),
    ]
    
    produto = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements', verbose_name='Produto')
    tipo = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES, verbose_name='Tipo de Movimentação')
    quantidade = models.IntegerField(verbose_name='Quantidade')
    quantidade_anterior = models.IntegerField(verbose_name='Quantidade Anterior')
    nova_quantidade = models.IntegerField(verbose_name='Nova Quantidade')
    motivo = models.CharField(max_length=200, verbose_name='Motivo')
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Usuário Responsável')
    documento_referencia = models.CharField(max_length=100, blank=True, null=True, verbose_name='Documento de Referência')
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    
    class Meta:
        db_table = 'inventory_stockmovement'
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"{self.produto.nome} - {self.tipo} - {self.quantidade}"


class ProductImage(models.Model):
    """
    Imagens dos produtos
    """
    produto = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name='Produto')
    imagem = models.ImageField(upload_to='products/images/', verbose_name='Imagem')
    descricao = models.CharField(max_length=200, blank=True, null=True, verbose_name='Descrição')
    principal = models.BooleanField(default=False, verbose_name='Imagem principal')
    criada_em = models.DateTimeField(default=timezone.now, verbose_name='Criada em')
    
    class Meta:
        db_table = 'inventory_productimage'
        verbose_name = 'Imagem do Produto'
        verbose_name_plural = 'Imagens dos Produtos'
    
    def __str__(self):
        return f"Imagem de {self.produto.nome}"


class PurchaseOrder(models.Model):
    """
    Ordens de compra para reposição de estoque
    """
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('sent', 'Enviado'),
        ('received', 'Recebido'),
        ('cancelled', 'Cancelado'),
    ]
    
    numero_pedido = models.CharField(max_length=50, unique=True, verbose_name='Número do Pedido')
    fornecedor = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders', verbose_name='Fornecedor')
    situacao = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='Status')
    valor_total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name='Valor Total')
    criado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name='Criado por')
    observacoes = models.TextField(blank=True, null=True, verbose_name='Observações')
    
    criado_em = models.DateTimeField(default=timezone.now, verbose_name='Criado em')
    enviado_em = models.DateTimeField(blank=True, null=True, verbose_name='Enviado em')
    recebido_em = models.DateTimeField(blank=True, null=True, verbose_name='Recebido em')
    
    class Meta:
        db_table = 'inventory_purchaseorder'
        verbose_name = 'Ordem de Compra'
        verbose_name_plural = 'Ordens de Compra'
        ordering = ['-criado_em']
    
    def __str__(self):
        return f"Pedido {self.numero_pedido} - {self.fornecedor.nome}"


class PurchaseOrderItem(models.Model):
    """
    Itens de uma ordem de compra
    """
    ordem_compra = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items', verbose_name='Ordem de Compra')
    produto = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Produto')
    quantidade = models.IntegerField(verbose_name='Quantidade')
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço Unitário')
    preco_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Preço Total')
    quantidade_recebida = models.IntegerField(default=0, verbose_name='Quantidade Recebida')
    
    class Meta:
        db_table = 'inventory_purchaseorderitem'
        verbose_name = 'Item da Ordem de Compra'
        verbose_name_plural = 'Itens das Ordens de Compra'
        unique_together = ['ordem_compra', 'produto']
    
    def __str__(self):
        return f"{self.produto.nome} - {self.quantidade} unidades"
    
    def save(self, *args, **kwargs):
        self.preco_total = self.quantidade * self.preco_unitario
        super().save(*args, **kwargs)

from django.contrib import admin
from .models import ProductCategory, Supplier, Product, StockMovement, ProductImage, PurchaseOrder, PurchaseOrderItem
from core.admin import admin_site


class ProductImageInline(admin.TabularInline):
    """
    Inline para imagens de produtos
    """
    model = ProductImage
    extra = 1
    readonly_fields = ('criada_em',)


class StockMovementInline(admin.TabularInline):
    """
    Inline para movimentações de estoque
    """
    model = StockMovement
    extra = 0
    readonly_fields = ('criado_em',)
    fields = ('tipo', 'quantidade', 'motivo', 'usuario', 'criado_em')


class PurchaseOrderItemInline(admin.TabularInline):
    """
    Inline para itens de ordem de compra
    """
    model = PurchaseOrderItem
    extra = 1


# Classe ProductCategoryAdmin sem decorator
class ProductCategoryAdmin(admin.ModelAdmin):
    """
    Admin para categorias de produtos
    """
    list_display = ('nome', 'ativo', 'criado_em')
    list_filter = ('ativo', 'criado_em')
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)
    readonly_fields = ('criado_em',)


class SupplierAdmin(admin.ModelAdmin):
    """
    Admin para fornecedores
    """
    list_display = ('nome', 'pessoa_contato', 'email', 'telefone', 'ativo', 'criado_em')
    list_filter = ('ativo', 'criado_em')
    search_fields = ('nome', 'pessoa_contato', 'email')
    ordering = ('nome',)
    readonly_fields = ('criado_em',)


class ProductAdmin(admin.ModelAdmin):
    """
    Admin para produtos
    """
    list_display = ('nome', 'categoria', 'quantidade', 'quantidade_minima', 'preco_unitario', 'is_low_stock', 'ativo', 'criado_em')
    list_filter = ('categoria', 'fornecedor', 'ativo', 'criado_em')
    search_fields = ('nome', 'descricao', 'sku', 'codigo_barras')
    ordering = ('nome',)
    readonly_fields = ('criado_em', 'atualizado_em', 'is_low_stock', 'is_out_of_stock')
    inlines = [ProductImageInline, StockMovementInline]
    
    fieldsets = (
        ('Informações do Produto', {
            'fields': ('nome', 'descricao', 'categoria', 'fornecedor', 'ativo')
        }),
        ('Códigos de Identificação', {
            'fields': ('sku', 'codigo_barras')
        }),
        ('Estoque e Preços', {
            'fields': ('quantidade', 'quantidade_minima', 'preco_unitario', 'preco_custo')
        }),
        ('Localização', {
            'fields': ('localizacao',)
        }),
        ('Status do Estoque', {
            'fields': ('is_low_stock', 'is_out_of_stock'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )


class StockMovementAdmin(admin.ModelAdmin):
    """
    Admin para movimentações de estoque
    """
    list_display = ('produto', 'tipo', 'quantidade', 'quantidade_anterior', 'nova_quantidade', 'usuario', 'criado_em')
    list_filter = ('tipo', 'criado_em')
    search_fields = ('produto__nome', 'motivo', 'documento_referencia')
    ordering = ('-criado_em',)
    readonly_fields = ('criado_em',)


class ProductImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens de produtos
    """
    list_display = ('produto', 'descricao', 'principal', 'criada_em')
    list_filter = ('principal', 'criada_em')
    search_fields = ('produto__nome', 'descricao')
    ordering = ('-criada_em',)


class PurchaseOrderAdmin(admin.ModelAdmin):
    """
    Admin para ordens de compra
    """
    list_display = ('numero_pedido', 'fornecedor', 'situacao', 'valor_total', 'criado_por', 'criado_em')
    list_filter = ('situacao', 'fornecedor', 'criado_em')
    search_fields = ('numero_pedido', 'fornecedor__nome')
    ordering = ('-criado_em',)
    readonly_fields = ('criado_em', 'enviado_em', 'recebido_em')
    inlines = [PurchaseOrderItemInline]
    
    fieldsets = (
        ('Informações da Ordem', {
            'fields': ('numero_pedido', 'fornecedor', 'situacao', 'criado_por')
        }),
        ('Valores', {
            'fields': ('valor_total',)
        }),
        ('Observações', {
            'fields': ('observacoes',)
        }),
        ('Timestamps', {
            'fields': ('criado_em', 'enviado_em', 'recebido_em'),
            'classes': ('collapse',)
        }),
    )


class PurchaseOrderItemAdmin(admin.ModelAdmin):
    """
    Admin para itens de ordem de compra
    """
    list_display = ('ordem_compra', 'produto', 'quantidade', 'preco_unitario', 'preco_total', 'quantidade_recebida')
    list_filter = ('ordem_compra__situacao',)
    search_fields = ('produto__nome', 'ordem_compra__numero_pedido')
    ordering = ('-ordem_compra__criado_em',)


# Registra no site admin customizado
admin_site.register(ProductCategory, ProductCategoryAdmin)
admin_site.register(Supplier, SupplierAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(StockMovement, StockMovementAdmin)
admin_site.register(ProductImage, ProductImageAdmin)
admin_site.register(PurchaseOrder, PurchaseOrderAdmin)
admin_site.register(PurchaseOrderItem, PurchaseOrderItemAdmin)
from django.contrib import admin
from .models import ProductCategory, Supplier, Product, StockMovement, ProductImage, PurchaseOrder, PurchaseOrderItem


class ProductImageInline(admin.TabularInline):
    """
    Inline para imagens de produtos
    """
    model = ProductImage
    extra = 1
    readonly_fields = ('created_at',)


class StockMovementInline(admin.TabularInline):
    """
    Inline para movimentações de estoque
    """
    model = StockMovement
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('type', 'quantity', 'reason', 'user', 'created_at')


class PurchaseOrderItemInline(admin.TabularInline):
    """
    Inline para itens de ordem de compra
    """
    model = PurchaseOrderItem
    extra = 1


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    """
    Admin para categorias de produtos
    """
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)
    readonly_fields = ('created_at',)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    """
    Admin para fornecedores
    """
    list_display = ('name', 'contact_person', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'contact_person', 'email')
    ordering = ('name',)
    readonly_fields = ('created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """
    Admin para produtos
    """
    list_display = ('name', 'category', 'quantity', 'min_quantity', 'unit_price', 'is_low_stock', 'is_active', 'created_at')
    list_filter = ('category', 'supplier', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'sku', 'barcode')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at', 'is_low_stock', 'is_out_of_stock')
    inlines = [ProductImageInline, StockMovementInline]
    
    fieldsets = (
        ('Informações do Produto', {
            'fields': ('name', 'description', 'category', 'supplier', 'is_active')
        }),
        ('Códigos de Identificação', {
            'fields': ('sku', 'barcode')
        }),
        ('Estoque e Preços', {
            'fields': ('quantity', 'min_quantity', 'unit_price', 'cost_price')
        }),
        ('Localização', {
            'fields': ('location',)
        }),
        ('Status do Estoque', {
            'fields': ('is_low_stock', 'is_out_of_stock'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    """
    Admin para movimentações de estoque
    """
    list_display = ('product', 'type', 'quantity', 'previous_quantity', 'new_quantity', 'user', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('product__name', 'reason', 'reference_document')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """
    Admin para imagens de produtos
    """
    list_display = ('product', 'description', 'is_primary', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('product__name', 'description')
    ordering = ('-created_at',)


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    """
    Admin para ordens de compra
    """
    list_display = ('order_number', 'supplier', 'status', 'total_amount', 'created_by', 'created_at')
    list_filter = ('status', 'supplier', 'created_at')
    search_fields = ('order_number', 'supplier__name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'sent_at', 'received_at')
    inlines = [PurchaseOrderItemInline]
    
    fieldsets = (
        ('Informações da Ordem', {
            'fields': ('order_number', 'supplier', 'status', 'created_by')
        }),
        ('Valores', {
            'fields': ('total_amount',)
        }),
        ('Observações', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'sent_at', 'received_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    """
    Admin para itens de ordem de compra
    """
    list_display = ('purchase_order', 'product', 'quantity', 'unit_price', 'total_price', 'received_quantity')
    list_filter = ('purchase_order__status',)
    search_fields = ('product__name', 'purchase_order__order_number')
    ordering = ('-purchase_order__created_at',)

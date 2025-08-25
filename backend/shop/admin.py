"""
Configuration de l'interface d'administration Django pour l'e-commerce ADDINA.

Cette interface permet de gérer les produits, commandes, et autres données
de l'e-commerce via l'interface web Django Admin.
"""

from django.contrib import admin
from .models import Profile, Product, CartItem, Order, OrderItem, WishlistItem


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Administration des profils utilisateur"""
    list_display = ['user', 'display_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'display_name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Administration des produits"""
    list_display = ['title', 'price', 'original_price', 'discount', 'is_new', 'created_at']
    list_filter = ['is_new', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at', 'effective_price']
    list_editable = ['price', 'is_new']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('id', 'title', 'description')
        }),
        ('Prix et remises', {
            'fields': ('price', 'original_price', 'discount', 'effective_price')
        }),
        ('Média et statut', {
            'fields': ('image_url', 'is_new')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class OrderItemInline(admin.TabularInline):
    """Inline pour les articles de commande"""
    model = OrderItem
    extra = 0
    readonly_fields = ['id', 'total_price', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Administration des commandes"""
    list_display = ['id', 'user', 'total_amount', 'status', 'total_items', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'total_items', 'created_at', 'updated_at']
    list_editable = ['status']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('id', 'user', 'status')
        }),
        ('Montants', {
            'fields': ('total_amount', 'total_items')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Administration des articles du panier"""
    list_display = ['user', 'product', 'quantity', 'total_price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']
    readonly_fields = ['id', 'total_price', 'created_at', 'updated_at']


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    """Administration des articles de liste de souhaits"""
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']
    readonly_fields = ['id', 'created_at']


# Configuration générale de l'admin
admin.site.site_header = "Administration ADDINA E-commerce"
admin.site.site_title = "ADDINA Admin"
admin.site.index_title = "Gestion de l'e-commerce ADDINA"

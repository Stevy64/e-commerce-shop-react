"""
Modèles Django pour l'API e-commerce ADDINA.

Ces modèles remplacent exactement les tables Supabase existantes
pour assurer une migration transparente du frontend React.
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Profile(models.Model):
    """
    Profil utilisateur étendu.
    Remplace la table 'profiles' de Supabase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True, null=True)
    avatar_url = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profil de {self.user.username}"

    class Meta:
        verbose_name = "Profil"
        verbose_name_plural = "Profils"


class Product(models.Model):
    """
    Produit e-commerce.
    Remplace exactement la table 'products' de Supabase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    image_url = models.ImageField(upload_to='products/', blank=True, null=True)
    is_new = models.BooleanField(default=False, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def effective_price(self):
        """Prix effectif après remise"""
        if self.discount and self.original_price:
            return self.original_price * (1 - self.discount / 100)
        return self.price

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['-created_at']


class CartItem(models.Model):
    """
    Article dans le panier.
    Remplace exactement la table 'cart_items' de Supabase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.title} - {self.user.username}"

    @property
    def total_price(self):
        return self.quantity * self.product.price

    class Meta:
        verbose_name = "Article du panier"
        verbose_name_plural = "Articles du panier"
        unique_together = ['user', 'product']


class Order(models.Model):
    """
    Commande utilisateur.
    Remplace exactement la table 'orders' de Supabase.
    """
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('processing', 'En traitement'),
        ('shipped', 'Expédiée'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Commande {self.id} - {self.user.username}"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    class Meta:
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"
        ordering = ['-created_at']


class OrderItem(models.Model):
    """
    Article dans une commande.
    Remplace exactement la table 'order_items' de Supabase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Prix au moment de la commande
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.title} (Commande {self.order.id})"

    @property
    def total_price(self):
        return self.quantity * self.price

    class Meta:
        verbose_name = "Article de commande"
        verbose_name_plural = "Articles de commande"


class WishlistItem(models.Model):
    """
    Article dans la liste de souhaits.
    Remplace exactement la table 'wishlist_items' de Supabase.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist_items')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.title} - Liste de {self.user.username}"

    class Meta:
        verbose_name = "Article de liste de souhaits"
        verbose_name_plural = "Articles de liste de souhaits"
        unique_together = ['user', 'product']

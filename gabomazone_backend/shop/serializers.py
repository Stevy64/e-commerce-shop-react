"""
Serializers Django REST Framework pour l'API e-commerce ADDINA.

Ces serializers gèrent la sérialisation/désérialisation des données
entre les modèles Django et les réponses JSON de l'API.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Product, CartItem, Order, OrderItem, WishlistItem


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle User Django"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil utilisateur"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'display_name', 'avatar_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer pour les produits.
    Compatible avec la structure Supabase existante.
    """
    effective_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'original_price', 
            'discount', 'image_url', 'is_new', 'effective_price',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'effective_price']


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer pour les articles du panier.
    Inclut les détails du produit pour compatibilité avec le frontend.
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'user', 'product', 'product_id', 'quantity', 
            'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'total_price', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Créer ou mettre à jour un article du panier (upsert)"""
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        quantity = validated_data.get('quantity', 1)
        
        cart_item, created = CartItem.objects.update_or_create(
            user=user,
            product_id=product_id,
            defaults={'quantity': quantity}
        )
        return cart_item


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer pour les articles de commande"""
    product = ProductSerializer(read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price', 'created_at']
        read_only_fields = ['id', 'total_price', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer pour les commandes"""
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_amount', 'status', 'items', 
            'total_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'total_items', 'created_at', 'updated_at']


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer pour les articles de liste de souhaits"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'user', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        """Créer un article de liste de souhaits"""
        user = self.context['request'].user
        product_id = validated_data.pop('product_id')
        
        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=user,
            product_id=product_id
        )
        return wishlist_item


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription utilisateur"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Créer automatiquement le profil
        Profile.objects.create(user=user)
        
        return user


"""
Vues Django REST Framework pour l'API e-commerce ADDINA.

Ces vues remplacent les fonctionnalités Supabase et fournissent
les mêmes endpoints API pour le frontend React.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db import transaction

from .models import Profile, Product, CartItem, Order, OrderItem, WishlistItem
from .serializers import (
    ProfileSerializer, ProductSerializer, CartItemSerializer,
    OrderSerializer, WishlistItemSerializer, UserRegistrationSerializer,
    UserSerializer
)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les produits.
    Lecture seule - les produits sont gérés via l'admin Django.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Les produits sont publics
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Récupérer les produits mis en avant (is_new=True)"""
        featured_products = self.queryset.filter(is_new=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)


class CartItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion du panier.
    Remplace les fonctionnalités cart_items de Supabase.
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner seulement les articles du panier de l'utilisateur connecté"""
        return CartItem.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        """Associer l'article du panier à l'utilisateur connecté"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Vider le panier de l'utilisateur"""
        deleted_count = self.get_queryset().delete()[0]
        return Response({
            'message': f'{deleted_count} articles supprimés du panier',
            'deleted_count': deleted_count
        })

    @action(detail=False, methods=['get'])
    def total(self, request):
        """Calculer le total du panier"""
        cart_items = self.get_queryset()
        total_amount = sum(item.total_price for item in cart_items)
        total_items = sum(item.quantity for item in cart_items)
        
        return Response({
            'total_amount': total_amount,
            'total_items': total_items,
            'currency': 'FCFA'
        })


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des commandes.
    Remplace les fonctionnalités orders de Supabase.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner seulement les commandes de l'utilisateur connecté"""
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """
        Créer une commande à partir du panier actuel.
        Remplace le processus de checkout de Supabase.
        """
        cart_items = CartItem.objects.filter(user=request.user).select_related('product')
        
        if not cart_items.exists():
            return Response(
                {'error': 'Le panier est vide'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculer le total
        total_amount = sum(item.total_price for item in cart_items)

        # Créer la commande et les articles de commande dans une transaction
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                total_amount=total_amount,
                status='pending'
            )

            # Créer les articles de commande
            order_items = []
            for cart_item in cart_items:
                order_items.append(OrderItem(
                    order=order,
                    product=cart_item.product,
                    quantity=cart_item.quantity,
                    price=cart_item.product.price
                ))
            
            OrderItem.objects.bulk_create(order_items)

            # Vider le panier
            cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion de la liste de souhaits.
    Remplace les fonctionnalités wishlist_items de Supabase.
    """
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner seulement les articles de la liste de souhaits de l'utilisateur"""
        return WishlistItem.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        """Associer l'article à l'utilisateur connecté"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Vider la liste de souhaits"""
        deleted_count = self.get_queryset().delete()[0]
        return Response({
            'message': f'{deleted_count} articles supprimés de la liste de souhaits',
            'deleted_count': deleted_count
        })


class ProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion du profil utilisateur.
    Remplace les fonctionnalités profiles de Supabase.
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner seulement le profil de l'utilisateur connecté"""
        return Profile.objects.filter(user=self.request.user)

    def get_object(self):
        """Récupérer ou créer le profil de l'utilisateur connecté"""
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Récupérer le profil de l'utilisateur connecté"""
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet pour l'authentification.
    Remplace Supabase Auth avec des endpoints compatibles.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Inscription utilisateur.
        Remplace supabase.auth.signUp()
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Utilisateur créé avec succès',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Récupérer les informations de l'utilisateur connecté.
        Remplace supabase.auth.getUser()
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vue personnalisée pour l'obtention des tokens JWT.
    Remplace supabase.auth.signIn()
    """
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Ajouter des informations utilisateur à la réponse
            user = User.objects.get(username=request.data.get('username'))
            response.data['user'] = UserSerializer(user).data
        return response

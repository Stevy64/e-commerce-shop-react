"""
URLs pour l'API e-commerce ADDINA.

Ces URLs remplacent les endpoints Supabase et fournissent
une API REST compatible avec le frontend React existant.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ProductViewSet, CartItemViewSet, OrderViewSet, WishlistItemViewSet,
    ProfileViewSet, AuthViewSet, CustomTokenObtainPairView
)
from .email_views import (
    register_with_email_confirmation, resend_confirmation_email, 
    confirm_email_api
)

# Router pour les ViewSets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'cart-items', CartItemViewSet, basename='cart-items')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'wishlist-items', WishlistItemViewSet, basename='wishlist-items')
router.register(r'profiles', ProfileViewSet, basename='profiles')
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    # Endpoints de l'API REST
    path('api/', include(router.urls)),
    
    # Endpoints d'authentification JWT (remplacent Supabase Auth)
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoints compatibles avec les hooks React existants
    path('api/auth/user/', AuthViewSet.as_view({'get': 'me'}), name='auth_user'),
    path('api/auth/register/', AuthViewSet.as_view({'post': 'register'}), name='auth_register'),
    
    # Nouveaux endpoints avec confirmation email
    path('api/auth/register-email/', register_with_email_confirmation, name='register_with_email'),
    path('api/auth/resend-confirmation/', resend_confirmation_email, name='resend_confirmation'),
    path('api/auth/confirm-email/<str:key>/', confirm_email_api, name='confirm_email_api'),
    
    # Endpoints spéciaux pour le panier et les commandes
    path('api/cart/total/', CartItemViewSet.as_view({'get': 'total'}), name='cart_total'),
    path('api/cart/clear/', CartItemViewSet.as_view({'delete': 'clear'}), name='cart_clear'),
    path('api/orders/create-from-cart/', OrderViewSet.as_view({'post': 'create_from_cart'}), name='order_from_cart'),
    
    # Endpoints pour les produits mis en avant
    path('api/products/featured/', ProductViewSet.as_view({'get': 'featured'}), name='products_featured'),
    
    # Endpoint pour le profil utilisateur
    path('api/profile/me/', ProfileViewSet.as_view({'get': 'me'}), name='profile_me'),
]


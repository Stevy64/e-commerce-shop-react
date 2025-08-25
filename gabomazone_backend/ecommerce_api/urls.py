"""
URL configuration for ecommerce_api project.

Configuration des URLs pour l'API e-commerce ADDINA.
Inclut les endpoints API et la gestion des fichiers media.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Interface d'administration Django
    path('admin/', admin.site.urls),
    
    # URLs de l'application shop (API e-commerce)
    path('', include('shop.urls')),
    
    # URLs pour allauth (confirmation email, etc.)
    path('accounts/', include('allauth.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

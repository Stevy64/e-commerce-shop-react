# Guide de Migration : De Supabase vers Django API

**Auteur :** Manus AI  
**Date :** 25 août 2025  
**Version :** 1.0  

## Table des Matières

1. [Introduction](#introduction)
2. [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
3. [Prérequis](#prérequis)
4. [Installation et Configuration](#installation-et-configuration)
5. [Migration des Données](#migration-des-données)
6. [Adaptation du Frontend](#adaptation-du-frontend)
7. [Tests et Validation](#tests-et-validation)
8. [Déploiement](#déploiement)
9. [Maintenance et Monitoring](#maintenance-et-monitoring)
10. [Annexes](#annexes)

---

## Introduction

Ce guide détaille la migration complète d'une application e-commerce React utilisant Supabase vers une architecture Django API. Cette migration permet de bénéficier d'un contrôle total sur le backend, d'une meilleure personnalisation des fonctionnalités métier, et d'une réduction des coûts d'infrastructure à long terme.

### Contexte du Projet

L'application e-commerce ADDINA était initialement développée avec Lovable AI et utilisait Supabase comme backend-as-a-service (BaaS). Bien que Supabase offre une solution rapide pour le prototypage, les besoins croissants en personnalisation et contrôle ont motivé la migration vers Django API.

### Objectifs de la Migration

La migration vise à atteindre plusieurs objectifs stratégiques :

**Contrôle Total du Backend :** Django offre une flexibilité complète pour implémenter des logiques métier complexes, des validations personnalisées, et des intégrations avec des services tiers.

**Réduction des Coûts :** Éliminer les frais récurrents de Supabase et migrer vers une infrastructure auto-hébergée ou cloud personnalisée.

**Performance Optimisée :** Optimiser les requêtes de base de données, implémenter des stratégies de cache avancées, et personnaliser les performances selon les besoins spécifiques.

**Sécurité Renforcée :** Implémenter des mécanismes de sécurité sur mesure, des politiques d'accès granulaires, et des audits de sécurité personnalisés.

**Évolutivité :** Préparer l'application pour une croissance future avec une architecture modulaire et extensible.

### Approche de Migration

La stratégie adoptée privilégie une migration progressive et sécurisée :

1. **Conservation du Frontend :** Le frontend React existant est préservé pour minimiser les risques et maintenir l'expérience utilisateur.

2. **Remplacement Transparent du Backend :** L'API Django reproduit fidèlement les endpoints Supabase pour assurer une compatibilité totale.

3. **Migration des Données :** Les données existantes sont migrées avec préservation de l'intégrité et des relations.

4. **Tests Exhaustifs :** Chaque fonctionnalité est testée pour garantir la parité avec l'implémentation Supabase.

5. **Documentation Complète :** Une documentation détaillée facilite la maintenance future et l'onboarding des développeurs.

---


## Vue d'ensemble de l'architecture

### Architecture Avant Migration (Supabase)

L'architecture initiale reposait sur Supabase comme solution backend complète :

**Frontend React :** Application single-page développée avec React, TypeScript, et Tailwind CSS, utilisant les hooks personnalisés pour interagir avec Supabase.

**Supabase Backend :** Service backend-as-a-service fournissant :
- Base de données PostgreSQL hébergée
- API REST automatiquement générée
- Authentification et autorisation intégrées
- Stockage de fichiers
- Fonctions serverless (Edge Functions)
- Subscriptions en temps réel

**Intégrations :** Le frontend communiquait directement avec Supabase via le SDK JavaScript officiel, gérant l'authentification JWT et les requêtes API de manière transparente.

### Architecture Après Migration (Django API)

La nouvelle architecture adopte une approche plus traditionnelle mais plus flexible :

**Frontend React Inchangé :** Le frontend conserve son interface utilisateur et ses composants existants, seuls les services d'API sont modifiés.

**Django API Backend :** Serveur API REST développé avec Django et Django REST Framework, offrant :
- Modèles de données Django (ORM)
- Vues basées sur des ViewSets
- Sérialisation automatique des données
- Authentification JWT avec djangorestframework-simplejwt
- Interface d'administration Django
- Gestion des permissions granulaires

**Base de Données :** PostgreSQL ou SQLite pour le développement, avec migrations Django pour la gestion du schéma.

**Couche d'Abstraction :** Nouveaux services et hooks React qui encapsulent les appels API Django, maintenant la compatibilité avec l'interface existante.

### Comparaison des Architectures

| Aspect | Supabase | Django API |
|--------|----------|------------|
| **Contrôle** | Limité aux fonctionnalités Supabase | Contrôle total du backend |
| **Personnalisation** | Contrainte par l'API Supabase | Personnalisation illimitée |
| **Coûts** | Frais récurrents basés sur l'usage | Coûts d'infrastructure contrôlés |
| **Performance** | Optimisations automatiques | Optimisations sur mesure |
| **Sécurité** | Sécurité gérée par Supabase | Sécurité personnalisée |
| **Évolutivité** | Limitée aux capacités Supabase | Évolutivité architecturale |
| **Maintenance** | Maintenance externalisée | Maintenance interne requise |
| **Temps de développement** | Rapide pour le prototypage | Plus long mais plus flexible |

### Flux de Données

**Avant Migration :**
```
Frontend React → Supabase SDK → Supabase API → PostgreSQL
```

**Après Migration :**
```
Frontend React → Service API Custom → Django API → PostgreSQL
```

La couche de service API custom assure la compatibilité en traduisant les appels frontend vers les nouveaux endpoints Django, permettant une migration transparente sans modification majeure du frontend.

---


## Prérequis

### Environnement de Développement

Avant de commencer la migration, assurez-vous que votre environnement de développement dispose des outils suivants :

**Python 3.11+ :** Django 5.2 nécessite Python 3.11 ou supérieur. Vérifiez votre version avec `python3 --version`.

**Node.js 18+ :** Pour le frontend React et les outils de build. Vérifiez avec `node --version`.

**PostgreSQL 12+ :** Base de données recommandée pour la production. SQLite peut être utilisé pour le développement local.

**Git :** Pour la gestion de version et le clonage des repositories.

### Dépendances Python

Les packages Python suivants sont requis pour le backend Django :

```bash
Django==5.2
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.7  # Pour PostgreSQL
python-decouple==3.8    # Pour la gestion des variables d'environnement
```

### Dépendances Node.js

Le frontend React nécessite les dépendances suivantes (déjà présentes dans le projet existant) :

```bash
axios==1.6.0           # Pour les appels API HTTP
react==18.2.0
react-dom==18.2.0
typescript==5.0.0
vite==5.4.19
tailwindcss==3.4.0
```

### Connaissances Techniques Requises

**Django & Django REST Framework :** Compréhension des modèles, vues, sérialiseurs, et système d'authentification Django.

**React & TypeScript :** Maîtrise des hooks React, gestion d'état, et TypeScript pour le typage.

**API REST :** Compréhension des principes REST, codes de statut HTTP, et authentification JWT.

**PostgreSQL :** Connaissances de base en SQL et administration de base de données.

---

## Installation et Configuration

### Étape 1 : Clonage et Préparation du Projet

Commencez par cloner le projet existant et préparer l'environnement :

```bash
# Cloner le repository
git clone https://github.com/Stevy64/e-commerce-shop-react.git
cd e-commerce-shop-react

# Installer les dépendances frontend
npm install
npm install axios  # Ajouter axios pour les appels API
```

### Étape 2 : Création du Backend Django

Créez un nouveau projet Django pour l'API :

```bash
# Installer Django et les dépendances
pip3 install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Créer le projet Django
django-admin startproject ecommerce_api
cd ecommerce_api

# Créer l'application shop
python3 manage.py startapp shop
```

### Étape 3 : Configuration Django

Configurez le fichier `settings.py` pour l'API e-commerce :

```python
# ecommerce_api/settings.py

import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Configuration de sécurité
SECRET_KEY = 'your-secret-key-here'  # À changer en production
DEBUG = True  # False en production
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Applications installées
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Applications tierces
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Applications locales
    'shop',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ecommerce_api.urls'

# Configuration de la base de données
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Configuration Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Configuration JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

# Configuration CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
]

CORS_ALLOW_CREDENTIALS = True

# Internationalisation
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Abidjan'
USE_I18N = True
USE_TZ = True

# Fichiers statiques
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### Étape 4 : Création des Modèles Django

Créez les modèles correspondant aux tables Supabase dans `shop/models.py` :

```python
# shop/models.py

import uuid
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class Profile(models.Model):
    """Profil utilisateur étendu"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profil de {self.user.username}"

class Product(models.Model):
    """Modèle de produit e-commerce"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    is_new = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def effective_price(self):
        """Prix effectif après remise"""
        if self.discount:
            return self.price * (1 - self.discount / 100)
        return self.price

    def __str__(self):
        return self.title
```

### Étape 5 : Migrations et Base de Données

Créez et appliquez les migrations Django :

```bash
# Créer les migrations
python3 manage.py makemigrations

# Appliquer les migrations
python3 manage.py migrate

# Créer un superutilisateur
python3 manage.py createsuperuser
```

### Étape 6 : Configuration des URLs

Configurez les URLs dans `ecommerce_api/urls.py` :

```python
# ecommerce_api/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('shop.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

---


## Migration des Données

### Stratégie de Migration

La migration des données de Supabase vers Django nécessite une approche méthodique pour préserver l'intégrité des données et maintenir les relations entre les entités.

**Extraction des Données Supabase :** Utilisez l'interface Supabase ou des requêtes SQL directes pour exporter les données existantes au format JSON ou CSV.

**Transformation des Données :** Adaptez le format des données pour correspondre aux modèles Django, en particulier pour les champs UUID, les timestamps, et les relations.

**Chargement dans Django :** Utilisez les fixtures Django ou des scripts de migration personnalisés pour importer les données transformées.

### Script de Migration des Produits

Créez un script pour migrer les produits existants :

```python
# populate_data.py

import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_api.settings')
django.setup()

from shop.models import Product

def migrate_products_from_supabase():
    """Migrer les produits depuis Supabase"""
    
    # Données exemple (remplacez par vos données Supabase réelles)
    supabase_products = [
        {
            'title': 'Smartphone Samsung Galaxy A54',
            'description': 'Smartphone Android avec écran AMOLED 6.4"',
            'price': Decimal('285000'),
            'original_price': Decimal('320000'),
            'discount': Decimal('10.94'),
            'is_new': True,
        },
        # Ajoutez vos autres produits ici
    ]
    
    for product_data in supabase_products:
        product, created = Product.objects.get_or_create(
            title=product_data['title'],
            defaults=product_data
        )
        
        if created:
            print(f"✓ Produit créé: {product.title}")
        else:
            print(f"- Produit existant: {product.title}")

if __name__ == '__main__':
    migrate_products_from_supabase()
```

### Validation de la Migration

Après la migration, validez l'intégrité des données :

```bash
# Exécuter le script de migration
python3 populate_data.py

# Vérifier les données via l'admin Django
python3 manage.py runserver
# Accéder à http://localhost:8000/admin/
```

---

## Adaptation du Frontend

### Création du Service API

Le service API constitue la couche d'abstraction entre le frontend React et le backend Django. Il remplace les appels Supabase par des requêtes HTTP vers l'API Django.

Créez le fichier `src/services/api.ts` :

```typescript
// src/services/api.ts

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_joined: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  image_url?: string;
  is_new?: boolean;
  effective_price: number;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour l'authentification
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  // Méthodes d'authentification
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login/', {
      username,
      password,
    });
    this.accessToken = response.data.access;
    localStorage.setItem('access_token', response.data.access);
    return response.data;
  }

  // Méthodes pour les produits
  async getProducts(): Promise<Product[]> {
    const response = await this.api.get('/products/');
    return response.data.results || response.data;
  }

  // Autres méthodes API...
}

export const apiService = new ApiService();
```

### Hooks React Personnalisés

Créez des hooks React qui encapsulent les appels API et maintiennent la compatibilité avec l'interface existante.

**Hook d'Authentification (`src/hooks/useAuthDjango.tsx`) :**

```typescript
// src/hooks/useAuthDjango.tsx

import { useState, useEffect, createContext, useContext } from "react";
import { apiService, User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  session: { user: User } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (username: string, password: string) => {
    const authData = await apiService.login(username, password);
    setUser(authData.user);
  };

  const signOut = async () => {
    apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session: user ? { user } : null, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Hook de Panier (`src/hooks/useCartDjango.tsx`) :**

```typescript
// src/hooks/useCartDjango.tsx

import { useState, useEffect } from "react";
import { apiService, CartItem } from "@/services/api";
import { useAuth } from "./useAuthDjango";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCartItems = async () => {
    if (!user) return;
    const items = await apiService.getCartItems();
    setCartItems(items);
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    await apiService.addToCart(productId, quantity);
    await fetchCartItems();
  };

  const removeFromCart = async (cartItemId: string) => {
    await apiService.removeFromCart(cartItemId);
    await fetchCartItems();
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    getCartTotal: () => cartItems.reduce((total, item) => total + item.total_price, 0),
    getCartItemsCount: () => cartItems.reduce((total, item) => total + item.quantity, 0),
  };
};
```

### Mise à Jour des Composants

Modifiez les composants existants pour utiliser les nouveaux hooks Django au lieu des hooks Supabase.

**Mise à jour d'App.tsx :**

```typescript
// src/App.tsx

import { AuthProvider } from "./hooks/useAuthDjango"; // Changement ici

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* Reste du code inchangé */}
    </AuthProvider>
  </QueryClientProvider>
);
```

**Mise à jour des Composants :**

```typescript
// src/components/ProductCard.tsx

import { useCart } from "@/hooks/useCartDjango";     // Changement
import { useWishlist } from "@/hooks/useWishlistDjango"; // Changement

// Reste du code inchangé
```

### Configuration de Basculement

Créez un fichier de configuration pour basculer facilement entre Supabase et Django :

```typescript
// src/config/api.ts

export const USE_DJANGO_API = true; // false pour Supabase

export const DJANGO_API_CONFIG = {
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
};

if (USE_DJANGO_API) {
  console.log('🚀 Configuration: Utilisation de l\'API Django');
} else {
  console.log('🔄 Configuration: Utilisation de Supabase');
}
```

---


## Tests et Validation

### Tests Backend Django

Créez des tests unitaires pour valider le fonctionnement de l'API Django :

```python
# shop/tests.py

from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Product, CartItem

class ProductAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.product = Product.objects.create(
            title='Test Product',
            price=100.00,
            is_new=True
        )

    def test_get_products(self):
        """Test de récupération des produits"""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_add_to_cart_authenticated(self):
        """Test d'ajout au panier avec utilisateur authentifié"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/cart-items/', {
            'product_id': str(self.product.id),
            'quantity': 2
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_to_cart_unauthenticated(self):
        """Test d'ajout au panier sans authentification"""
        response = self.client.post('/api/cart-items/', {
            'product_id': str(self.product.id),
            'quantity': 1
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

Exécutez les tests :

```bash
python3 manage.py test
```

### Tests Frontend

Créez des tests pour les nouveaux hooks et services :

```typescript
// src/services/__tests__/api.test.ts

import { apiService } from '../api';

describe('ApiService', () => {
  test('should fetch products', async () => {
    const products = await apiService.getProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  test('should handle authentication', async () => {
    const authData = await apiService.login('testuser', 'testpass');
    expect(authData).toHaveProperty('access');
    expect(authData).toHaveProperty('user');
  });
});
```

### Tests d'Intégration

Validez l'intégration complète entre frontend et backend :

1. **Test de Chargement :** Vérifiez que l'application se charge correctement
2. **Test d'Authentification :** Testez la connexion et déconnexion
3. **Test de Navigation :** Vérifiez la navigation entre les pages
4. **Test de Panier :** Testez l'ajout/suppression d'articles
5. **Test de Commande :** Validez le processus de commande complet

### Checklist de Validation

- [ ] Tous les produits sont affichés correctement
- [ ] L'authentification fonctionne (connexion/déconnexion)
- [ ] Le panier fonctionne (ajout/suppression/modification)
- [ ] La liste de souhaits fonctionne
- [ ] Les commandes peuvent être créées
- [ ] L'interface d'administration Django est accessible
- [ ] Les permissions sont correctement appliquées
- [ ] Les erreurs sont gérées gracieusement
- [ ] Les performances sont acceptables

---

## Déploiement

### Déploiement Backend Django

**Préparation pour la Production :**

```python
# settings.py (production)

DEBUG = False
ALLOWED_HOSTS = ['votre-domaine.com', 'api.votre-domaine.com']

# Base de données PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Sécurité
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

**Déploiement avec Docker :**

```dockerfile
# Dockerfile

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "ecommerce_api.wsgi:application"]
```

**Docker Compose :**

```yaml
# docker-compose.yml

version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DB_NAME: ecommerce
      DB_USER: postgres
      DB_PASSWORD: password
      DB_HOST: db

volumes:
  postgres_data:
```

### Déploiement Frontend

**Build de Production :**

```bash
# Build du frontend React
npm run build

# Servir les fichiers statiques avec nginx ou un CDN
```

**Configuration Nginx :**

```nginx
# /etc/nginx/sites-available/ecommerce

server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend React
    location / {
        root /var/www/ecommerce/build;
        try_files $uri $uri/ /index.html;
    }

    # API Django
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Monitoring et Maintenance

**Logging :**

```python
# settings.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/ecommerce.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

**Monitoring avec Sentry :**

```bash
pip install sentry-sdk[django]
```

```python
# settings.py

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="YOUR_SENTRY_DSN",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)
```

---

## Maintenance et Monitoring

### Sauvegarde de Base de Données

Configurez des sauvegardes automatiques :

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U postgres ecommerce > backup_$DATE.sql
```

### Mise à Jour des Dépendances

Maintenez les dépendances à jour :

```bash
# Backend
pip list --outdated
pip install -U package_name

# Frontend
npm outdated
npm update
```

### Surveillance des Performances

Utilisez des outils comme Django Debug Toolbar en développement et des solutions APM en production.

---

## Annexes

### Annexe A : Mapping des Endpoints

| Fonctionnalité | Supabase | Django API |
|----------------|----------|------------|
| Authentification | `supabase.auth.signIn()` | `POST /api/auth/login/` |
| Récupération utilisateur | `supabase.auth.getUser()` | `GET /api/auth/user/` |
| Liste produits | `supabase.from('products').select()` | `GET /api/products/` |
| Ajout panier | `supabase.from('cart_items').insert()` | `POST /api/cart-items/` |
| Liste panier | `supabase.from('cart_items').select()` | `GET /api/cart-items/` |

### Annexe B : Structure des Données

**Modèle Product :**

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "price": "decimal",
  "original_price": "decimal",
  "discount": "decimal",
  "image_url": "url",
  "is_new": "boolean",
  "effective_price": "decimal (calculé)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Annexe C : Commandes Utiles

```bash
# Django
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runserver
python3 manage.py createsuperuser
python3 manage.py collectstatic

# React
npm start
npm run build
npm test

# Docker
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Annexe D : Dépannage

**Erreurs Communes :**

1. **CORS Error :** Vérifiez la configuration CORS dans Django
2. **401 Unauthorized :** Vérifiez l'authentification JWT
3. **404 Not Found :** Vérifiez les URLs et le routage
4. **500 Server Error :** Consultez les logs Django

**Solutions :**

- Activez le mode DEBUG pour plus de détails
- Vérifiez les logs dans `/var/log/django/`
- Utilisez l'interface d'administration Django pour diagnostiquer
- Testez les endpoints avec Postman ou curl

---

## Conclusion

Cette migration de Supabase vers Django API offre un contrôle total sur l'architecture backend tout en préservant l'expérience utilisateur frontend. L'approche progressive et la documentation détaillée facilitent la transition et la maintenance future.

Les avantages obtenus incluent une flexibilité accrue, des coûts maîtrisés, et une évolutivité sur mesure. La couche d'abstraction créée permet également un retour vers Supabase si nécessaire, offrant une sécurité supplémentaire pour cette migration.

**Auteur :** Manus AI  
**Contact :** Pour toute question technique, consultez la documentation Django et Django REST Framework officielles.

---

*Ce guide a été généré automatiquement par Manus AI le 25 août 2025. Il est recommandé de l'adapter selon vos besoins spécifiques et de le maintenir à jour avec les évolutions de votre projet.*


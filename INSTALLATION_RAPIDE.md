# Guide d'Installation Rapide - Migration Supabase vers Django API

**🚀 Installation en 10 minutes pour une prise en main rapide**

## Prérequis

- Python 3.11+
- Node.js 18+
- Git

## Étape 1 : Clonage et Préparation (2 min)

```bash
# Cloner le projet
git clone https://github.com/Stevy64/e-commerce-shop-react.git
cd e-commerce-shop-react

# Installer les dépendances frontend
npm install
npm install axios
```

## Étape 2 : Backend Django (3 min)

```bash
# Installer Django
pip3 install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Créer le projet Django
django-admin startproject ecommerce_api
cd ecommerce_api
python3 manage.py startapp shop
```

## Étape 3 : Configuration Express (2 min)

Copiez les fichiers de configuration depuis le projet migré :

```bash
# Copier les modèles, vues, serializers depuis le projet exemple
# Ou utilisez les fichiers fournis dans la documentation complète
```

**Configuration minimale dans `settings.py` :**

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'shop',
]

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

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:8081",
]
```

## Étape 4 : Base de Données (1 min)

```bash
# Créer et appliquer les migrations
python3 manage.py makemigrations
python3 manage.py migrate

# Créer un superutilisateur
python3 manage.py createsuperuser

# Peupler avec des données de test
python3 populate_data.py
```

## Étape 5 : Démarrage des Serveurs (1 min)

**Terminal 1 - Backend Django :**
```bash
cd ecommerce_api
python3 manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend React :**
```bash
cd e-commerce-shop-react
npm run dev
```

## Étape 6 : Vérification (1 min)

1. **API Django :** http://localhost:8000/api/products/
2. **Application React :** http://localhost:8081
3. **Admin Django :** http://localhost:8000/admin/

## Structure des Fichiers Créés

```
ecommerce_api/
├── ecommerce_api/
│   ├── settings.py          # Configuration Django
│   └── urls.py             # URLs principales
├── shop/
│   ├── models.py           # Modèles de données
│   ├── views.py            # Vues API
│   ├── serializers.py      # Sérialiseurs DRF
│   ├── urls.py             # URLs de l'app
│   └── admin.py            # Interface admin
├── populate_data.py        # Script de données de test
└── db.sqlite3             # Base de données

e-commerce-shop-react/
├── src/
│   ├── services/
│   │   └── api.ts          # Service API Django
│   ├── hooks/
│   │   ├── useAuthDjango.tsx
│   │   ├── useCartDjango.tsx
│   │   ├── useWishlistDjango.tsx
│   │   └── useProductsDjango.tsx
│   ├── config/
│   │   └── api.ts          # Configuration API
│   └── App.tsx             # App modifiée
```

## Fonctionnalités Disponibles

✅ **Authentification** - Connexion/Déconnexion  
✅ **Catalogue Produits** - Affichage et recherche  
✅ **Panier** - Ajout/Suppression/Modification  
✅ **Liste de Souhaits** - Gestion des favoris  
✅ **Commandes** - Création et historique  
✅ **Interface Admin** - Gestion backend  

## Comptes de Test

- **Admin :** admin / admin123
- **API :** Créez via l'interface d'inscription

## Dépannage Express

**Erreur CORS :** Vérifiez `CORS_ALLOWED_ORIGINS` dans settings.py  
**Erreur 404 :** Vérifiez que les serveurs sont démarrés  
**Erreur Auth :** Vérifiez la configuration JWT  

## Prochaines Étapes

1. Consultez le **Guide de Migration Complet** pour les détails
2. Personnalisez les modèles selon vos besoins
3. Configurez la base de données PostgreSQL pour la production
4. Implémentez les tests automatisés
5. Préparez le déploiement

---

**🎯 Votre application e-commerce avec Django API est maintenant opérationnelle !**

Pour une documentation complète, consultez `MIGRATION_GUIDE.md`


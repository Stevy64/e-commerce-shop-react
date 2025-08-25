# Gabomazone Backend - Django API

Backend Django REST Framework pour l'application e-commerce Gabomazone.

## Installation Rapide

```bash
# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Charger les données de test
python populate_data.py

# Démarrer le serveur
python manage.py runserver 0.0.0.0:8000
```

## Endpoints API

- **Produits :** `GET /api/products/`
- **Authentification :** `POST /api/auth/login/`
- **Panier :** `GET/POST /api/cart-items/`
- **Admin :** `http://localhost:8000/admin/`

## Technologies

- Django 5.2
- Django REST Framework
- JWT Authentication
- CORS Headers
- SQLite (dev) / PostgreSQL (prod)


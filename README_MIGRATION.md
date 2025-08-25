# Migration Supabase vers Django API - Branche Customization

## 🚀 Vue d'ensemble

Cette branche contient la migration complète de l'application e-commerce ADDINA de Supabase vers Django API, réalisée par **Manus AI**.

## 📁 Structure du Projet

```
├── src/                          # Frontend React (modifié)
│   ├── services/api.ts          # Service API Django (NOUVEAU)
│   ├── hooks/                   # Hooks Django (NOUVEAUX)
│   │   ├── useAuthDjango.tsx
│   │   ├── useCartDjango.tsx
│   │   ├── useProductsDjango.tsx
│   │   └── useWishlistDjango.tsx
│   ├── config/api.ts            # Configuration API (NOUVEAU)
│   └── ...                      # Composants modifiés
├── backend/                     # Backend Django API (NOUVEAU)
│   ├── ecommerce_api/          # Configuration Django
│   ├── shop/                   # Application e-commerce
│   ├── populate_data.py        # Script de données de test
│   └── manage.py               # Gestionnaire Django
├── MIGRATION_GUIDE.md          # Guide complet (50+ pages)
├── INSTALLATION_RAPIDE.md      # Installation en 10 minutes
└── README_MIGRATION.md         # Ce fichier
```

## ⚡ Installation Rapide

### 1. Backend Django
```bash
cd backend
pip3 install django djangorestframework djangorestframework-simplejwt django-cors-headers
python3 manage.py migrate
python3 manage.py createsuperuser
python3 populate_data.py
python3 manage.py runserver 0.0.0.0:8000
```

### 2. Frontend React
```bash
npm install
npm run dev
```

### 3. Accès
- **Application :** http://localhost:8081
- **API Django :** http://localhost:8000/api/products/
- **Admin Django :** http://localhost:8000/admin/

## 🔄 Changements Principaux

### Frontend
- ✅ Nouveaux services API pour remplacer Supabase
- ✅ Hooks React adaptés pour Django API
- ✅ Composants mis à jour (Header, ProductCard, Cart, Checkout)
- ✅ Configuration de basculement Supabase/Django

### Backend
- ✅ API Django REST Framework complète
- ✅ Modèles de données (Product, Profile, CartItem, etc.)
- ✅ Authentification JWT
- ✅ Interface d'administration
- ✅ 10 produits de test pré-chargés

## 📋 Fonctionnalités Migrées

- **Authentification** : JWT remplace Supabase Auth
- **Catalogue Produits** : API Django avec pagination
- **Gestion Panier** : CRUD complet via Django
- **Liste de Souhaits** : Gestion des favoris
- **Commandes** : Système de commandes complet
- **Interface Admin** : Django Admin pour la gestion

## 🛠 Technologies

**Frontend :** React 18, TypeScript, Tailwind CSS, Axios  
**Backend :** Django 5.2, Django REST Framework, JWT, SQLite/PostgreSQL  
**Architecture :** API REST, Authentification JWT, CORS configuré

## 📚 Documentation

- **MIGRATION_GUIDE.md** : Guide détaillé de migration (10 sections)
- **INSTALLATION_RAPIDE.md** : Installation en 10 minutes
- Code entièrement commenté pour faciliter la maintenance

## 🎯 Statut

✅ **Migration 100% Fonctionnelle**  
✅ **Tests Validés**  
✅ **Documentation Complète**  
✅ **Prêt pour Production**

---

**Auteur :** Manus AI  
**Date :** 25 août 2025  
**Version :** 1.0  

Pour toute question, consultez le guide de migration complet ou l'installation rapide.


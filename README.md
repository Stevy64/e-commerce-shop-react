# 🛒 Gabomazone - E-commerce Platform

Application e-commerce complète avec frontend React et backend Django API.

## 📁 Structure du Projet

```
├── gabomazone-frontend/     # Frontend React TypeScript
│   ├── src/                # Code source React
│   ├── public/             # Assets statiques
│   └── package.json        # Dépendances Node.js
├── gabomazone_backend/     # Backend Django API
│   ├── ecommerce_api/      # Configuration Django
│   ├── shop/               # Application e-commerce
│   ├── manage.py           # Gestionnaire Django
│   └── requirements.txt    # Dépendances Python
├── MIGRATION_GUIDE.md      # Guide de migration détaillé
├── INSTALLATION_RAPIDE.md  # Installation en 10 minutes
└── README_MIGRATION.md     # Documentation de migration
```

## 🚀 Installation Rapide

### 1. Backend Django
```bash
cd gabomazone_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python populate_data.py
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend React
```bash
cd gabomazone-frontend
npm install
npm run dev
```

### 3. Accès
- **Application :** http://localhost:8081
- **API Django :** http://localhost:8000/api/products/
- **Admin Django :** http://localhost:8000/admin/

## ✨ Fonctionnalités

- 🔐 **Authentification JWT**
- 🛍️ **Catalogue produits avec pagination**
- 🛒 **Gestion panier et liste de souhaits**
- 📦 **Système de commandes**
- 👨‍💼 **Interface d'administration Django**
- 📱 **Design responsive**

## 🛠 Technologies

**Frontend :** React 18, TypeScript, Vite, Tailwind CSS, Axios  
**Backend :** Django 5.2, Django REST Framework, JWT, SQLite/PostgreSQL

## 📚 Documentation

- **MIGRATION_GUIDE.md** - Guide détaillé de migration Supabase → Django
- **INSTALLATION_RAPIDE.md** - Installation en 10 minutes
- **README_MIGRATION.md** - Vue d'ensemble de la migration

## 🎯 Migration Supabase → Django

Ce projet est le résultat d'une migration complète de Supabase vers Django API, conservant le même frontend React tout en remplaçant le backend par une solution Django personnalisée.

**Avantages de la migration :**
- ✅ Contrôle total du backend
- ✅ Coûts maîtrisés
- ✅ Performance optimisée
- ✅ Sécurité renforcée
- ✅ Évolutivité sur mesure

---

**Auteur :** Manus AI  
**Version :** 1.0  
**Date :** 25 août 2025


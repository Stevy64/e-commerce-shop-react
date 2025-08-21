# Guide d'Installation - Site E-commerce ADDINA

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure) - [Télécharger ici](https://nodejs.org/)
- **npm** (inclus avec Node.js) ou **yarn**
- **Git** - [Télécharger ici](https://git-scm.com/)

## 🚀 Installation depuis GitHub

### 1. Cloner le dépôt

```bash
# Cloner le projet (remplacez [VOTRE-REPO-URL] par l'URL de votre dépôt GitHub)
git clone [VOTRE-REPO-URL]
cd addina-ecommerce

# Ou si vous utilisez SSH
git clone git@github.com:[VOTRE-USERNAME]/[VOTRE-REPO-NAME].git
cd addina-ecommerce
```

### 2. Installer les dépendances

```bash
# Installer les dépendances avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Lancer le serveur de développement

```bash
# Démarrer l'application en mode développement
npm run dev

# Ou avec yarn
yarn dev
```

L'application sera accessible à l'adresse : **http://localhost:8080**

## 🔧 Scripts disponibles

```bash
# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build de production
npm run preview

# Vérification du code (linting)
npm run lint
```

## 📁 Structure du projet

```
addina-ecommerce/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── ui/            # Composants UI (Shadcn)
│   │   ├── Header.tsx     # En-tête avec navigation
│   │   ├── Hero.tsx       # Section héro
│   │   ├── ProductCard.tsx # Carte produit
│   │   └── ...
│   ├── pages/             # Pages de l'application
│   │   ├── Index.tsx      # Page d'accueil
│   │   ├── About.tsx      # À propos
│   │   ├── Shop.tsx       # Boutique
│   │   ├── Blog.tsx       # Blog
│   │   ├── Contact.tsx    # Contact
│   │   └── ProductDetails.tsx # Détails produit
│   ├── utils/             # Fonctions utilitaires
│   │   └── currency.ts    # Formatage devise FCFA
│   ├── App.tsx           # Composant principal
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── package.json          # Dépendances et scripts
├── tailwind.config.ts    # Configuration Tailwind
├── vite.config.ts        # Configuration Vite
└── README.md            # Documentation
```

## 🌍 Technologies utilisées

- **React 18** - Framework JavaScript
- **TypeScript** - Typage statique
- **Vite** - Bundler et serveur de développement
- **Tailwind CSS** - Framework CSS utilitaire
- **Shadcn/ui** - Composants UI
- **React Router DOM** - Routage
- **Lucide React** - Icônes

## 💰 Devise et langue

- **Devise** : Franc CFA (FCFA)
- **Langue** : Français uniquement
- **Formatage des prix** : Fonction `formatPrice()` dans `src/utils/currency.ts`

## 🔧 Configuration

### Variables d'environnement

Si nécessaire, créez un fichier `.env.local` à la racine du projet :

```env
# Exemple de variables d'environnement
VITE_API_URL=https://votre-api.com
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-clé-publique
```

### Personnalisation du thème

Les couleurs et le design système sont configurés dans :
- `src/index.css` - Variables CSS et thème
- `tailwind.config.ts` - Configuration Tailwind

## 📱 Pages disponibles

- **/** - Accueil avec sections produits
- **/about** - À propos de l'entreprise
- **/shop** - Boutique avec filtres
- **/blog** - Articles de blog
- **/contact** - Formulaire de contact
- **/product-details** - Détails d'un produit

## 🚨 Résolution de problèmes

### Port déjà utilisé
Si le port 8080 est occupé :
```bash
# Spécifier un autre port
npm run dev -- --port 3000
```

### Erreurs de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### Build échoue
```bash
# Vérifier les erreurs TypeScript
npm run build
```

## 🎯 Prochaines étapes

1. **Authentification vendeur** : Connecter Supabase pour l'espace vendeur
2. **Base de données** : Configurer les produits et articles
3. **Paiement** : Intégrer un système de paiement
4. **SEO** : Optimiser pour les moteurs de recherche

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation
2. Consultez les logs d'erreur dans la console
3. Contactez l'équipe de développement

## 🔄 Mise à jour

Pour récupérer les dernières modifications :

```bash
# Récupérer les changements depuis GitHub
git pull origin main

# Mettre à jour les dépendances si nécessaire
npm install
```

---

**Prêt à développer !** 🎉

Votre site e-commerce ADDINA est maintenant installé et prêt à être utilisé.
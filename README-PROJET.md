# Site E-commerce ADDINA

## 📝 Description
Site e-commerce moderne développé en React avec Vite, inspiré du template Addina. Interface entièrement en français avec devise en Franc CFA (FCFA).

## 🚀 Technologies Utilisées
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Routage**: React Router DOM
- **Icons**: Lucide React
- **État**: React Query (TanStack)

## 📁 Structure du Projet
```
src/
├── components/         # Composants réutilisables
│   ├── ui/            # Composants UI (Shadcn)
│   ├── Header.tsx     # En-tête avec navigation
│   ├── Hero.tsx       # Section héro
│   ├── ProductCard.tsx # Carte produit
│   ├── ProductSection.tsx # Section produits
│   ├── BenefitsSection.tsx # Avantages
│   ├── TestimonialsSection.tsx # Témoignages
│   ├── BlogSection.tsx # Section blog
│   └── Footer.tsx     # Pied de page
├── pages/             # Pages de l'application
│   ├── Index.tsx      # Page d'accueil
│   ├── About.tsx      # À propos
│   ├── Shop.tsx       # Boutique
│   ├── Blog.tsx       # Blog
│   ├── Contact.tsx    # Contact
│   └── ProductDetails.tsx # Détails produit
├── utils/             # Utilitaires
│   └── currency.ts    # Formatage devise FCFA
└── App.tsx           # Composant principal
```

## 🎨 Système de Design
- **Couleurs**: Palette neutre avec accents chaleureux
- **Typography**: Police système avec hiérarchie claire
- **Spacing**: Système basé sur Tailwind
- **Responsive**: Mobile-first design

## 💰 Gestion des Prix
Tous les prix sont en **Franc CFA (FCFA)**
- Fonction `formatPrice()` pour formatage uniforme
- Support des prix barrés et remises
- Affichage avec séparateurs de milliers

## 🧩 Composants Clés

### Header
- Navigation principale en français
- Sélecteur de langue et devise
- Barre de recherche
- Icônes panier/favoris/profil

### ProductCard
- Image avec zoom au survol
- Badges "Nouveau" et remise
- Boutons d'action (Panier, Favoris, Aperçu)
- Prix formaté en FCFA

### ProductSection
- Affichage en grille responsive
- Titre de section personnalisable
- Bouton "Voir Tout"

## 🔧 Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Mode développement
npm run dev

# Build de production
npm run build

# Aperçu du build
npm run preview
```

## 📱 Pages Disponibles
- **/** - Accueil avec sections produits
- **/about** - À propos de l'entreprise
- **/shop** - Boutique avec filtres
- **/blog** - Articles de blog
- **/contact** - Formulaire de contact
- **/product-details** - Détails d'un produit

## 🛠 Fonctionnalités à Implémenter

### Authentification Vendeur
Pour ajouter l'authentification vendeur et permettre la publication d'articles, vous devez d'abord connecter votre projet à **Supabase**.

**Étapes requises:**
1. Cliquer sur le bouton vert **Supabase** en haut à droite
2. Connecter votre projet à Supabase
3. Une fois connecté, l'IA pourra implémenter:
   - Système d'authentification
   - Espace vendeur
   - Publication d'articles
   - Gestion des produits

### Autres Fonctionnalités Possibles
- Panier d'achat persistant
- Système de favoris
- Filtres avancés de recherche
- Système de notation produits
- Commandes et paiement
- Notifications en temps réel

## 🎯 Standards de Code
- **TypeScript** strict activé
- **ESLint** pour la qualité du code
- **Prettier** pour le formatage
- Composants fonctionnels avec hooks
- Props typées avec interfaces
- Documentation JSDoc pour les fonctions utilitaires

## 🌍 Internationalisation
Interface entièrement en **français**:
- Navigation et menus
- Textes de l'interface
- Messages d'erreur
- Libellés des boutons
- Descriptions produits

## 💡 Conventions de Nommage
- **Composants**: PascalCase (`ProductCard.tsx`)
- **Fichiers utilitaires**: camelCase (`currency.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Props interfaces**: `ComponentNameProps`

## 🚨 Points d'Attention
- Tous les prix doivent utiliser `formatPrice()` de `utils/currency.ts`
- Utiliser les tokens de couleur du design system (pas de couleurs directes)
- Tester la responsivité sur tous les breakpoints
- Vérifier l'accessibilité (alt, aria-labels)

## 📞 Support
Pour toute question ou amélioration, contactez l'équipe de développement.
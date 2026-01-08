# 🏃 Carnet d'Entraînement Trail & Course à Pied

Progressive Web App (PWA) pour suivre vos séances d'entraînement en course à pied et trail, avec un focus sur le suivi des sensations au niveau des rotules et la prévention des blessures.

## ✨ Fonctionnalités

### 📝 Saisie d'Entraînement
- Formulaire complet pour chaque séance :
  - Date, type de séance (EF, VMA, Tempo, Sortie longue, etc.)
  - Distance (km), dénivelé positif et négatif (D+/D-)
  - Durée (HH:MM)
  - **Sensation rotule** (échelle 0-10 avec slider visuel)
  - Moment d'apparition de gêne, temps de récupération
  - Notes générales
  - Suivi des chaussures utilisées

### 📊 Dashboard & Statistiques
- **Statistiques en temps réel** :
  - Volume hebdomadaire et mensuel (km, D+, nombre de séances)
  - Moyenne sensation rotule
- **Graphiques interactifs** (Recharts) :
  - Évolution du volume hebdomadaire (bar chart)
  - Évolution sensation rotule (line chart)
  - Répartition des types de séances (pie chart)
- **Alerte intelligente** :
  - Avertissement si augmentation >10% du volume hebdo

### 📜 Historique
- Liste complète des séances avec filtres :
  - Par type de séance
  - Par période (7 jours, 30 jours, personnalisé)
  - Tri par date ou distance
- Recherche rapide
- Affichage des sensations rotule et moments de gêne

### 📅 Calendrier
- Vue mensuelle avec code couleur par type de séance
- Navigation mois par mois
- Clic sur une séance pour voir les détails

### ⚙️ Paramètres
- **Export/Import** :
  - Export Excel (.xlsx), CSV, JSON
  - Import depuis Excel/CSV/JSON
  - Validation automatique des données importées
- **Gestion des chaussures** :
  - Ajout/suppression de paires
  - Suivi automatique du kilométrage par paire
  - Activation/désactivation
- **Préférences** :
  - Mode sombre
  - Alertes de volume hebdomadaire
- **Zone de danger** :
  - Effacement complet des données (avec double confirmation)

### 💾 Sauvegarde Locale
- Stockage 100% local via localStorage
- Sauvegarde automatique à chaque modification
- Aucun serveur requis - toutes les données restent sur votre appareil
- Fonctionnement offline complet

### 📱 PWA (Progressive Web App)
- **Installable** sur écran d'accueil (mobile & desktop)
- **Fonctionne offline** après première visite
- **Service Worker** pour cache intelligent
- **Design mobile-first** optimisé pour smartphones (375-414px)
- Boutons tactiles >= 44px pour facilité d'utilisation mobile

## 🛠 Stack Technique

- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite 7
- **Styling** : Tailwind CSS v3
- **Routing** : React Router v6
- **Charts** : Recharts
- **Export** : SheetJS (xlsx)
- **Dates** : date-fns
- **Icons** : Lucide React
- **PWA** : Vite Plugin PWA

## 🚀 Installation & Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 📁 Structure du Projet

```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Slider.tsx
│   │   ├── Textarea.tsx
│   │   └── Card.tsx
│   └── Layout.tsx       # Layout avec navigation bottom bar
├── pages/
│   ├── Dashboard.tsx    # Page d'accueil avec stats et graphiques
│   ├── NewSession.tsx   # Formulaire nouvelle séance
│   ├── History.tsx      # Liste des séances avec filtres
│   ├── SessionDetail.tsx # Détail/édition d'une séance
│   ├── Calendar.tsx     # Vue calendrier mensuel
│   └── Settings.tsx     # Paramètres et export/import
├── services/
│   ├── storage.ts       # Service localStorage (CRUD)
│   ├── export.ts        # Export Excel/CSV/JSON
│   └── import.ts        # Import avec validation
├── hooks/
│   ├── useAppData.tsx   # Context React pour état global
│   └── useStats.ts      # Calculs statistiques
├── types/
│   └── training.ts      # Types TypeScript
├── lib/
│   └── utils.ts         # Fonctions utilitaires
└── index.css            # Styles Tailwind + variables CSS

```

## 🎨 Design

- **Palette de couleurs** : Thème trail/nature (vert forêt, bleu, gris anthracite)
- **Mode sombre** intégré avec switch dans les paramètres
- **Responsive** : Mobile-first, s'adapte tablette et desktop
- **Accessibility** : Boutons >= 44px, labels clairs, feedback visuel

## 📊 Modèle de Données

```typescript
interface TrainingSession {
  id: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  type: SessionType;
  distance: number; // km
  denivele_positif: number; // mètres
  denivele_negatif: number; // mètres
  duree: string; // HH:MM
  sensation_rotule: number; // 0-10
  moment_gene?: string;
  temps_recup?: string;
  notes?: string;
  chaussures: string;
}
```

## 🔐 Sécurité & Confidentialité

- **100% local** : Toutes les données sont stockées uniquement sur votre appareil
- **Aucun tracking** : Pas de Google Analytics, pas de cookies tiers
- **Aucun serveur** : Pas de transmission de données
- **Export contrôlé** : Vous décidez quand et où exporter vos données

## 🚀 Déploiement

L'application peut être déployée sur :
- **Vercel** : `vercel deploy`
- **Netlify** : `netlify deploy`
- **GitHub Pages** : Avec GitHub Actions
- **Tout hébergeur statique**

## 📝 Licence

MIT

## 🤝 Contribution

Contributions bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## ⚡ Performances

- Build optimisé < 1.2 MB
- Chargement initial < 2s
- Lazy loading des composants lourds
- Cache agressif via Service Worker

## 🎯 Roadmap Future

- [ ] Sync cloud optionnelle (Google Drive, Dropbox)
- [ ] Import fichiers Garmin (.fit, .tcx)
- [ ] Plans d'entraînement intégrés par phases
- [ ] Notifications push (rappel saisie séance)
- [ ] Widget récapitulatif hebdomadaire
- [ ] Export PDF avec graphiques

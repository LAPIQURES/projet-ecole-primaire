# 🏫 École Alanya — Application Web de Gestion Scolaire

> Application web complète de gestion d'école primaire développée avec **React.js** (frontend) et **Node.js / Express** (backend), base de données **MySQL**.

---

## 📋 Sommaire

1. [Présentation](#présentation)
2. [Architecture technique](#architecture-technique)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Démarrage](#démarrage)
7. [Comptes utilisateurs & rôles](#comptes-utilisateurs--rôles)
8. [Guide d'utilisation par rôle](#guide-dutilisation-par-rôle)
   - [Administrateur](#-administrateur-rouge)
   - [Directeur](#-directeur-violet)
   - [Intendant](#-intendant-vert)
   - [Enseignant](#-enseignant-orange)
   - [Parent](#-parent-bleu)
9. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
10. [Structure du projet](#structure-du-projet)
11. [API Backend](#api-backend)
12. [Dépannage](#dépannage)
13. [Sécurité](#sécurité)

---

## Présentation

L'application **École Alanya** est une plateforme numérique intégrée qui centralise l'ensemble de la gestion d'un établissement scolaire primaire :

- 📚 Gestion pédagogique (élèves, classes, cours, notes, bulletins)
- 💰 Gestion financière (inscriptions, paiements, tranches, reçus)
- 👥 Gestion des utilisateurs (5 types de comptes avec couleurs distinctives)
- 💬 Messagerie interne en temps réel (WebSocket)
- 📊 Tableaux de bord personnalisés par rôle
- 🔒 Authentification sécurisée JWT + bcryptjs

---

## Architecture technique

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (React 19)                │
│  React Router v7 · Recharts · Lucide-react      │
│  Axios · Socket.io-client · Tailwind CSS v4     │
│  Port : 3000                                    │
└───────────────────┬─────────────────────────────┘
                    │ HTTP REST + WebSocket
┌───────────────────▼─────────────────────────────┐
│              BACKEND (Node.js)                  │
│  Express v4 · JWT · bcryptjs · Socket.io v4     │
│  mysql2 · dotenv · cors                         │
│  Port : 5000                                    │
└───────────────────┬─────────────────────────────┘
                    │ MySQL2 Pool
┌───────────────────▼─────────────────────────────┐
│              BASE DE DONNÉES (MySQL)            │
│  30+ tables · Connexion distante sécurisée      │
│  ecole2026 (host configuré dans .env)           │
└─────────────────────────────────────────────────┘
```

---

## Prérequis

| Logiciel | Version minimale | Vérification |
|----------|-----------------|--------------|
| Node.js  | 18.x ou +       | `node --version` |
| npm      | 9.x ou +        | `npm --version` |
| MySQL    | 8.x (distante ou locale) | — |
| Navigateur | Chrome 100+, Firefox 100+, Edge 100+ | — |

---

## Installation

### 1. Cloner / extraire le projet

```bash
unzip projet-ecole-primaire-FINAL.zip
cd projet-ecole-primaire-corrige/projet-ecole-primaire
```

### 2. Installer les dépendances Frontend

```bash
# À la racine du projet (là où se trouve vite.config.js)
npm install
```

### 3. Installer les dépendances Backend

```bash
cd backend
npm install
cd ..
```

---

## Configuration

### Variables d'environnement

Créez ou modifiez le fichier **`.env`** à la racine du projet :

```env
# Base de données MySQL
DB_HOST=163.123.183.89
DB_PORT=17705
DB_USER=ecole
DB_PASSWORD=peda2026
DB_NAME=ecole2026

# Sécurité JWT
JWT_SECRET=votre-secret-jwt-ultra-securise-changez-moi

# Port backend (optionnel, défaut: 5000)
PORT=5000
```

> ⚠️ **Important** : Ne committez jamais le fichier `.env` sur Git. Il est déjà dans le `.gitignore`.

---

## Démarrage

Ouvrez **deux terminaux** :

### Terminal 1 — Backend

```bash
cd backend
npm run dev        # avec nodemon (rechargement automatique)
# ou
npm start          # sans rechargement automatique
```

Vous devriez voir :
```
✅ Backend lancé sur http://localhost:5000
📊 BD: 163.123.183.89:17705
✅ Connecté à MySQL (ecole2026)
```

### Terminal 2 — Frontend

```bash
# À la racine du projet
npm run dev
```

Vous devriez voir :
```
VITE v8.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

Ouvrez votre navigateur sur **http://localhost:3000**

---

## Comptes utilisateurs & rôles

L'application gère **5 types de comptes**, chacun avec une couleur distinctive et un dashboard dédié :

| Rôle | Couleur | Dashboard | typeAdmin/typePersonne |
|------|---------|-----------|----------------------|
| 🔴 **Administrateur** | Rouge `#DC3545` | `/dashboard` | typeAdmin = 2 |
| 🟣 **Directeur** | Violet `#6F42C1` | `/directeur/dashboard` | typeAdmin = 3 |
| 🟢 **Intendant** | Vert `#28A745` | `/intendant/dashboard` | typeAdmin = 4 |
| 🟠 **Enseignant** | Orange `#FD7E14` | `/enseignant/dashboard` | typePersonne = 2 |
| 🔵 **Parent** | Bleu `#007BFF` | `/parent/dashboard` | typePersonne = 3 |

> **Note** : Le compte **Superadmin** (typeAdmin = 1) a accès total. Un seul compte superadmin existe par défaut.

### Connexion

1. Allez sur `http://localhost:3000/login`
2. Saisissez votre **nom d'utilisateur** (`username`) et **mot de passe**
3. Vous êtes automatiquement redirigé vers le dashboard de votre rôle

---

## Guide d'utilisation par rôle

---

### 🔴 Administrateur (Rouge)

**URL** : `http://localhost:3000/dashboard`

L'administrateur est le **gestionnaire principal** du système. Il a accès à toutes les fonctionnalités.

#### Tableau de bord Admin
- Statistiques globales (élèves, enseignants, paiements, classes)
- Graphiques d'évolution mensuelle des inscriptions et paiements
- Activité récente et alertes système
- Accès rapide aux fonctions critiques

#### Gestion des utilisateurs
> Menu latéral → Enseignants / Parents / Paramètres

**Créer un compte enseignant :**
1. Menu → **Enseignants** → bouton **+ Ajouter**
2. Remplir : Nom, Prénom, Username, Mot de passe, Mobile
3. Valider → l'enseignant peut se connecter immédiatement

**Créer un compte parent :**
1. Menu → **Parents** → bouton **+ Ajouter**
2. Remplir : Nom, Prénom, Username, Mot de passe, Matricule de l'enfant
3. Valider

**Créer un compte directeur ou intendant :**
1. Menu → **Paramètres** → onglet **Utilisateurs**
2. Choisir le rôle (Directeur / Intendant)
3. Remplir les informations et valider

**Gérer les comptes existants :**
- ✏️ Modifier les informations d'un compte
- 🔒 Bloquer/Débloquer un compte
- 🔑 Réinitialiser un mot de passe (retourne le mot de passe temporaire)
- 🗑️ Supprimer un compte

#### Gestion des élèves
> Menu → **Élèves**

- **Ajouter** un élève : Matricule, Nom, Prénom, Date de naissance, Sexe, Photo, Classe
- **Modifier** les informations d'un élève
- **Rechercher** par matricule, nom ou prénom
- **Désactiver** un élève sans supprimer ses données
- **Consulter** l'historique complet (notes, paiements, sanctions)

#### Gestion académique
> Menu → **Classes & Salles / Cours & Évaluations / Emploi du temps**

- **Classes** : Créer/modifier les classes et cycles scolaires
- **Salles** : Gérer les salles avec position et superficie
- **Cours** : Créer les matières avec coefficient et classe associée
- **Emploi du temps** : Planifier par jour, heure, classe et salle

#### Gestion financière
> Menu → **Paiements / Tranches / Inscriptions**

- Configurer les **tranches** de paiement avec montants et délais
- Enregistrer les **inscriptions** des élèves
- Suivre les **paiements** par élève et par tranche
- Configurer les **modes de paiement** (Espèces, Mobile Money, Chèque, Virement)

#### Configuration système
> Menu → **Paramètres**

- Profil administrateur (modifier mot de passe)
- Modes de paiement
- Configuration de la scolarité par cycle
- Gestion des années académiques et trimestres

#### Journal d'audit
> Menu → **Audit**

- Historique complet des actions de tous les utilisateurs
- Filtrer par date, utilisateur, type d'action
- Horodatage précis de chaque opération

---

### 🟣 Directeur (Violet)

**URL** : `http://localhost:3000/directeur/dashboard`

Le directeur a une **vue globale en lecture** sur tous les aspects de l'école, et peut communiquer avec tous les acteurs.

#### Tableau de bord Directeur
- Nombre total d'élèves, enseignants, salles
- Taux de recouvrement des paiements
- Résumé des classes avec leurs effectifs
- Accès rapide aux fonctions de communication

#### Supervision des élèves
> Onglet **Élèves & Classes**

- Liste complète de tous les élèves avec leur classe et statut
- Filtre par classe pour voir les effectifs
- Visualisation du statut de chaque élève (actif/inactif)

#### Supervision des enseignants
> Onglet **Enseignants**

- Liste de tous les enseignants avec leurs matières affectées
- Contact mobile de chaque enseignant
- Statut actif/inactif

#### Supervision des paiements
> Onglet **Paiements**

- Vue globale des paiements par élève
- Indicateurs visuels du nombre de tranches payées (1, 2, 3)
- Taux de recouvrement global avec barre de progression
- Accès aux détails de paiement de chaque élève

#### Communication
> Onglet **Messages** ou boutons dans le banner

**Envoyer un message individuel :**
1. Bouton **Nouveau message** (en haut du dashboard)
2. Sélectionner le destinataire (enseignant, parent, intendant, admin)
3. Saisir l'objet et le contenu
4. Envoyer

**Passer un communiqué général :**
1. Bouton **Passer un communiqué** (en haut, fond violet)
2. L'objet et le message sont envoyés à TOUS les utilisateurs
3. Idéal pour les annonces de rentrée, fermetures, événements

#### Consultation complète
- **Notes & Évaluations** : voir les notes de toutes les classes
- **Bulletins** : consulter les bulletins scolaires
- **Discipline** : voir les sanctions enregistrées
- **Emploi du temps** : vue de l'emploi du temps général
- **Statistiques** : rapports et graphiques détaillés

---

### 🟢 Intendant (Vert)

**URL** : `http://localhost:3000/intendant/dashboard`

L'intendant gère **toute la partie financière** de l'école.

#### Tableau de bord Intendant
- Total encaissé (en FCFA)
- Nombre d'élèves à jour de leurs paiements
- Nombre d'élèves sans aucun paiement (impayés)
- Taux de recouvrement global avec barre de progression visuelle
- Derniers paiements enregistrés avec bouton d'impression

#### Enregistrer un paiement
> Bouton **+ Enregistrer un paiement** (en haut du dashboard ou onglet Paiements)

1. Saisir le **matricule** de l'élève
2. Indiquer le **montant** payé (en FCFA)
3. Sélectionner la **tranche** (1, 2, 3...)
4. Choisir le **mode de paiement** : Espèces / Mobile Money / Chèque / Virement
5. Ajouter un **commentaire** optionnel
6. Valider → le paiement est enregistré immédiatement

#### Imprimer un reçu
> Onglet **Paiements** → colonne **Reçu** → bouton 🖨️ Imprimer

- Un reçu PDF est généré automatiquement avec :
  - Nom de l'école, matricule, montant, date, mode de paiement
  - Numéro de reçu unique
  - Impression directe via le navigateur

#### Gérer les impayés
> Onglet **⚠️ Impayés**

- Liste de tous les élèves sans aucun paiement
- Pour chaque élève : bouton **+ Paiement** pour enregistrer directement
- Bouton **🔔** pour envoyer une notification de retard au parent

**Envoyer une notification de retard :**
1. Onglet Impayés → cliquer sur 🔔 à côté de l'élève
2. Le message est pré-rempli avec les informations de l'élève
3. Modifier si nécessaire et envoyer

**Notifier tous les parents en retard :**
1. Bouton **Notifier tous les parents** (en haut de l'onglet Impayés)
2. Saisir le message général
3. Envoyer → tous les parents concernés reçoivent la notification

#### Consulter les élèves
> Onglet **👤 Élèves**

- Vue complète de tous les élèves avec le total payé et le nombre de paiements
- Recherche par nom ou matricule
- Accès rapide pour enregistrer un paiement pour chaque élève

#### Rapport financier
> Menu → **Rapport financier**

- Synthèse complète des entrées financières
- Filtrage par période
- Export possible vers PDF

---

### 🟠 Enseignant (Orange)

**URL** : `http://localhost:3000/enseignant/dashboard`

L'enseignant gère **l'aspect pédagogique** de ses classes.

#### Tableau de bord Enseignant
- Ses cours et classes affectés
- Nombre d'élèves dans ses classes
- Évaluations récentes
- Messages non lus
- Emploi du temps de la semaine

#### Navigation dans le dashboard
Le dashboard enseignant est une **application dans l'application** avec des onglets internes :
- 📊 **Vue d'ensemble** : statistiques personnalisées
- 👥 **Mes élèves** : liste des élèves de ses classes
- 📚 **Cours & Évaluations** : gestion des notes et épreuves
- 💬 **Messages** : messagerie intégrée

#### Gestion des épreuves et notes
> Onglet **Cours & Évaluations** dans le dashboard

**Créer une épreuve :**
1. Sélectionner la matière et la classe
2. Définir la nature : Contrôle Continu / Examen / Devoir Mercredi / Devoir Week-end
3. Donner un libellé à l'épreuve
4. Enregistrer

**Saisir les notes :**
1. Sélectionner l'épreuve créée
2. La liste des élèves s'affiche automatiquement
3. Saisir la note de chaque élève (sur 20)
4. Pour un élève absent : cocher "Absent"
5. Valider → les moyennes sont recalculées automatiquement

**Modifier une note :**
- Cliquer sur la note dans la liste
- Saisir la nouvelle valeur
- Valider

#### Enregistrer une sanction
> Menu → **Discipline**

1. Sélectionner l'élève concerné
2. Choisir le type : Absence / Retard / Infraction / Convocation / Avertissement / Renvoi
3. Saisir le libellé et la description
4. Indiquer la date de l'événement et la gravité (Léger / Moyen / Grave)
5. Ajouter la punition si applicable
6. Enregistrer

#### Consulter l'emploi du temps
> Menu → **Emploi du temps** ou `/enseignant/emploi-du-temps`

- Vue hebdomadaire avec les cours par jour et par heure
- Salle, classe et matière affichés pour chaque créneau
- Navigation entre les semaines

#### Communication avec les parents
> Onglet **Messages** ou Menu → **Messages**

1. Cliquer sur **Nouveau message**
2. Sélectionner le parent destinataire
3. Saisir l'objet et le contenu du message
4. Envoyer → le parent reçoit une notification

#### Consulter les informations d'un élève
> Dashboard → onglet **Mes élèves** → cliquer sur un élève

Vous pouvez voir :
- Informations personnelles (date de naissance, lieu, contact)
- Notes et moyennes par matière
- Sanctions enregistrées
- Parents/tuteurs associés

#### Générer les bulletins
> Menu → **Bulletins**

1. Sélectionner la classe et le trimestre
2. Choisir l'élève
3. Cliquer sur **Générer**
4. Le bulletin PDF s'ouvre avec toutes les notes et moyennes
5. Imprimer ou télécharger

---

### 🔵 Parent (Bleu)

**URL** : `http://localhost:3000/parent/dashboard`

Le parent a un accès **exclusivement en lecture** aux informations de son/ses enfants.

#### Tableau de bord Parent
- Résumé des informations de chaque enfant associé au compte
- Dernières notes obtenues
- Prochaines échéances de paiement
- Messages non lus

#### Consulter les notes
> Dashboard → section **Notes** ou Menu → **Notes**

- Sélectionner l'enfant (si plusieurs enfants associés)
- Voir les notes par matière et par trimestre
- Voir la moyenne générale calculée automatiquement

#### Consulter les bulletins
> Menu → **Bulletins**

1. Sélectionner l'enfant et le trimestre
2. Cliquer sur **Voir** pour afficher le bulletin
3. Cliquer sur **Télécharger** pour sauvegarder en PDF

#### Consulter les sanctions
> Dashboard → section **Discipline**

- Liste des sanctions avec date, libellé, gravité et commentaire de l'enseignant
- Historique complet pour suivre l'évolution comportementale

#### Consulter les paiements
> Menu → **Paiements**

- Historique de tous les paiements effectués pour l'enfant
- Montant total payé et solde restant
- Détail de chaque paiement (date, mode, tranche)

#### Consulter l'emploi du temps
> Menu → **Emploi du temps**

- L'emploi du temps de l'enfant est automatiquement affiché
- Vue par semaine avec les cours, horaires et salles

#### Communiquer avec l'école
> Menu → **Messages**

Le parent peut envoyer des messages à :
- 👨‍💼 **L'administrateur** : questions générales
- 👩‍🏫 **Un enseignant** : suivi pédagogique
- 🏛️ **Le directeur** : questions importantes
- 💰 **L'intendant** : questions financières

**Envoyer un message :**
1. Menu → **Messages** → bouton **Nouveau message**
2. Sélectionner le destinataire
3. Saisir l'objet et le contenu
4. Envoyer

---

## Fonctionnalités détaillées

### 💬 Messagerie en temps réel
- Communication WebSocket via **Socket.io**
- Notifications instantanées à la réception d'un message
- Conversations organisées par contact
- Groupes de discussion possibles
- Marquage lu/non lu automatique
- Communiqués envoyés à tous les utilisateurs d'un rôle

### 📊 Tableaux de bord personnalisés
- Chaque rôle a son propre tableau de bord avec les indicateurs pertinents
- Graphiques interactifs (courbes d'évolution, camemberts, barres)
- Données actualisées en temps réel

### 📄 Génération de PDF
- **Bulletins scolaires** : notes par matière, moyennes, appréciations
- **Reçus de paiement** : montant, date, mode, référence
- Impression directe depuis le navigateur

### 🔐 Sécurité
- Mots de passe hachés avec **bcryptjs** (10 rounds de salt)
- Tokens JWT avec expiration 24h
- Contrôle d'accès par rôle (RBAC)
- Interception automatique du token dans toutes les requêtes API

### 📱 Design responsive
- Interface adaptée aux écrans d'ordinateur, tablettes et smartphones
- Sidebar rétractable pour maximiser l'espace de travail
- Couleurs distinctives par rôle pour identifier rapidement le type de compte

---

## Structure du projet

```
projet-ecole-primaire/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── Layout.jsx            # Layout Admin (rouge)
│   │   ├── Sidebar.jsx           # Sidebar Admin
│   │   ├── DirecteurLayout.jsx   # Layout Directeur (violet)
│   │   ├── IntendantLayout.jsx   # Layout Intendant (vert)
│   │   ├── TeacherLayout.jsx     # Layout Enseignant (orange)
│   │   ├── ParentLayout.jsx      # Layout Parent (bleu)
│   │   └── BulletinViewer.jsx    # Composant bulletins
│   │
│   ├── pages/
│   │   ├── Login.jsx             # Page de connexion
│   │   ├── Dashboard.jsx         # Dashboard Admin
│   │   ├── DashboardDirecteur.jsx# Dashboard Directeur
│   │   ├── DashboardIntendant.jsx# Dashboard Intendant
│   │   ├── DashboardEnseignant.jsx
│   │   ├── DashboardParent.jsx
│   │   ├── Eleves.jsx            # Gestion élèves
│   │   ├── Classes.jsx           # Gestion classes
│   │   ├── Enseignants.jsx       # Gestion enseignants
│   │   ├── CoursEvaluations.jsx  # Notes & épreuves
│   │   ├── Paiements.jsx         # Gestion paiements
│   │   ├── Inscriptions.jsx      # Inscriptions
│   │   ├── Messages.jsx          # Messagerie
│   │   ├── Bulletins.jsx         # Bulletins scolaires
│   │   ├── Discipline.jsx        # Sanctions
│   │   ├── Rapports.jsx          # Rapports
│   │   ├── Audit.jsx             # Journal d'audit
│   │   ├── Emploi.jsx            # Emploi du temps
│   │   ├── Parametres.jsx        # Paramètres système
│   │   ├── Salles.jsx            # Gestion salles
│   │   ├── Parents.jsx           # Gestion parents
│   │   ├── Tranches.jsx          # Tranches paiement
│   │   └── Bus.jsx               # Transport scolaire
│   │
│   ├── services/
│   │   ├── api.js               # Toutes les fonctions API (Axios)
│   │   └── socket.js            # Configuration WebSocket
│   │
│   ├── App.jsx                  # Routage principal (toutes les routes)
│   ├── main.jsx                 # Point d'entrée React
│   ├── index.css                # Styles globaux + Tailwind v4
│   └── App.css                  # Variables CSS et styles partagés
│
├── backend/
│   ├── controllers/             # Logique métier
│   │   ├── authController.js    # Auth + gestion utilisateurs
│   │   ├── eleveController.js
│   │   ├── enseignantController.js
│   │   ├── bulletinController.js
│   │   ├── paiementsController.js (via routes)
│   │   ├── messageController.js
│   │   ├── disciplineController.js
│   │   ├── rapportsController.js
│   │   └── ...
│   │
│   ├── routes/                  # Définition des routes Express
│   │   ├── auth.js
│   │   ├── eleves.js
│   │   ├── enseignants.js
│   │   ├── cours.js
│   │   ├── evaluations.js
│   │   ├── paiements.js
│   │   ├── messages.js
│   │   ├── bulletins.js
│   │   ├── discipline.js
│   │   ├── audit.js
│   │   ├── rapports.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.js              # Vérification JWT
│   │   └── verifyParent.js      # Vérification rôle parent
│   │
│   ├── database/
│   │   └── db.js                # Pool de connexion MySQL
│   │
│   ├── utils/
│   │   ├── schema.js            # Utilitaires schéma BDD
│   │   └── audit.js             # Logger d'audit
│   │
│   ├── config.js                # Configuration (env variables)
│   ├── server.js                # Point d'entrée backend
│   ├── socket.js                # Configuration Socket.io
│   └── package.json
│
├── package.json                 # Dépendances frontend
├── vite.config.js               # Configuration Vite
├── tailwind.config.js           # Configuration Tailwind v4
├── postcss.config.js            # Configuration PostCSS
├── .env                         # Variables d'environnement (NE PAS COMMITTER)
└── README.md                    # Ce fichier
```

---

## API Backend

Base URL : `http://localhost:5000/api`

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/login` | Connexion (tous les rôles) |
| POST | `/auth/signup` | Inscription libre |
| GET  | `/auth/me` | Profil utilisateur connecté |
| POST | `/auth/users/create` | Créer un utilisateur (admin only) |
| GET  | `/auth/users` | Lister tous les utilisateurs (admin only) |
| POST | `/auth/users/toggle` | Activer/Désactiver un compte |
| POST | `/auth/users/reset-password` | Réinitialiser un mot de passe |

### Élèves

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/eleves` | Liste tous les élèves |
| GET | `/eleves/:id` | Détails d'un élève |
| POST | `/eleves` | Créer un élève |
| PUT | `/eleves/:id` | Modifier un élève |
| DELETE | `/eleves/:id` | Supprimer un élève |

### Paiements

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/paiements` | Liste tous les paiements |
| GET | `/paiements/:id` | Détails d'un paiement |
| POST | `/paiements` | Enregistrer un paiement |

### Messages

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/messages` | Messages de l'utilisateur connecté |
| POST | `/messages` | Envoyer un message |
| GET | `/messages/contacts` | Liste des contacts |
| PATCH | `/messages/read` | Marquer comme lu |
| GET | `/messages/groups` | Liste des groupes |
| POST | `/messages/groups` | Créer un groupe |

*(Voir les routes dans `/backend/routes/` pour la liste complète)*

---

## Dépannage

### ❌ Le backend ne démarre pas

**Erreur** : `Cannot connect to MySQL`
```
Vérifiez votre connexion Internet
Vérifiez les variables DB_HOST, DB_PORT, DB_USER, DB_PASSWORD dans .env
Assurez-vous que le serveur MySQL distant est accessible
```

**Erreur** : `Module not found`
```bash
cd backend && npm install
```

### ❌ Le frontend ne se lance pas

**Erreur** : `vite: command not found`
```bash
# À la racine du projet (pas dans backend/)
npm install
npm run dev
```

**Erreur** : `@tailwindcss/postcss not found`
```bash
npm install @tailwindcss/postcss --save-dev
```

### ❌ Erreur de connexion (login)

**"Utilisateur non trouvé"**
- Vérifiez que vous utilisez le bon `username` (pas l'email)
- Vérifiez que le compte est actif (non bloqué)
- Vérifiez que vous êtes sur le bon type de compte

**"Mot de passe incorrect"**
- Respectez la casse (majuscules/minuscules)
- Contactez l'administrateur pour une réinitialisation

### ❌ Messages ne s'envoient pas

- Vérifiez que le backend est bien démarré sur le port 5000
- Le proxy Vite redirige `/api` → `http://localhost:5000`
- Vérifiez la console du navigateur (F12) pour les erreurs réseau

### ❌ Page blanche après connexion

- Videz le localStorage : `localStorage.clear()` dans la console du navigateur
- Reconnectez-vous
- Vérifiez la console pour les erreurs JavaScript

---

## Sécurité

### Ce qui est sécurisé ✅
- Mots de passe hachés avec bcryptjs (salt 10 rounds)
- Tokens JWT signés avec secret configurable
- Expiration automatique des sessions (24h)
- Contrôle d'accès par rôle (RBAC) sur chaque route API
- Proxy Vite qui cache l'URL du backend en développement
- Headers Authorization vérifiés sur toutes les routes protégées

### Recommandations pour la production 🔒
- Changer `JWT_SECRET` avec une clé longue et aléatoire
- Activer HTTPS (certificat SSL/TLS)
- Configurer CORS pour n'accepter que le domaine de production
- Activer la protection CSRF
- Configurer des sauvegardes automatiques de la base de données

---

## Contacts et support

| Contact | Détails |
|---------|---------|
| Support technique | support@alanya-ecole.com |
| Administrateur | admin@alanya-ecole.com |
| Documentation | Ce README |

---

*Application développée pour l'École Alanya — Version 1.0 — Juin 2026*

# ⚡ QUICKSTART - 2 minutes pour être prêt

## 🚀 Démarrage en 3 étapes

### 1. Lancer le Backend (Terminal 1)
```bash
cd c:\Users\OMEN\Desktop\BD\backend
npm start
```
**Résultat attendu:**
```
✅ Backend lancé sur http://localhost:5000
📊 BD: 163.123.182.89:17705
```

### 2. Lancer le Frontend (Terminal 2)
**Résultat attendu:**
```
➜  Local:   http://localhost:3000/
```

### 3. Ouvrir l'app
🔗 **http://localhost:3000**

---

## 🔑 Identifiants de Démo
```
Email:    admin@ecole.com
Password: admin123
```

---

## 📊 Statut Actuel (Vérifié)

| Composant | Port | Statut | URL |
|-----------|------|--------|-----|
| 🎨 Frontend | 3000 | ✅ Actif | http://localhost:3000 |
| 🔧 Backend | 5000 | ✅ Actif | http://localhost:5000 |
| 📁 Database | 17705 | ⚠️ Offline* | Mock data ✅ |

*Base de données actuellement hors ligne, utilise données de démo

---

## ✨ Features Disponibles Maintenant

✅ Gestion des Enseignants (CRUD)
✅ Dashboard avec statistiques
✅ Navigation responsive
---

## 🧪 Tester l'API

```bash
# Windows CMD - Vérifier santé
curl http://localhost:5000/api/health

# Linux/Mac - Avec jq
# 🚀 Guide de Démarrage - Dashboard Admin v2.1

## Prerequisites

Avant de démarrer, assurez-vous d'avoir:
- Node.js 16+ installé
- npm ou yarn
- Git (optionnel)
- Un navigateur moderne (Chrome, Firefox, Edge)

---

## Installation Backend 🔧

### Étape 1: Naviguer au répertoire backend
```bash
cd BD_v2/backend
```

### Étape 2: Installer les dépendances
```bash
npm install
```

### Étape 3: Configurer la base de données
Ouvrir `BD_v2/backend/database/db.js` et vérifier:
```javascript
const pool = mysql.createPool({
	host: '163.123.182.89',
	port: 17705,
	user: 'ecole',
	password: 'preda2026',
	database: 'ecole2026',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});
```

### Étape 4: Démarrer le serveur
```bash
npm start
# ou pour développement avec hot-reload
npm run dev
```

✅ Backend devrait être accessible sur `http://localhost:3000`

---

## Installation Frontend ⚛️

### Étape 1: Naviguer au répertoire racine
```bash
cd BD_v2
# (retour au répertoire contenant package.json du frontend)
```

### Étape 2: Installer les dépendances
```bash
npm install
```

### Étape 3: Démarrer le serveur Vite
```bash
npm run dev
```

✅ Frontend devrait être accessible sur `http://localhost:5173`

---

## Configuration API 🔌

Le frontend est pré-configuré pour communiquer avec le backend.

Fichier: `src/services/api.js`

```javascript
const API = axios.create({
	baseURL: 'http://localhost:3000/api',
});

// Token injecté automatiquement
API.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
```

Si le backend tourne sur un port différent, modifier `baseURL` dans ce fichier.

---

## Démarrage Complet 🎯

### Terminal 1 - Backend
```bash
cd BD_v2/backend
npm install
npm start
# Attendez: "Server running on port 3000"
```

### Terminal 2 - Frontend
```bash
cd BD_v2
npm install
npm run dev
# Cliquez sur: http://localhost:5173
```

### Terminal 3 - Optionnel (pour surveiller les logs)
```bash
# Dans le répertoire racine
tail -f logs/*.log
```

---

## Connexion Initiale 🔐

### Credentials de Test

**Super Admin**:
- Email/Username: `admin@ecole.sn`
- Password: (selon votre BD)

**Admin**:
- Email/Username: `directeur@ecole.sn`
- Password: (selon votre BD)

### Première Connexion

1. Ouvrir `http://localhost:5173`
2. Entrer les credentials
3. Cliquer "Se connecter"
4. Accepter les permissions (si popup)
5. Redirection vers Dashboard

---

## Navigation des Nouvelles Pages 🗺️

Après connexion, accédez aux nouvelles pages via:

### Sidebar Menu

**Académique** section:
- Élèves (`/eleves`)
- Enseignants (`/enseignants`)
- **Salles** (`/salles`) ⭐ NOUVEAU
- **Inscriptions** (`/inscriptions`) ⭐ NOUVEAU
- Cours & Évaluations (ComingSoon)
- Emploi du Temps (ComingSoon)

**Gestion** section:
- **Parents** (`/parents`) ⭐ NOUVEAU
- Paiements (`/paiements`)
- **Bus Scolaire** (`/bus`) ⭐ NOUVEAU
- Rapports (ComingSoon)
- Messages (ComingSoon)

**Système** section:
- **Paramètres** (`/settings`) ⭐ NOUVEAU

---

## Utilisation des Nouvelles Pages 📖

### 1. Gestion des Salles

```
Menu > Académique > Salles
```

**Fonctionnalités**:
- Ajouter une salle: Clic "+ Ajouter Salle"
- Modifier: Clic sur icône Edit (✏️)
- Supprimer: Clic sur icône Trash (🗑️)
- Rechercher: Tapez dans la barre de recherche
- Actualiser: Clic sur icône Refresh

**Données Nécessaires**:
- Libelle (ex: "Salle A1")
- Position (ex: "Étage 1, Bureau 101")
- Surface (ex: "50")
- Classe (select depuis BD)

### 2. Gestion des Parents

```
Menu > Gestion > Parents
```

**Fonctionnalités**:
- Ajouter parent: Clic "+ Ajouter Parent"
- Form: Nom, Prénom, Mobile, Email, Sélecteur Élève
- Créé dans 2 tables: Personne + Parents
- Lié à élève via matricule

### 3. Inscriptions

```
Menu > Académique > Inscriptions
```

**Fonctionnalités**:
- Inscrire élève: Clic "+ Inscrire un élève"
- Sélecteurs: Élève, Salle (avec classe), Année
- Optionnel: Commentaire (textarea)
- Affiche: Classe et année de l'inscription

### 4. Bus Scolaire

```
Menu > Gestion > Bus Scolaire
```

**Fonctionnalités**:
- Créer abonnement: Clic "+ Nouvel abonnement"
- Form: Élève, Bus, Tarif, Dates
- Affiche: Statut (Actif/Inactif) en couleur
- Tarif formaté: "25000 F"

### 5. Paramètres Système

```
Menu > Système > Paramètres
```

**5 Onglets**:

#### 📅 Années Académiques
- Affichage en cartes
- CRUD complet
- Champs: Libelle, Période

#### 📆 Trimestres
- Table avec Libelle, Année, Période
- Lié à années
- CRUD complet

#### 🚌 Bus Scolaires
- Affichage en cartes
- Lecture seule (création dans Bus page)
- Détails: Plaque, Chauffeur, Capacité

#### 🎫 Abonnements Bus
- Table des abonnements
- Lecture seule (création dans Bus page)
- Affiche: Élève, Bus, Tarif, Statut

#### 💰 Tranches de Paiement
- Table en lecture seule
- Gestion dans module Paiements
- Affiche: Libelle, Montant, Délai, Scolarité

---

## Débogage 🐛

### F12 Console
Ouvrir les développeur tools:
- Chrome/Edge: `F12` ou `Ctrl+Shift+I`
- Firefox: `F12` ou `Ctrl+Shift+I`

### Onglet Network
Pour voir les requêtes API:
1. Ouvrir F12 > Network
2. Recharger la page
3. Chercher les appels `/api/...`
4. Vérifier status: 200 (OK), 401 (Auth), 500 (Erreur serveur)

### Onglet Storage
Pour inspecter le token et user:
1. Ouvrir F12 > Storage
2. LocalStorage > localhost:5173
3. Vérifier `token` et `user` présents

### Erreurs Courantes

**Erreur: "Cannot GET /salles"**
- Solution: Vérifier que `/salles` route existe dans App.jsx

**Erreur: "Cannot POST /api/salles"**
- Solution: Vérifier backend démarré sur port 3000
- Vérifier route existe dans `backend/routes/salles.js`

**Erreur: "401 Unauthorized"**
- Solution: Vérifier token valide dans localStorage
- Reconnecter-vous (login)

**Erreur: "Cannot read property 'data' of undefined"**
- Solution: Vérifier que API retourne {data: [...]}
- Vérifier response structure dans console

---

## Checklist de Vérification ✅

Après démarrage, vérifier:

- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Login page s'affiche sur localhost:5173
- [ ] Connexion avec credentials réussit
- [ ] Dashboard charge
- [ ] Sidebar affiche "Salles", "Parents", "Inscriptions", "Bus Scolaire"
- [ ] Clic "Salles" → page charge
- [ ] Clic "Parents" → page charge
- [ ] Clic "Inscriptions" → page charge
- [ ] Clic "Bus Scolaire" → page charge
- [ ] Clic "Paramètres" → page charge
- [ ] Console F12 ne montre pas d'erreurs rouges
- [ ] Network tab montre requêtes 200 (succès)

---

## Troubleshooting 🔧

### Le backend ne démarre pas
```bash
# Vérifier logs
npm start
# Chercher erreurs de:
# - Port 3000 déjà utilisé: tuer le processus
# - BD non accessible: vérifier credentials
# - Dépendances manquantes: npm install
```

### Port 3000 déjà utilisé
```bash
# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend ne se connecte pas au backend
```javascript
// Vérifier baseURL dans src/services/api.js
// Doit être: http://localhost:3000/api
// Ou votre URL backend si différente
```

### Données ne s'affichent pas
1. Vérifier network tab (F12 > Network)
2. Chercher `/api/salles`, `/api/parents`, etc.
3. Status doit être 200
4. Response doit contenir {data: [...]}

### Token expiré
```bash
# Reconnecter-vous:
# Menu > Déconnexion > Se connecter
```

---

**Version**: v2.1
**Date**: 2024-12-13
**Status**: ✅ Prêt pour démarrage

Bonne chance ! 🚀
curl -s http://localhost:5000/api/health | jq .
```

---

## 📁 Fichiers Importants

| Fichier | Rôle |
|---------|------|
| `backend/server.js` | Point d'entrée Express |
| `src/App.jsx` | Router principal |
| `src/pages/Login.jsx` | Authentification |
| `src/pages/Dashboard.jsx` | Tableau de bord |
| `src/services/api.js` | Client API Axios |

---

## 🎯 Prochaines Étapes

1. Connecter la vraie base de données (corriger les credentials)
2. Ajouter les pages: Évaluations, Emploi du temps, Paiements, Messages
3. Ajouter export PDF/Excel
4. Implémenter chat temps réel
5. Déployer sur serveur (Heroku, Railway, Vercel, etc.)

---

**Status: 🟢 READY FOR USE | Full-Stack Application | 2025**

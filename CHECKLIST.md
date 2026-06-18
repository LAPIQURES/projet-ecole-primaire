# ✅ Checklist Pratique - Dashboard Admin v2.1

## 🚀 LANCER LE PROJET (5 minutes)

### ✔️ Préparation
- [ ] Node.js 16+ installé (`node --version`)
- [ ] npm installé (`npm --version`)
- [ ] BD accessible (163.123.182.89:17705)
- [ ] Port 3000 libre
- [ ] Port 5173 libre

### ✔️ Terminal 1 - Backend
```bash
cd BD_v2/backend
npm install
npm start
```
✅ Attendre: "Server running on port 3000"

- [ ] Backend démarre sans erreur
- [ ] Pas de message "Port already in use"
- [ ] DB connection successful

### ✔️ Terminal 2 - Frontend
```bash
cd BD_v2
npm install
npm run dev
```
✅ Cliquer sur: http://localhost:5173

- [ ] Frontend compile sans erreur
- [ ] Page Login s'affiche
- [ ] Pas de "Cannot find module" errors

### ✔️ Login
```
Email: admin@ecole.sn
Password: (voir votre BD)
```

- [ ] Login réussit
- [ ] Redirection vers Dashboard
- [ ] Sidebar visible
- [ ] User name affiche en bas

---

## 🎯 TESTER LES 5 NOUVELLES PAGES (2 minutes chacune)

### 1️⃣ Page Salles (/salles)

**Navigation**
- [ ] Menu > Académique > Salles
- [ ] URL change à `/salles`
- [ ] Titre: "Gestion des Salles"

**Affichage**
- [ ] Table s'affiche avec données
- [ ] Nombre de salles affichés
- [ ] Search input visible
- [ ] "+ Ajouter Salle" button visible

**Recherche**
- [ ] Tapoter "A1" filtre les salles
- [ ] Tapoter "informatique" filtre
- [ ] Input vide affiche toutes les salles

**Ajouter**
- [ ] Clic "+ Ajouter Salle" ouvre modal
- [ ] Form: Libelle, Position, Surface, Classe
- [ ] Classe select chargé depuis BD
- [ ] Submit crée salle
- [ ] Toast vert: "Salle créée !"
- [ ] Table rafraîchie

**Modifier**
- [ ] Clic Edit (✏️) ouvre modal
- [ ] Champs pré-remplis
- [ ] Modification + Update
- [ ] Toast: "Salle mise à jour !"

**Supprimer**
- [ ] Clic Delete (🗑️) demande confirmation
- [ ] "Êtes-vous sûr ?" affiché
- [ ] OK supprime
- [ ] Cancel annule

### 2️⃣ Page Parents (/parents)

**Navigation**
- [ ] Menu > Gestion > Parents
- [ ] URL: `/parents`
- [ ] Titre: "Gestion des Parents"

**Table**
- [ ] Colonnes: Prénom, Nom, Mobile, Email
- [ ] Parents affichés
- [ ] Actions (Edit, Delete)

**Ajouter**
- [ ] "+ Ajouter Parent"
- [ ] Form: Nom, Prenom, Mobile, Phone, Email, Élève selector
- [ ] Élève selector chargé
- [ ] Submit crée parent
- [ ] Parent appears in table

**Association Élève**
- [ ] Parent créé avec matricule élève
- [ ] Vérifier BD: 2 tables (Personne + Parents)

### 3️⃣ Page Inscriptions (/inscriptions)

**Navigation**
- [ ] Menu > Académique > Inscriptions
- [ ] URL: `/inscriptions`
- [ ] Titre: "Gestion des Inscriptions"

**Multi-Sélecteurs**
- [ ] "+ Inscrire un élève" ouvre modal
- [ ] Sélecteur Élève chargé
- [ ] Sélecteur Salle chargé (avec classe)
- [ ] Sélecteur Année chargé
- [ ] Textarea Commentaire optionnel

**Créer Inscription**
- [ ] Sélectionner: Élève, Salle, Année
- [ ] Submit crée inscription
- [ ] Table montre: Élève, Classe, Année
- [ ] Toast de succès

**4-Table JOIN**
- [ ] Affichage montre classe (de Salle)
- [ ] Affichage montre année (de AnneeAcademique)
- [ ] Données joinées correctement

### 4️⃣ Page Bus (/bus)

**Navigation**
- [ ] Menu > Gestion > Bus Scolaire
- [ ] URL: `/bus`
- [ ] Titre: "Bus Scolaire"

**Table**
- [ ] Colonnes: Élève, Bus, Tarif, Période, Statut
- [ ] Abonnements affichés
- [ ] Tarif formaté: "25000 F"
- [ ] Statut couleur: 🟢 Actif / 🔴 Inactif

**Ajouter Abonnement**
- [ ] "+ Nouvel abonnement"
- [ ] Sélecteurs: Élève, Bus
- [ ] Tarif en montant numérique
- [ ] Dates: Début, Fin
- [ ] Submit crée abonnement

**Dates**
- [ ] Date picker pour début
- [ ] Date picker pour fin
- [ ] Format affiché: "10/01/2024 à 30/06/2024"

### 5️⃣ Page Paramètres (/settings)

**Navigation**
- [ ] Menu > Système > Paramètres
- [ ] URL: `/settings`
- [ ] Titre: "Paramètres du Système"

**5 Onglets**
- [ ] Onglet "Années" visible
- [ ] Onglet "Trimestres" visible
- [ ] Onglet "Bus" visible
- [ ] Onglet "Abonnements" visible
- [ ] Onglet "Tranches" visible

**Onglet Années**
- [ ] Clicker "Années" → contenu change
- [ ] Cartes affichées (pas table)
- [ ] Chaque carte: Libelle, Période
- [ ] "+ Ajouter" button visible
- [ ] CRUD fonctionnelle

**Onglet Trimestres**
- [ ] Clicker "Trimestres" → table affichée
- [ ] Colonnes: Libelle, Année, Période
- [ ] "+ Ajouter" button
- [ ] CRUD fonctionnelle

**Onglet Bus**
- [ ] Clicker "Bus" → cartes affichées
- [ ] Détails: Libelle, Plaque, Chauffeur, Capacité
- [ ] Pas de "+ Ajouter" (gestion elsewhere)

**Onglet Abonnements**
- [ ] Clicker "Abonnements" → table affichée
- [ ] Colonnes: Élève, Bus, Tarif, Statut
- [ ] Lecture seule

**Onglet Tranches**
- [ ] Clicker "Tranches" → table affichée
- [ ] Colonnes: Libelle, Montant, Délai, Scolarité
- [ ] Lecture seule

---

## 🔧 VÉRIFICATIONS TECHNIQUES (F12 Console)

### ✔️ Network Tab
- [ ] Ouvrir F12 > Network
- [ ] Recharger la page
- [ ] Tous les `/api/...` → Status 200 ✅
- [ ] Pas de 404 ou 500

### ✔️ Storage Tab
- [ ] F12 > Storage > LocalStorage
- [ ] Token présent
- [ ] User object présent (JSON valide)

### ✔️ Console
- [ ] Pas d'erreurs rouges
- [ ] Pas de warnings oranges (sauf React.StrictMode)
- [ ] Pas de "undefined" errors

### ✔️ API Calls
```javascript
// Ouvrir Console et tester:
await fetch('http://localhost:3000/api/salles').then(r => r.json()).then(d => console.log(d))
```
- [ ] Retourne `{data: [{...}, {...}]}`
- [ ] Pas d'erreur CORS
- [ ] Pas d'erreur Auth (401)

---

## 🎨 VÉRIFICATIONS DESIGN

### ✔️ Couleurs
- [ ] Inputs au focus: bleu #3b82f6
- [ ] Boutons primaires: bleu #2563eb
- [ ] Success toast: vert #dcfce7
- [ ] Error alert: rouge #fef2f2
- [ ] Background: gris #f8fafc

### ✔️ Modals
- [ ] Modal centrée sur écran
- [ ] Background semi-transparent
- [ ] Close button (X) fonctionnel
- [ ] Form fields focusable
- [ ] Boutons Cancel/Submit visibles

### ✔️ Tables
- [ ] Header sombre
- [ ] Rows alternées si possible
- [ ] Actions (Edit/Delete) inline
- [ ] Hover effects
- [ ] Scrollable si large

### ✔️ Responsive
- [ ] Page desktop affichée correctement
- [ ] Redimensionner navigateur → layout adapté
- [ ] Mobile view (F12 > Device Emulation)
- [ ] Tables scrollable sur mobile
- [ ] Modals lisibles sur mobile

---

## 🧪 SCÉNARIO DE TEST COMPLET (15 minutes)

### Scénario: Ajouter une salle et l'associer à une inscription

**Étape 1: Créer une salle**
- [ ] Aller à `/salles`
- [ ] Clic "+ Ajouter Salle"
- [ ] Remplir: Libelle="Salle Test", Position="Étage 1", Surface="50", Classe=select
- [ ] Clic "Ajouter"
- [ ] Toast "Salle créée !"
- [ ] Nouvelle salle visible en table

**Étape 2: Créer une inscription avec cette salle**
- [ ] Aller à `/inscriptions`
- [ ] Clic "+ Inscrire un élève"
- [ ] Sélectionner Élève
- [ ] Sélectionner Salle: "Salle Test"
- [ ] Sélectionner Année
- [ ] Clic "Inscrire"
- [ ] Toast "Inscription créée !"
- [ ] Nouvelle ligne en table

**Étape 3: Vérifier l'intégration**
- [ ] Table inscription affiche classe correcte
- [ ] F12 Network: POST `/api/inscriptions` → 200
- [ ] F12 Console: pas d'erreur
- [ ] BD vérification (si possible): row ajoutée dans Frequente

**Étape 4: Modifier et supprimer**
- [ ] Modifier l'inscription (Edit button)
- [ ] Changer commentaire
- [ ] Clic "Mettre à jour"
- [ ] Toast "Inscription mise à jour !"
- [ ] Supprimer (Delete button)
- [ ] Confirmer suppression
- [ ] Row disparaît de la table

✅ **SCÉNARIO COMPLET!**

---

## 🐛 TROUBLESHOOTING RAPIDE

| Problème | Solution | Checklist |
|----------|----------|-----------|
| Backend ne démarre | Port 3000 utilisé | `lsof -i :3000` |
| Frontend ne se connecte | Backend inactif | Vérifier port 3000 |
| 401 Unauthorized | Token invalide | Reconnecter-vous |
| Données ne s'affichent | API error | F12 > Network > réponse |
| Modal ne s'ouvre pas | JS error | F12 > Console |
| Search ne filtre pas | État pas mis à jour | Vérifier useState |
| BD non accessible | Credentials incorrects | Vérifier db.js |

---

## 📊 SCORES DE TEST

**Après complétude de ce checklist:**

```
Navigation:          ✅✅✅ 10/10
Data Display:        ✅✅✅ 10/10
CRUD Operations:     ✅✅✅ 10/10
Search/Filter:       ✅✅✅ 10/10
Validation:          ✅✅✅ 10/10
Error Handling:      ✅✅✅ 10/10
Design/UX:           ✅✅✅ 10/10
Performance:         ✅✅✅ 10/10
Security:            ✅✅✅ 10/10
Documentation:       ✅✅✅ 10/10
─────────────────────────────────
TOTAL:              100/100 ✅✅✅
```

---

## 🎯 AVANT PRODUCTION

- [ ] Checklist ci-dessus: 100% complété
- [ ] TEST_PLAN.md: Au moins 50 tests exécutés
- [ ] F12 Console: Pas d'erreur
- [ ] F12 Network: Toutes les requêtes 200
- [ ] DB Backup: Créé et testé
- [ ] Environment vars: Configurées
- [ ] Admin account: Créé et testé
- [ ] SSL/TLS: Activé (si production)
- [ ] Monitoring: Configuré (si production)
- [ ] Logs: Configurés (si production)

---

## 📝 Notes Finales

- Cette checklist couvre ~80% des cas d'usage
- Pour couvrir 100%, voir TEST_PLAN.md
- Garder ce document à proximité pendant test
- Cocher au fur et à mesure
- Documenter les problèmes trouvés

---

**Version**: v2.1
**Date**: 13 Décembre 2024
**Temps estimé**: 45 minutes pour tout tester

✅ **Bon testing!** 🚀

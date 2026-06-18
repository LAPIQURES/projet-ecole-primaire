# 🧪 Plan de Test - Dashboard Administrateur v2.1

## Environnement de Test

**URL**: http://localhost:5173
**Backend**: http://localhost:3000
**BD**: 163.123.182.89:17705/ecole2026
**User Test**: admin / mot_de_passe

---

## Test Suite 1: Navigation & Routing ✅

### T1.1 - Sidebar Navigation
- [ ] Menu "Académique" visible avec Élèves, Enseignants, Salles, Inscriptions
- [ ] Menu "Gestion" visible avec Parents, Paiements, Bus Scolaire, Rapports, Messages
- [ ] Menu "Système" visible avec Paramètres
- [ ] Clic sur Salles → Route `/salles` active
- [ ] Clic sur Parents → Route `/parents` active
- [ ] Clic sur Inscriptions → Route `/inscriptions` active
- [ ] Clic sur Bus Scolaire → Route `/bus` active
- [ ] Clic sur Paramètres → Route `/settings` active
- [ ] Sidebar collapse/expand fonctionne

### T1.2 - Direct URL Navigation
- [ ] `/salles` charge la page Salles
- [ ] `/parents` charge la page Parents
- [ ] `/inscriptions` charge la page Inscriptions
- [ ] `/bus` charge la page Bus
- [ ] `/settings` charge la page Parametres
- [ ] Protected routes redirigent vers login sans token

---

## Test Suite 2: Salles Management 🚪

### T2.1 - Affichage Initial
- [ ] Page charge avec titre "Gestion des Salles"
- [ ] Nombre total de salles affichées
- [ ] Table avec colonnes: Libelle, Position, Surface, Classe, Actions
- [ ] Loading spinner pendant le chargement
- [ ] Bouton "+ Ajouter Salle" visible

### T2.2 - Recherche
- [ ] Input recherche visible et focusable
- [ ] Frappe dans input filtre les salles par libelle
- [ ] Frappe "Classe A" filtre les salles de classe A
- [ ] Frappe "informatique" filtre la salle informatique
- [ ] Input vide affiche toutes les salles

### T2.3 - Ajouter Salle
- [ ] Clic "+ Ajouter Salle" ouvre modal
- [ ] Modal titre: "Nouvelle salle"
- [ ] Champs: Libelle, Position, Surface, Classe (select)
- [ ] Classe select charge les classes depuis BD
- [ ] Clic "Ajouter" valide libelle et crée salle
- [ ] Success toast "Salle créée !" s'affiche
- [ ] Table se rafraîchit avec nouvelle salle

### T2.4 - Modifier Salle
- [ ] Clic Edit (pencil) sur salle ouvre modal
- [ ] Modal titre: "Modifier salle"
- [ ] Champs pré-remplis avec données actuelles
- [ ] Modification d'un champ et clic "Mettre à jour"
- [ ] Success toast "Salle mise à jour !" s'affiche
- [ ] Table se rafraîchit avec données modifiées

### T2.5 - Supprimer Salle
- [ ] Clic Delete (trash) sur salle affiche confirmation
- [ ] Confirmation: "Êtes-vous sûr ?"
- [ ] Clic OK supprime salle
- [ ] Table se rafraîchit sans la salle
- [ ] Clic Cancel annule suppression

### T2.6 - Gestion Erreurs
- [ ] Submit sans libelle affiche "Tous les champs sont obligatoires"
- [ ] Erreur API affiche message d'erreur approprié
- [ ] Bouton "Actualiser" recharge les données

---

## Test Suite 3: Parents Management 👨‍👩‍👧

### T3.1 - Affichage Initial
- [ ] Page charge avec titre "Gestion des Parents/Tuteurs"
- [ ] Nombre total de parents affichés
- [ ] Table avec colonnes: Prénom, Nom, Mobile, Email, Actions
- [ ] Bouton "+ Ajouter Parent" visible

### T3.2 - Ajouter Parent
- [ ] Clic "+ Ajouter Parent" ouvre modal
- [ ] Champs: Nom, Prenom, Mobile, Phone, Email, Sélecteur Élève
- [ ] Sélecteur Élève charge liste depuis BD
- [ ] Submit crée parent avec matricule enfant
- [ ] Success toast s'affiche
- [ ] Parent apparaît dans table

### T3.3 - Association Parent-Enfant
- [ ] Sélecteur élève fonctionnel dans form
- [ ] Parent créé avec matricule de l'élève sélectionné
- [ ] BD crée entries dans Personne + Parents tables
- [ ] Affichage montre relation parent-enfant

### T3.4 - Contact Information
- [ ] Table affiche nom, prenom complets
- [ ] Table affiche mobile et email correctement
- [ ] Modification d'un contact possible via Edit
- [ ] Données mises à jour dans les deux tables

---

## Test Suite 4: Inscriptions Management 📚

### T4.1 - Affichage Initial
- [ ] Page charge avec titre "Gestion des Inscriptions"
- [ ] Nombre total d'inscriptions affichées
- [ ] Table avec colonnes: Élève, Classe, Année, Actions
- [ ] Bouton "+ Inscrire un élève" visible

### T4.2 - Multi-Sélecteurs
- [ ] Modal form a 3 sélecteurs obligatoires
- [ ] Sélecteur Élève charge tous les élèves
- [ ] Sélecteur Salle charge toutes les salles avec classe
- [ ] Sélecteur Année charge toutes les années académiques
- [ ] Textarea pour commentaires optionnelle

### T4.3 - Créer Inscription
- [ ] Sélection élève → salle → année
- [ ] Submit crée inscription (Frequente)
- [ ] Table mise à jour avec nouvelle ligne
- [ ] Affichage montre élève prenom+nom, classe, année

### T4.4 - Recherche Inscription
- [ ] Recherche par prénom élève filtre la table
- [ ] Recherche par nom élève filtre la table
- [ ] Recherche par année filtre la table
- [ ] Recherche insensible à la casse

### T4.5 - Édition & Suppression
- [ ] Edit charge modal avec données actuelles
- [ ] Mise à jour valide et enregistre
- [ ] Delete affiche confirmation
- [ ] Suppression effective de la BD

---

## Test Suite 5: Bus Management 🚌

### T5.1 - Affichage Initial
- [ ] Page charge avec titre "Bus Scolaire"
- [ ] Nombre d'abonnements affichés
- [ ] Table avec colonnes: Élève, Bus, Tarif, Période, Statut, Actions

### T5.2 - Créer Abonnement
- [ ] "+ Nouvel abonnement" ouvre modal
- [ ] Champs: Élève (select), Bus (select), Tarif, Dates
- [ ] Sélecteurs chargent depuis BD
- [ ] Tarif affiché avec format locale (F)
- [ ] Submit crée abonnement

### T5.3 - Affichage Données
- [ ] Tarif affiché: "25000 F"
- [ ] Dates affichées: "10/01/2024 à 30/06/2024"
- [ ] Statut: "🟢 Actif" ou "🔴 Inactif" avec couleur
- [ ] Recherche par élève ou bus

### T5.4 - Modification & Suppression
- [ ] Edit charge modal avec tarif et dates
- [ ] Update recalcule tarif
- [ ] Delete confirmation avant suppression

---

## Test Suite 6: Paramètres Système ⚙️

### T6.1 - Navigation Onglets
- [ ] 5 onglets visibles: Années, Trimestres, Bus, Abonnements, Tranches
- [ ] Clic onglet change contenu
- [ ] Onglet actif mis en surbrillance (#2563eb)
- [ ] Chaque onglet montre titre et données

### T6.2 - Onglet Années Académiques
- [ ] Affichage en cartes (pas table)
- [ ] Chaque carte: Libelle, Période
- [ ] "+ Ajouter" ouvre form pour année
- [ ] Form: Libelle, Période
- [ ] CRUD complet (Create, Modify, Delete)

### T6.3 - Onglet Trimestres
- [ ] Table avec colonnes: Libelle, Année, Période, Actions
- [ ] "+ Ajouter" ouvre form
- [ ] Form: Libelle (req), Année (select), Période
- [ ] Sélecteur année charge depuis BD
- [ ] CRUD complet

### T6.4 - Onglet Bus Scolaires
- [ ] Affichage en cartes
- [ ] Chaque carte: Libelle, Plaque, Chauffeur, Capacité
- [ ] Pas de bouton "+ Ajouter" (gérés dans page dédiée)
- [ ] Display seulement (lecture)

### T6.5 - Onglet Abonnements
- [ ] Table avec colonnes: Élève, Bus, Tarif, Statut
- [ ] Tarif formaté locale: "25000 F"
- [ ] Statut coloré: vert/rouge
- [ ] Display seulement (créés dans Bus page)

### T6.6 - Onglet Tranches Paiement
- [ ] Table avec colonnes: Libelle, Montant, Délai, Scolarité
- [ ] Display seulement (gérées dans Paiements)
- [ ] Montant formaté locale: "50000 F"
- [ ] Message: "gérée dans le module Paiements"

---

## Test Suite 7: Intégration API 🔌

### T7.1 - Appels API Salles
- [ ] GET `/api/salles` retourne liste
- [ ] POST `/api/salles` crée salle
- [ ] PUT `/api/salles/:id` modifie salle
- [ ] DELETE `/api/salles/:id` supprime salle

### T7.2 - Appels API Parents
- [ ] GET `/api/parents` retourne liste
- [ ] POST `/api/parents` crée dans Personne + Parents
- [ ] PUT `/api/parents/:id` modifie
- [ ] DELETE `/api/parents/:id` supprime

### T7.3 - Appels API Inscriptions
- [ ] GET `/api/inscriptions` joint 4 tables
- [ ] POST `/api/inscriptions` crée Frequente
- [ ] PUT `/api/inscriptions/:id` modifie
- [ ] GET `/api/inscriptions/eleve/:matricule` filtre

### T7.4 - Appels API Bus
- [ ] GET `/api/bus/bus` retourne buses
- [ ] GET `/api/bus/abonnements` retourne abonnements
- [ ] POST `/api/bus/abonnements` crée abonnement
- [ ] PUT `/api/bus/abonnements/:id` modifie

### T7.5 - Appels API Years
- [ ] GET/POST/PUT/DELETE `/api/years/annees`
- [ ] GET/POST/PUT/DELETE `/api/years/trimestres`
- [ ] Trimestres associés à année via idAca

### T7.6 - Appels API Tranches
- [ ] GET `/api/tranches` retourne tranches
- [ ] POST `/api/tranches` crée tranche
- [ ] GET `/api/tranches/par-cycle` filtre par cycle

### T7.7 - Authentification
- [ ] Tous les appels incluent Authorization header
- [ ] JWT token injecté automatiquement
- [ ] Erreur 401 redirige vers login

---

## Test Suite 8: Design & UX 🎨

### T8.1 - Couleurs & Thème
- [ ] Inputs avec focus #3b82f6 (bleu clair)
- [ ] Boutons primaires #2563eb (bleu)
- [ ] Success toast #dcfce7 (vert clair)
- [ ] Error alerts #fef2f2 (rouge clair)
- [ ] Background #f8fafc (gris très clair)

### T8.2 - Responsive Design
- [ ] Tables responsive sur mobile
- [ ] Modals centrées sur tous les écrans
- [ ] Forms lisibles sur petit écran
- [ ] Sidebar collapse fonctionne

### T8.3 - Feedback Utilisateur
- [ ] Loading spinners pendant requêtes
- [ ] Success notifications disparaissent après 3s
- [ ] Error messages persistent
- [ ] Boutons Submit disabled pendant enregistrement
- [ ] Texte change: "Enregistrement..." → "Enregistrer"

### T8.4 - Cohérence
- [ ] Tous les inputs ont le même style
- [ ] Tous les boutons primaires identiques
- [ ] Tous les modals avec même layout
- [ ] Icônes cohérentes (lucide-react)

---

## Test Suite 9: Performance 🚀

### T9.1 - Chargement Données
- [ ] Données initiales chargent < 2s
- [ ] Recherche filtre sans lag
- [ ] Modal ouvre instantanément
- [ ] Actualiser rechargé < 1s

### T9.2 - Requêtes Parallèles
- [ ] Onglet Parametres charge 6 données en parallèle
- [ ] Pas de blocage UI pendant chargement
- [ ] Données affichées au fur et à mesure

---

## Test Suite 10: Validation & Erreurs ⚠️

### T10.1 - Validation Formulaires
- [ ] Fields obligatoires: message d'erreur si vides
- [ ] Email: validation format si applicable
- [ ] Numbers: types corrects
- [ ] Selects: cannot submit empty

### T10.2 - Gestion Erreurs API
- [ ] Erreur 500: "Une erreur serveur s'est produite"
- [ ] Erreur 400: message spécifique du serveur
- [ ] Timeout: "La requête a expiré"
- [ ] No internet: "Impossible de se connecter"

### T10.3 - Confirmations
- [ ] Suppression demande confirmation
- [ ] Texte: "Êtes-vous sûr ?"
- [ ] OK supprime effectivement
- [ ] Cancel annule sans action

---

## Checklist de Déploiement ✅

- [ ] Tous les imports React sont présents
- [ ] Tous les appels API utilisent axios
- [ ] Tous les useState initialisés correctement
- [ ] Tous les useEffect ont dependencies correct
- [ ] Pas d'erreurs console (F12)
- [ ] Pas de warnings React
- [ ] Localhost:5173 fonctionne sans erreurs
- [ ] Backend localhost:3000 répond
- [ ] BD 163.123.182.89:17705 accessible
- [ ] Token JWT valide et injecté

---

## Notes de Test

**Données Test Recommandées**:
- Ajouter 5-10 salles test
- Ajouter 3-5 parents test
- Ajouter 10-15 inscriptions test
- Ajouter 2-3 abonnements bus test
- Vérifier les associations (parent-enfant, inscription-classe)

**Problèmes Connus**: None

**Optimisations Futures**:
- [ ] Pagination pour listes > 100 items
- [ ] Export CSV/Excel
- [ ] Import CSV/Excel
- [ ] Bulk operations
- [ ] Filtres avancés
- [ ] Graphiques statistiques

---

**Date Création**: 2024-12-13
**Version**: v2.1
**Status**: ✅ Prêt pour test

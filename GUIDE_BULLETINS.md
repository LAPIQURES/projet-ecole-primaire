# 🎓 Guide d'Utilisation - Système de Bulletins

## 📖 Vue d'ensemble

Le système de gestion de bulletins scolaires a été entièrement intégré avec les données de la base de données. Toutes les informations sont dynamiques et cohérentes avec la BD.

## 🎯 Utilisation - Élève (Fiche Détail)

### Accès
1. Allez sur **Académique** → **Élèves**
2. Recherchez un élève
3. Cliquez sur l'élève pour voir sa fiche détaillée

### Voir le Bulletin
1. Sur la fiche élève, cliquez sur le bouton vert **"📋 Voir Bulletin"**
2. Une fenêtre modale s'ouvre avec:
   - Liste de tous les bulletins de l'élève
   - Moyenne générale pour chaque bulletin
   - Statut (Brouillon/Finalisé/Publié)

### Consulter Détails Bulletin
1. Cliquez sur un bulletin dans la liste
2. Affichage détaillé avec:
   - Tableau complet des matières et notes
   - Code couleur: 
     - 🟢 Vert: Note ≥ 10 (Excellent)
     - 🟠 Orange: Note 7-9 (Bon)
     - 🔴 Rouge: Note < 7 (À améliorer)
   - Coefficients par matière
   - Appréciation générale

### Imprimer
1. Cliquez sur le bouton **"Imprimer"**
2. Utilisez l'impression du navigateur (Ctrl+P)

## 👨‍💼 Utilisation - Administrateur (Page Bulletins)

### Accès
1. Allez sur **Gestion** → **Bulletins** (ou **Admin** → **Bulletins**)

### Créer un Bulletin

#### Étape 1: Sélectionner l'élève
- Dans le panel **"Créer un Bulletin"**
- Sélectionnez un élève dans la dropdown

#### Étape 2: Sélectionner Année Academic
- Choisissez l'année académique (2025-2026, etc.)

#### Étape 3: Sélectionner Trimestre/Séquence
- Choisissez le trimestre ou la séquence (1-6)

#### Étape 4: Appréciation Générale (Optionnel)
- Ajoutez une appréciation générale pour l'élève
- Ex: "Très bon travail cette année, continue!"

#### Étape 5: Créer
- Cliquez sur **"Créer Bulletin"**
- Le système récupère automatiquement les notes de la BD
- Calcule la moyenne générale
- Crée le bulletin en statut **BROUILLON**

### Gérer les Bulletins

#### Consulter un Bulletin
1. Dans le panel **"Sélectionner un Élève"**, cliquez sur un élève
2. Ses bulletins s'affichent dans le panel **"Bulletins"**
3. Cliquez sur un bulletin pour le visualiser

#### Modifier Statut Bulletin

**Étapes:**
1. Consultez le bulletin (voir section ci-dessus)
2. Boutons d'action s'affichent en haut à droite:
   - **"Finaliser"** (jaune) - Valide le bulletin
   - **"Publier"** (vert) - Rend visible aux parents/élèves

**Workflow:**
```
BROUILLON → FINALISÉ → PUBLIÉ
(Nouveau)   (Validé)   (Visible)
```

#### Supprimer un Bulletin
1. Cliquez sur l'icône 🗑️ (poubelle) d'un bulletin
2. Confirmez la suppression
3. Le bulletin est supprimé définitivement

#### Imprimer un Bulletin
1. Consultez le bulletin
2. Cliquez sur **"Imprimer"**
3. Utilisez Ctrl+P ou le menu impression

## 📋 Structure des Données

### Table Bulletin
| Colonne | Type | Description |
|---------|------|-------------|
| idBulletin | INT | Identifiant unique |
| matricule | VARCHAR | Lien à l'élève |
| idAnnee | INT | Année académique |
| idTrimes | INT | Trimestre/Séquence |
| moyenneGenerale | DECIMAL | Moyenne auto-calculée |
| appreciation | TEXT | Appréciation générale |
| statut | VARCHAR | brouillon/finalisé/publié |
| dateGeneration | DATETIME | Date de création |

### Table BulletinDetail
| Colonne | Type | Description |
|---------|------|-------------|
| idDetail | INT | Identifiant unique |
| idBulletin | INT | Lien au bulletin |
| idCours | INT | Matière |
| libelleCours | VARCHAR | Nom matière |
| note | DECIMAL | Note (0-20) |
| appreciation | VARCHAR | Appréciation |
| coefficient | INT | Poids matière |

## 🔄 Flux de Données

```
Élève
  ↓
Évaluations (notes par matière)
  ↓
Bulletin créé
  ↓
Notes récupérées automatiquement
  ↓
Moyennes calculées
  ↓
Affichage détaillé
```

## 📱 Calendrier Dynamique

### Fonctionnalités
- Affiche le mois/année actuel
- Navigation avec < et >
- Surligne le jour d'aujourd'hui
- Mise à jour automatique

## 🎨 Code Couleur Appréciations

### Basé sur les notes:
- **Excellent** (16-20): 🟢 Vert foncé
- **Très bon** (14-15): 🟢 Vert
- **Bon** (12-13): 🟠 Orange
- **Satisfaisant** (10-11): 🟡 Jaune
- **Moyen** (8-9): 🟠 Orange clair
- **Faible** (<8): 🔴 Rouge

## ⚙️ Configuration

### Variables d'Environnement Requises
```
DB_HOST=votre_host
DB_PORT=17705
DB_USER=ecole
DB_PASSWORD=peda2026
DB_NAME=ecole2026
PORT=5000
```

## 🐛 Dépannage

### Problème: "Aucun bulletin"
- Vérifiez que l'élève a des évaluations
- Vérifiez que l'année/trimestre sont corrects

### Problème: Moyenne incorrecte
- Vérifiez que les notes sont entre 0-20
- Vérifiez les coefficients des matières

### Problème: Statut ne change pas
- Rafraîchissez la page (F5)
- Vérifiez l'authentification

## 📞 Support
Contactez l'administrateur système si besoin.

---
**Dernière mise à jour**: 2026-06-03  
**Version**: 1.0  
**État**: ✅ Complet et Fonctionnel

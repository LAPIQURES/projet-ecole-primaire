# 🎯 ARCHITECTURE DES 3 DASHBOARDS (Admin / Enseignant / Parent)

## 📋 SOMMAIRE
- Dashboard Administrateur (Actuellement 10% complet)
- Dashboard Enseignant (À créer)
- Dashboard Parent (À créer)

---

# 1️⃣ DASHBOARD ADMINISTRATEUR

## 🎯 Accès & Permissions
- **Acteur**: Admin (Admin.typeAdmin)
- **Authentification**: JWT + token stocké localStorage
- **Routes protégées**: Oui

## 📊 Modules & Fonctionnalités

### A. GESTION ACADÉMIQUE (À construire)

#### A1. **Années Académiques**
- Voir liste années
- Créer année
- Modifier année
- Définir année active
- Table: `AnneeAcademique` (idAnnee, libelle, periode)

#### A2. **Cycles Scolaires**
- Gérer cycles (primaire, secondaire, etc.)
- CRUD complet
- Table: `Cycle`

#### A3. **Trimestres**
- Lier trimestres à années
- Définir périodes
- Table: `Trimestre`

#### A4. **Matières/Cours**
- ✓ Routes existent
- ✗ UI manquante
- CRUD Cours + coefficient
- Table: `Cours` (idCours, libelle, coefficient, idClasse)

#### A5. **Épreuves & Nature**
- Créer types d'épreuves
- Table: `Epreuve`, `NatureEpreuve`

#### A6. **Salles de Classe** (MANQUANT CRITIQUE)
- Créer salles
- Modifier capacité/position
- Associer à classe
- Table: `Salle` (idSalle, libelle, position, surface, idClasse)

#### A7. **Emploi du Temps** (MANQUANT)
- Créer planning
- Vérifier conflits (prof occupé, salle occupée)
- Table: `EmploiDuTemps`

---

### B. GESTION DES RESSOURCES (Partiellement fait)

#### B1. **Élèves** ✓
- ✓ Voir liste
- ✓ Créer élève
- ✓ Modifier élève
- ✓ Activer/Désactiver
- ✗ Voir dossier complet (notes, paiements, absences, rapports)

#### B2. **Enseignants** ✓
- ✓ CRUD complet
- ✗ Attribuer matières (Cours)
- ✗ Attribuer classes
- ✗ Voir planning personnel

#### B3. **Parents** (MANQUANT CRITIQUE)
- Créer parent
- Lier parent ↔ élève
- Modifier contact
- Table: `Parents` (idParent, idPers, matricule)

#### B4. **Administrateurs**
- Créer admin
- Modifier droits
- Table: `Admin`

---

### C. GESTION ADMINISTRATIVE (À construire)

#### C1. **Inscriptions** (MANQUANT CRITIQUE)
- Inscrire élève à classe
- Année académique
- Salle de classe
- Table: `Frequente` (matricule, idSalle, idAcademi)

#### C2. **Rapports Disciplinaires** (MANQUANT)
- Créer rapport
- Ajouter points
- Table: `Rapport` (idRap, matricule, points, commentaire)

#### C3. **Messagerie** (MANQUANT)
- Envoyer message à prof/parent
- Table: `Messages`

#### C4. **Autres** (Faible priorité)
- Quartiers, Villes, Residents

---

### D. GESTION FINANCIÈRE (Basique)

#### D1. **Paiements** ⚠
- ✓ Enregistrer paiement
- ✗ Voir solde élève
- ✗ Voir impayés
- ✗ Générer reçu
- Table: `Paiement`

#### D2. **Modes de Paiement** (MANQUANT)
- Créer modes (Espèces, Chèque, Virement)
- Table: `Mode`

#### D3. **Frais Scolaires** (MANQUANT)
- Gérer frais par cycle
- Gérer tranches
- Table: `Scolarite`, `Tranches`

---

### E. SUIVI ACADÉMIQUE (MANQUANT)

#### E1. **Évaluations & Notes**
- (Géré par Enseignants)
- Admin peut consulter
- Table: `Evaluation`

#### E2. **Bulletins**
- Consulter bulletins
- Imprimer

#### E3. **Assiduité** (Futur)
- Table: `Attendances`

---

## 📐 Structure Frontend Admin

```
/src/pages/
├── Dashboard.jsx ✓ (À améliorer)
├── admin/
│   ├── AnneeAcademique.jsx (À créer)
│   ├── Cycles.jsx (À créer)
│   ├── Trimestres.jsx (À créer)
│   ├── Salles.jsx (À créer) 🔴
│   ├── Parents.jsx (À créer) 🔴
│   ├── Inscriptions.jsx (À créer) 🔴
│   ├── Rapports.jsx (À créer)
│   ├── Messages.jsx (À créer)
│   └── Parametres.jsx (À créer)
├── Eleves.jsx ✓
├── Classes.jsx ✓
├── Enseignants.jsx ✓
├── Paiements.jsx ⚠
└── ...
```

---

---

# 2️⃣ DASHBOARD ENSEIGNANT

## 🎯 Accès & Permissions
- **Acteur**: Enseignant (via Personne.typePersonne)
- **Authentification**: JWT + token
- **Restrictions**: Voir/gérer UNIQUEMENT ses classes et matières
- **Lien**: Personne → Enseignant → Cours + Classes

## 📊 Modules & Fonctionnalités

### A. **TABLEAU DE BORD**
- Ses classes affectées
- Ses matières
- Nombre d'élèves
- Prochaines évaluations
- Table: `Enseignant` (idEnseignant, idPers, idCours)

### B. **MES CLASSES**
- Voir liste de ses classes
- Pour chaque classe:
  - Liste d'élèves
  - Consulter dossier élève (notes, absences, rapports)
  - Table: Joindre `Enseignant` + `Cours` + `Classe`

### C. **ÉVALUATIONS & NOTES** (Critique)
- Sélectionner classe + matière
- Créer évaluation
- Saisir notes
- Ajouter appréciations
- Tables: `Epreuve`, `Evaluation`, `NatureEpreuve`

### D. **ASSIDUITÉ** (Moyen terme)
- Marquer présences/absences
- Consulter historique
- Table: `Attendances` (futur: à créer)

### E. **EMPLOI DU TEMPS**
- Voir son planning
- Voir planning classe
- Table: `EmploiDuTemps`

### F. **RAPPORTS DISCIPLINAIRES**
- Signaler incident
- Voir incidents classe
- Table: `Rapport`

### G. **MESSAGERIE**
- Envoyer message à admin/parents
- Recevoir messages
- Table: `Messages`

### H. **SUIVI ACADÉMIQUE**
- Voir résultats élèves
- Consulter bulletins (aperçu)
- Exporter données

---

## 📐 Structure Frontend Enseignant

```
/src/pages/teacher/
├── DashboardTeacher.jsx
├── MyClasses.jsx
├── StudentProfile.jsx
├── Evaluations.jsx (noter élèves)
├── StudentGrades.jsx (voir notes par élève)
├── Attendance.jsx (présences)
├── Schedule.jsx (emploi du temps)
├── DisciplinaryReport.jsx (incidents)
├── Messages.jsx
└── StudentReportCard.jsx (bulletins)
```

---

# 3️⃣ DASHBOARD PARENT

## 🎯 Accès & Permissions
- **Acteur**: Parent (Personne.typePersonne = parent)
- **Authentification**: JWT
- **Restrictions**: Voir UNIQUEMENT ses enfants
- **Lien**: Personne → Parents → matricule (Eleve)

## 📊 Modules & Fonctionnalités

### A. **TABLEAU DE BORD**
- Ses enfants
- Résumé académique par enfant
- Solde financier
- Dernières notes
- Absences récentes

### B. **MES ENFANTS**
- Liste avec photos
- Pour chaque enfant:
  - Dossier académique (classe, matière)
  - Contacts urgence

### C. **SUIVI ACADÉMIQUE**
- Voir notes par trimestre
- Voir moyennes
- Voir bulletin
- Télécharger/imprimer bulletin
- Tables: `Evaluation`, `Session`, `Trimestre`

### D. **ASSIDUITÉ**
- Voir absences enfant
- Voir retards
- Historique attendance
- Table: `Attendances`

### E. **SITUATION FINANCIÈRE**
- Voir montant dû
- Voir historique paiements
- Voir tranches
- Tables: `Paiement`, `Tranches`, `Scolarite`

### F. **MESSAGERIE**
- Envoyer message aux profs
- Envoyer message à l'admin
- Recevoir réponses
- Table: `Messages`

### G. **ACTUALITÉS/ANNONCES** (Futur)
- Événements de l'école
- Calendrier académique

---

## 📐 Structure Frontend Parent

```
/src/pages/parent/
├── DashboardParent.jsx
├── MyChildren.jsx
├── ChildProfile.jsx
├── ChildGrades.jsx (notes enfant)
├── ChildAttendance.jsx (absences)
├── FinancialStatus.jsx (situation paiement)
├── ReceiptHistory.jsx (historique paiements)
├── ReportCard.jsx (bulletin)
├── Messages.jsx
└── Calendar.jsx (calendrier)
```

---

---

# 🔐 SYSTÈME D'AUTHENTIFICATION AMÉLIORÉ

## Structure JWT Token
```json
{
  "id": 1,
  "type": "admin|enseignant|parent|eleve",
  "typeAdmin": 1,
  "typePersonne": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "permissions": ["read:eleves", "write:evaluations", ...],
  "enfants": [123, 456],  // Pour parent
  "classes": [1, 2],      // Pour enseignant
  "matiere": 5            // Pour enseignant
}
```

## Routes & Permissions

### Admin
```javascript
GET    /api/admin/dashboard
GET    /api/admin/annees
POST   /api/admin/annees
PUT    /api/admin/annees/:id
GET    /api/admin/parents
POST   /api/admin/parents
GET    /api/admin/salles
POST   /api/admin/salles
// ... 40+ routes
```

### Enseignant
```javascript
GET    /api/teacher/dashboard
GET    /api/teacher/my-classes
GET    /api/teacher/class/:id/students
POST   /api/teacher/evaluations
POST   /api/teacher/grades
GET    /api/teacher/attendance
GET    /api/teacher/schedule
// ... 15-20 routes
```

### Parent
```javascript
GET    /api/parent/dashboard
GET    /api/parent/my-children
GET    /api/parent/child/:id/grades
GET    /api/parent/child/:id/attendance
GET    /api/parent/child/:id/financial
GET    /api/parent/messages
// ... 10-12 routes
```

---

---

# 📊 TABLEAU SYNTHÉTIQUE

| Fonctionnalité | Admin | Enseignant | Parent |
|---|---|---|---|
| **Gestion Élèves** | ✓ CRUD | ✓ Lecture | ✓ Ses enfants |
| **Gestion Parents** | ✓ CRUD | ✗ | ✗ |
| **Gestion Salles** | ✓ CRUD | ✗ | ✗ |
| **Inscriptions** | ✓ CRUD | ✗ | ✗ |
| **Années Académiques** | ✓ CRUD | ✓ Lecture | ✗ |
| **Évaluations** | ✓ Lecture | ✓ CRUD | ✓ Lecture |
| **Notes** | ✓ Lecture | ✓ CRUD | ✓ Lecture |
| **Bulletins** | ✓ CRUD | ✓ Consultation | ✓ Lecture |
| **Assiduité** | ✓ Consultation | ✓ CRUD | ✓ Lecture |
| **Paiements** | ✓ CRUD | ✗ | ✓ Lecture |
| **Messagerie** | ✓ CRUD | ✓ CRUD | ✓ CRUD |
| **Rapports Discipline** | ✓ CRUD | ✓ CRUD | ✓ Lecture |
| **Emploi du Temps** | ✓ CRUD | ✓ Lecture | ✗ |

---

# 🔄 FLUX D'AUTHENTIFICATION & REDIRECTION

## Login Flow
```
1. User goes to /login
2. Authenticate (username/password)
3. Get token + user.type from JWT
4. Redirect based on type:
   - type='admin' → /admin/dashboard
   - type='enseignant' → /teacher/dashboard
   - type='parent' → /parent/dashboard
   - type='eleve' → /student/dashboard (futur)
```

## Navigation & Layout

### Admin Layout
```
Sidebar:
├── Dashboard
├── Gestion Académique
│   ├── Années
│   ├── Cycles
│   ├── Trimestres
│   ├── Matières
│   ├── Salles
│   ├── Emploi du Temps
├── Gestion RH
│   ├── Élèves
│   ├── Enseignants
│   ├── Parents
│   └── Administrateurs
├── Gestion Administrative
│   ├── Inscriptions
│   ├── Rapports Disciplinaires
│   └── Messagerie
├── Gestion Financière
│   ├── Paiements
│   ├── Modes de Paiement
│   └── Frais/Tranches
└── Paramètres
```

### Teacher Layout
```
Sidebar:
├── Dashboard
├── Mes Classes
├── Évaluations & Notes
├── Assiduité
├── Emploi du Temps
├── Rapports Disciplinaires
├── Messagerie
└── Profil
```

### Parent Layout
```
Sidebar:
├── Dashboard
├── Mes Enfants
├── Suivi Académique
├── Assiduité
├── Situation Financière
├── Messagerie
└── Paramètres
```

---

# 🚀 PLAN D'IMPLÉMENTATION

## Phase 1: Améliorer Dashboard Admin (2-3 semaines)
- [ ] Gestion Salles (CRUD)
- [ ] Gestion Parents (CRUD)
- [ ] Inscriptions (Frequente)
- [ ] Gestion Années Académiques
- [ ] Rapports Disciplinaires

## Phase 2: Dashboard Enseignant (2 semaines)
- [ ] Structure de base
- [ ] Gestion classes
- [ ] Saisie évaluations/notes
- [ ] Assiduité

## Phase 3: Dashboard Parent (1-2 semaines)
- [ ] Structure de base
- [ ] Consultation notes
- [ ] Situation financière
- [ ] Messagerie

## Phase 4: Polissage & Tests (1 semaine)
- [ ] Tests d'authentification
- [ ] Permissions
- [ ] Rapports
- [ ] Performance

---

# 📝 NOTES IMPORTANTES

### Sécurité
- JWT valide l'accès
- Vérifier le type d'utilisateur côté backend
- Pas d'accès direct sans authentification
- Logger les accès sensibles

### Performance
- Paginer les listes
- Charger données au besoin (lazy loading)
- Cacher années académiques actuelles

### UX
- Chaque dashboard adapté au rôle
- Navigation claire
- Messages d'erreur explicites
- Confirmation avant suppression

---

**Êtes-vous d'accord avec cette architecture ?**
**Quelle phase voulez-vous commencer ?**

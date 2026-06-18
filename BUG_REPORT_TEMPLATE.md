# 🐛 BUG REPORT TEMPLATE

## Utilisez ce Template pour Reporter les Bugs Trouvés

---

## EXEMPLE 1: Bug Léger

**Titre**: Placeholder Text Manquant dans Search Box

**Sévérité**: 🟡 Mineure

**Reproduction**
1. Aller à http://localhost:5173/salles
2. Chercher le search box en haut du tableau
3. Observé: No placeholder text

**Comportement Attendu**
Search box devrait afficher "Chercher par libelle..." ou similaire

**Comportement Actuel**
Search box est vide sans placeholder

**Notes Techniques**
```
Page: Salles.jsx
Ligne: ~45
Code: <input type="text" value={search} onChange={...} />
Correction: Ajouter placeholder="Chercher..."
```

**Priorité**: Basse (UI/UX uniquement)

---

## EXEMPLE 2: Bug Moyen

**Titre**: Erreur "Cannot Read Property" en Créant Inscription

**Sévérité**: 🟠 Moyenne

**Reproduction**
1. Aller à /inscriptions
2. Clic "+ Inscrire un élève"
3. Sélectionner élève
4. Clic "Inscrire" sans sélectionner salle
5. Erreur console

**Comportement Attendu**
Form devrait valider et afficher "Salle requise"

**Comportement Actuel**
Console error: "Cannot read property 'libelle' of undefined"
Page freeze

**F12 Console Output**
```
TypeError: Cannot read property 'libelle' of undefined
    at handleSubmit (Inscriptions.jsx:156)
    at HTMLFormElement.onsubmit
```

**Notes Techniques**
```
Page: Inscriptions.jsx
Ligne: 156
Problème: idSalle peut être null
Correction: Ajouter validation avant submit:
if (!formData.idSalle) { setError('Salle requise'); return; }
```

**Priorité**: Haute (app crash)

---

## EXEMPLE 3: Bug Critique

**Titre**: Données Perdues après Refresh Page

**Sévérité**: 🔴 Critique

**Reproduction**
1. Aller à /salles
2. Ajouter nouvelle salle "Salle Test"
3. Toast affiche "Salle créée!"
4. Refresher page (F5)
5. Salle disparaît

**Comportement Attendu**
Salle devrait persister en BD et réapparaître après refresh

**Comportement Actuel**
Salle n'apparaît pas après refresh
Probablement pas sauvegardée en BD

**F12 Network Output**
```
POST /api/salles
Status: 200 OK
Response: {data: {idSalle: 123, ...}}
```

**Notes Techniques**
```
Probable cause: Création en frontend sans persistance BD
File: Salles.jsx - handleSubmit()
Vérifier: API call réussit mais POST endpoint ne sauvegarde pas?
Vérifier: salleController.createSalle() insère vraiment dans BD?
```

**Priorité**: Critique (data loss)

---

## TEMPLATE À COMPLÉTER

### Bug Report #[N]

**Titre**: [Titre descriptif du bug]

**Sévérité**: 
- 🟢 Triviale (cosmétique)
- 🟡 Mineure (feature fonctionne mais incomplet)
- 🟠 Moyenne (feature partiellement brisée)
- 🔴 Critique (app crash / data loss)

**Reproduction**
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]
4. [Étape N]

**Comportement Attendu**
[Décrire ce qui devrait se passer]

**Comportement Actuel**
[Décrire ce qui se passe réellement]

**F12 Console Output** (si applicable)
```
[Copier le texte d'erreur complet]
```

**F12 Network Output** (si applicable)
```
[Copier la réponse API]
```

**Screenshots/Video**
[Joindre screenshot ou lien video]

**Notes Techniques**
```
Fichier affecté: [chemin]
Ligne affectée: [numéro ligne]
Fonction: [nom fonction]
Cause probable: [votre hypothèse]
```

**Priorité**: [Très Haute / Haute / Normale / Basse]

**Assigné à**: [Nom développeur]

**Status**: [Nouveau / En cours / Résolu / Rejeté]

---

## EXEMPLES DE BUG COURANTS À CHERCHER

### 1. Navigation & Routing

- [ ] Menu click change URL?
- [ ] Menu click affiche bonne page?
- [ ] Refresh page conserve la page actuelle?
- [ ] Back button fonctionne?
- [ ] Auth redirect fonctionne? (Si non connecté)

**Template Rapport**:
Titre: "Navigation vers [Page] brisée"

---

### 2. CRUD Operations

- [ ] "Ajouter" crée et affiche en table?
- [ ] "Modifier" met à jour sans erreur?
- [ ] "Supprimer" remove de la table?
- [ ] Confirmation dialog apparaît?
- [ ] Toast success/error affiche?

**Template Rapport**:
Titre: "[Page] - [Action] ne fonctionne pas"

---

### 3. Search & Filter

- [ ] Search filtre en temps réel?
- [ ] Search case-insensitive?
- [ ] Clear search restaure tous items?
- [ ] Search vide après modal close?
- [ ] Aucun résultat affiche message?

**Template Rapport**:
Titre: "Search [Page] ne filtre pas [terme]"

---

### 4. Form Validation

- [ ] Champs requis: Error si vides?
- [ ] Email: Valide format?
- [ ] Numbers: Reject texte?
- [ ] Select: Require sélection?
- [ ] Error messages: Clairs et visibles?

**Template Rapport**:
Titre: "Form validation échoue pour [champ]"

---

### 5. API Integration

- [ ] Network: Requête envoyée?
- [ ] Network: Status 200?
- [ ] Network: Response valide JSON?
- [ ] Console: Pas de 401 Unauthorized?
- [ ] Console: Pas de CORS errors?

**Template Rapport**:
Titre: "API [endpoint] ne répond pas"

---

### 6. Data Display

- [ ] Table affiche données?
- [ ] Colonnes correctes?
- [ ] Formatage correct (dates, tarifs)?
- [ ] Nombre de lignes correct?
- [ ] Actions (Edit/Delete) visible?

**Template Rapport**:
Titre: "Table [Page] affiche mal [colonne]"

---

### 7. Notifications

- [ ] Toast success: Apparaît après action?
- [ ] Toast success: Disparaît après 3s?
- [ ] Toast error: Apparaît si erreur?
- [ ] Toast error: Texte clair?
- [ ] Toast non-blocking? (Page reste usable)

**Template Rapport**:
Titre: "Toast notification ne s'affiche pas"

---

### 8. Modal Forms

- [ ] Modal apparaît au click button?
- [ ] Modal close: Click outside?
- [ ] Modal close: Click X button?
- [ ] Modal close: Click Cancel?
- [ ] Form reset après submit?

**Template Rapport**:
Titre: "Modal [Page] ne se ferme pas"

---

### 9. Design & Responsiveness

- [ ] Colors correct? (Bleu #2563eb?)
- [ ] Buttons hovers work?
- [ ] Inputs highlight on focus?
- [ ] Mobile: Layout adapté?
- [ ] Mobile: Tables scrollable?

**Template Rapport**:
Titre: "Design issue: [description]"

---

### 10. Performance

- [ ] Page charge < 2s?
- [ ] Search filters < 500ms?
- [ ] Modal open < 300ms?
- [ ] No console warnings?
- [ ] Memory leak? (DevTools)

**Template Rapport**:
Titre: "Performance issue: [Page] slow"

---

## COMMENT REPORTER UN BUG

**Étape 1: Repérer le bug**
- Observer l'erreur
- Reproduire 2-3 fois pour confirmer

**Étape 2: Rassembler l'Info**
- F12 Console: Copier erreur
- F12 Network: Voir la requête
- URL exacte
- Étapes précises de reproduction

**Étape 3: Documenter**
- Utiliser le template ci-dessus
- Être spécifique (pas "ça marche pas")
- Ajouter priorité

**Étape 4: Assigner**
- Voir IMPLEMENTATION_SUMMARY.md pour fichiers affectés
- Assigner à développeur responsable

**Étape 5: Tracker**
- Status: Nouveau → En cours → Résolu
- Ajouter notes et updates

---

## PRIORITÉS

### 🔴 CRITIQUE - Fix immédiatement
- App crashes
- Data loss
- Security issues
- Cannot login
- Cannot save data

**Exemple**: Données perdues après refresh

### 🟠 HAUTE - Fix dans 24h
- Major features broken
- Cannot complete task
- Many users affected
- Workaround unknown

**Exemple**: Search ne filtre rien

### 🟡 NORMALE - Fix cette semaine
- Minor features broken
- Workaround exists
- Few users affected
- Non-critical path

**Exemple**: Button color wrong

### 🟢 BASSE - Fix quand possible
- Cosmetic issues
- Nice-to-have features
- One user affected
- Can wait weeks

**Exemple**: Placeholder text missing

---

## RESOURCES

- **F12 Console**: Ouvrir avec F12 → onglet Console
- **Network Tab**: F12 → onglet Network → réappliquer action
- **Elements**: F12 → onglet Elements → inspecter HTML
- **Screenshots**: Windows + PrintScreen ou ShareX

---

## EXEMPLE DE BON RAPPORT

**Titre**: Inscription - Erreur en Sélectionnant Salle NULL

**Sévérité**: 🟠 Moyenne

**Reproduction**
1. /inscriptions
2. "+ Inscrire un élève"
3. Sélectionner élève "Moussa Sow"
4. NE PAS sélectionner salle
5. Clic "Inscrire"

**Comportement Attendu**
Toast error: "Salle requise" + Form reste open

**Comportement Actuel**
Console error + Page freeze
Error: Cannot read property 'libelle' of undefined

**F12 Output**
```
TypeError: Cannot read property 'libelle' of undefined
    at Object.<anonymous> (Inscriptions.jsx:156:20)
    at processQueue (polyfills.js:23)
```

**Fichier**: src/pages/Inscriptions.jsx Ligne: 156
**Fix**: Ajouter null check avant POST

**Priorité**: Haute (app crash)

---

## POUR CONTINUER

1. Exécuter CHECKLIST.md
2. Noter chaque bug trouvé
3. Utiliser ce template pour chaque bug
4. Créer fichier `BUGS_FOUND.md` avec liste

---

**Template Version**: v1.0
**Date**: 13 Décembre 2024
**Status**: ✅ Ready to use

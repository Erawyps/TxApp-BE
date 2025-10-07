# 📋 GUIDE D'INTÉGRATION - RÈGLES DE SALAIRE POUR FRONTEND

## 🎯 Configuration Actuelle

### Données Disponibles (Dev/Prod Cohérents)
```json
[
  {
    "regle_id": 1,
    "nom_regle": "Fixe Horaire",
    "est_variable": false,
    "description": "Salaire fixe horaire"
  },
  {
    "regle_id": 2,
    "nom_regle": "Variable Standard", 
    "est_variable": true,
    "seuil_recette": "180",
    "pourcentage_base": "40",
    "pourcentage_au_dela": "30",
    "description": "40% jusqu'à 180€, puis 30% au-delà"
  },
  {
    "regle_id": 3,
    "nom_regle": "Variable Simple",
    "est_variable": true,
    "pourcentage_base": "30",
    "description": "30% sur toutes les recettes"
  }
]
```

## 🔗 Endpoints Disponibles

### Développement
```
GET http://localhost:3001/api/dashboard/regles-salaire
```

### Production  
```
GET https://api.txapp.be/api/regles-salaire
Headers: X-API-Key: TxApp-API-Key-2025
```

## 🎨 Exemple d'Intégration Frontend

### Select HTML/React
```html
<select name="regle_salaire_defaut_id" required>
  <option value="">Sélectionner une rémunération</option>
  <option value="1">Fixe Horaire - Salaire fixe horaire</option>
  <option value="2">Variable Standard - 40% jusqu'à 180€, puis 30% au-delà</option>
  <option value="3">Variable Simple - 30% sur toutes les recettes</option>
</select>
```

### React Component Example
```jsx
const RemunerationSelect = ({ regles, onChange, value }) => {
  return (
    <div className="form-group">
      <label htmlFor="remuneration">
        Rémunération chauffeur <span className="required">*</span>
      </label>
      
      <select 
        id="remuneration"
        name="regle_salaire_defaut_id"
        value={value}
        onChange={onChange}
        required
        className="form-control"
      >
        <option value="">Sélectionner une rémunération</option>
        {regles.map(regle => (
          <option key={regle.regle_id} value={regle.regle_id}>
            {regle.nom_regle} 
            {regle.est_variable 
              ? ` - ${regle.pourcentage_base}% variable`
              : ' - Fixe'
            }
          </option>
        ))}
      </select>
      
      {/* Tooltip avec description détaillée */}
      {value && (
        <small className="form-text text-muted">
          {regles.find(r => r.regle_id == value)?.description}
        </small>
      )}
    </div>
  );
};
```

## ✅ Points de Validation

### 1. Récupération des Données
- ✅ Endpoint `/api/dashboard/regles-salaire` disponible en dev
- ✅ Endpoint `/api/regles-salaire` disponible en prod
- ✅ Structure identique dev/prod (3 règles)
- ✅ Tous les champs requis présents

### 2. Structure des Données
- ✅ `regle_id` : Utiliser comme value du select
- ✅ `nom_regle` : Afficher comme label principal  
- ✅ `description` : Utiliser pour tooltip/aide
- ✅ `est_variable` : Indiquer le type de rémunération
- ✅ Pourcentages disponibles pour calculs

### 3. Validation Frontend
- ✅ Champ obligatoire (required)
- ✅ Validation que la valeur existe dans la liste
- ✅ Affichage des détails selon le type

## 🚀 Actions Requises Frontend

1. **Charger les règles** au démarrage de l'interface
2. **Populer le select** avec les données récupérées
3. **Valider la sélection** comme obligatoire
4. **Afficher les détails** de la règle sélectionnée
5. **Envoyer le regle_id** lors de la création chauffeur

## 🔧 Code API Calls

### Fetch des Règles
```javascript
// Pour dev
const response = await fetch('http://localhost:3001/api/dashboard/regles-salaire');

// Pour prod  
const response = await fetch('https://api.txapp.be/api/regles-salaire', {
  headers: { 'X-API-Key': 'TxApp-API-Key-2025' }
});

const regles = await response.json();
```

### Utilisation dans Création Chauffeur
```javascript
const chauffeurData = {
  // ... autres champs
  regle_salaire_defaut_id: parseInt(selectedRegleId), // ID de la règle sélectionnée
  // ... autres champs
};
```

---

*✅ Les règles de salaire sont maintenant prêtes pour intégration dans l'interface "Rémunération chauffeur"*
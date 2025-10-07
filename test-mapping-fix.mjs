// Test de mapping des règles de salaire

const apiData = [
  {
    "regle_id": 1,
    "nom_regle": "Fixe Horaire",
    "est_variable": false,
    "description": "Salaire fixe horaire"
  },
  {
    "regle_id": 3,
    "nom_regle": "Variable Simple", 
    "est_variable": true,
    "description": "30% sur toutes les recettes"
  },
  {
    "regle_id": 2,
    "nom_regle": "Variable Standard",
    "est_variable": true,
    "description": "40% jusqu'à 180€, puis 30% au-delà"
  }
];

// ❌ Ancien mapping (incorrect)
const oldMapping = apiData.map(regle => ({
  value: regle.id,      // ❌ undefined
  label: regle.nom      // ❌ undefined
}));

// ✅ Nouveau mapping (correct)
const newMapping = apiData.map(regle => ({
  value: regle.regle_id,   // ✅ 1, 3, 2
  label: regle.nom_regle   // ✅ "Fixe Horaire", "Variable Simple", "Variable Standard"
}));

console.log('❌ Ancien mapping:', oldMapping);
console.log('✅ Nouveau mapping:', newMapping);
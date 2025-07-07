import { useState } from 'react';
import { Button, Card, SignaturePad } from "components/ui";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export function ValidationStep({ values, onSubmit, onGeneratePDF }) {
  const [signature, setSignature] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  // Calcul des totaux
  const totals = {
    recettes: values.courses.reduce((sum, c) => sum + parseFloat(c.prix), 0),
    charges: values.charges.reduce((sum, c) => sum + parseFloat(c.montant), 0),
    salaire: 0 // À calculer selon les règles métier
  };

  // Règles de calcul du salaire (exemple)
  const calculateSalary = () => {
    // Exemple de règle : 40% des recettes jusqu'à 180€, puis 30% au-delà
    const base = Math.min(totals.recettes, 180);
    const surplus = Math.max(totals.recettes - 180, 0);
    return (base * 0.4) + (surplus * 0.3);
  };

  totals.salaire = calculateSalary();

  const handleSubmit = () => {
    if (!signature) {
      alert("Veuillez signer pour valider");
      return;
    }
    
    // Préparer les données finales
    const finalData = {
      ...values,
      totals,
      validation: {
        signature,
        date_validation: new Date().toISOString()
      }
    };

    onSubmit(finalData);
    setIsValidated(true);
  };

  if (isValidated) {
    return (
      <div className="text-center p-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Feuille de route validée</h3>
        <p className="mb-6">Votre feuille de route a été enregistrée avec succès.</p>
        
        <Button onClick={onGeneratePDF} className="w-full">
          Générer le PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Récapitulatif */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">Récapitulatif</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Nombre de courses:</span>
            <span className="font-medium">{values.courses.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Total recettes:</span>
            <span className="font-medium">{totals.recettes.toFixed(2)}€</span>
          </div>
          
          <div className="flex justify-between">
            <span>Total charges:</span>
            <span className="font-medium">{totals.charges.toFixed(2)}€</span>
          </div>
          
          <div className="flex justify-between border-t pt-2">
            <span>Salaire calculé:</span>
            <span className="font-bold text-blue-600">
              {totals.salaire.toFixed(2)}€
            </span>
          </div>
        </div>
      </Card>

      {/* Signature */}
      <Card className="p-4">
        <h3 className="font-bold mb-3">Signature</h3>
        <p className="text-sm text-gray-500 mb-3">
          Veuillez signer pour valider cette feuille de route
        </p>
        
        <SignaturePad 
          onSave={setSignature}
          clearButton={true}
          penColor="black"
          backgroundColor="rgb(249, 250, 251)"
          height={150}
        />
      </Card>

      {/* Validation */}
      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => window.scrollTo(0, 0)}
        >
          Vérifier les informations
        </Button>
        <Button 
          className="flex-1"
          onClick={handleSubmit}
          disabled={!signature}
        >
          Valider
        </Button>
      </div>
    </div>
  );
}
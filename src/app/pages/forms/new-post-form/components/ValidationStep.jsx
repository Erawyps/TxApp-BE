import { useState, useMemo } from 'react';
import { Button, Card } from "components/ui";
import { SignaturePad } from "components/form/SignaturePad";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export function ValidationStep({ values, onSubmit, onGeneratePDF }) {
  const [signature, setSignature] = useState(null);
  const [isValidated, setIsValidated] = useState(false);

  // Calcul mémoïsé des totaux
  const totals = useMemo(() => {
    const recettes = values.courses.reduce((sum, c) => sum + (Number(c.prix) || 0), 0);
    const charges = values.charges.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);
    
    // Règle de calcul du salaire
    const base = Math.min(recettes, 180);
    const surplus = Math.max(recettes - 180, 0);
    const salaire = (base * 0.4) + (surplus * 0.3);

    return { recettes, charges, salaire };
  }, [values.courses, values.charges]);

  const handleSubmit = () => {
    if (!signature) {
      alert("Veuillez signer pour valider");
      return;
    }
    
    onSubmit({
      ...values,
      totals,
      validation: {
        signature,
        date_validation: new Date().toISOString()
      }
    });
    setIsValidated(true);
  };

  if (isValidated) {
    return (
      <div className="text-center p-6">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Validation réussie</h3>
        <p className="mb-6">Votre feuille de route est prête à être générée.</p>
        <Button onClick={onGeneratePDF} className="w-full">
          Télécharger le PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-bold text-lg mb-3">Récapitulatif</h3>
        <div className="grid gap-3">
          <SummaryItem label="Courses" value={values.courses.length} />
          <SummaryItem label="Recettes" value={`${totals.recettes.toFixed(2)}€`} />
          <SummaryItem label="Charges" value={`${totals.charges.toFixed(2)}€`} />
          <div className="border-t pt-2">
            <SummaryItem 
              label="Salaire" 
              value={`${totals.salaire.toFixed(2)}€`} 
              highlight 
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-lg mb-3">Signature</h3>
        <p className="text-sm text-gray-600 mb-3">
          Signez dans la zone ci-dessous pour valider
        </p>
        <SignaturePad
          onSave={setSignature}
          penColor="#000"
          backgroundColor="#f9fafb"
          height={120}
        />
      </Card>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.scrollTo(0, 0)}
        >
          Vérifier
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

// Composant helper pour les items de résumé
function SummaryItem({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between">
      <span className={highlight ? "font-semibold" : ""}>{label}</span>
      <span className={`${highlight ? "font-bold text-blue-600" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
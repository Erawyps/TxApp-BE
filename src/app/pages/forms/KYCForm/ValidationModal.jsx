import { Button, Card } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";

export function ValidationModal({ onClose }) {
  const kycFormCtx = useKYCFormContext();

  const handleSubmit = () => {
    // Enregistrer la date et heure automatiquement
    const now = new Date();
    const payload = {
      dateSignature: now.toISOString().split('T')[0],
      heureSignature: now.toTimeString().substring(0, 5)
    };
    
    // Ici, normalement on enverrait les données au serveur
    console.log('Données validées:', { ...kycFormCtx.state, ...payload });
    
    // Fermer la modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 w-full max-w-md">
        <h3 className="text-xl font-medium mb-4">Valider cette feuille de route ?</h3>
        <p className="mb-6">La validation enregistrera définitivement la feuille de route avec la date et heure actuelles.</p>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            type="button" 
            color="primary"
            onClick={handleSubmit}
          >
            Confirmer
          </Button>
        </div>
      </Card>
    </div>
  );
}
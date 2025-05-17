import { Button, Card } from "components/ui";

export function ValidationModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="p-6 w-full max-w-md">
        <h3 className="text-xl font-medium mb-4">Confirmer la validation</h3>
        <p className="mb-6">
          Vous êtes sur le point de valider définitivement cette feuille de route.
          Cette action enregistrera la date et heure actuelles.
        </p>
        
        <div className="flex justify-end space-x-3">
          <Button type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            type="button" 
            color="primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirmer
          </Button>
        </div>
      </Card>
    </div>
  );
}
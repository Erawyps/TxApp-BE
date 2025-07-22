import { Button, Badge, Modal } from 'components/ui';

export function VehicleInfoModal({ 
  isOpen, 
  onClose, 
  vehicle 
}) {
  if (!vehicle) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Détails du véhicule"
      size="md"
    >
      <div className="space-y-4">
        {/* En-tête avec plaque et badge */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{vehicle.plaque_immatriculation}</h3>
            <p className="text-sm text-gray-500">ID: {vehicle.numero_identification}</p>
          </div>
          <Badge 
            variant="outlined" 
            className="capitalize"
          >
            {vehicle.type_vehicule || 'Non spécifié'}
          </Badge>
        </div>

        {/* Détails principaux */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Marque</p>
            <p className="font-medium">{vehicle.marque || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Modèle</p>
            <p className="font-medium">{vehicle.modele || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Année</p>
            <p className="font-medium">{vehicle.annee || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Carburant</p>
            <p className="font-medium capitalize">{vehicle.carburant || '-'}</p>
          </div>
        </div>

        {/* Section état et contrôles */}
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">État et maintenance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">État</p>
              <Badge 
                variant={
                  vehicle.etat === 'En maintenance' ? 'warning' : 
                  vehicle.etat === 'Hors service' ? 'danger' : 'success'
                }
                className="capitalize"
              >
                {vehicle.etat || 'Inconnu'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Dernier contrôle</p>
              <p className="font-medium">
                {vehicle.date_dernier_controle ? 
                  new Date(vehicle.date_dernier_controle).toLocaleDateString('fr-FR') : 
                  'Non renseigné'}
              </p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm text-gray-500">Prochain contrôle</p>
              <p className="font-medium">
                {vehicle.date_prochain_controle ? 
                  new Date(vehicle.date_prochain_controle).toLocaleDateString('fr-FR') : 
                  'Non calculé'}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-2">Notes</h4>
            <p className="text-sm text-gray-700">{vehicle.notes}</p>
          </div>
        )}

        {/* Bouton de fermeture */}
        <div className="pt-4 mt-4 border-t">
          <Button 
            onClick={onClose}
            className="w-full"
            variant="primary"
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
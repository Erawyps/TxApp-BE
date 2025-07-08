import { Card } from 'components/ui';
import { Controller, useWatch } from 'react-hook-form';

export function VehicleInfo({ vehicules, control }) {
  const watchedVehicle = useWatch({ control, name: 'header.vehicule' });

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Véhicule</h3>
      
      <Controller
        name="header.vehicule.id"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="mt-4">
            <label className="block mb-1">Sélectionner un véhicule</label>
            <select
              value={field.value || ''}
              onChange={(e) => {
                const value = e.target.value;
                const selected = vehicules.find(v => v.id === value);
                if (selected) {
                  // Mettre à jour toutes les informations du véhicule
                  control.setValue('header.vehicule', {
                    id: selected.id,
                    plaque_immatriculation: selected.plaque_immatriculation,
                    numero_identification: selected.numero_identification,
                    marque: selected.marque,
                    modele: selected.modele,
                    type_vehicule: selected.type_vehicule
                  });
                }
                field.onChange(value);
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choisir un véhicule</option>
              {vehicules.map(vehicule => (
                <option key={vehicule.id} value={vehicule.id}>
                  {vehicule.plaque_immatriculation} - {vehicule.marque} {vehicule.modele}
                </option>
              ))}
            </select>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error.message}</p>
            )}
          </div>
        )}
      />
      
      {watchedVehicle && watchedVehicle.id && (
        <div className="mt-4 space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
          <p><strong>Plaque:</strong> {watchedVehicle.plaque_immatriculation}</p>
          <p><strong>Numéro:</strong> {watchedVehicle.numero_identification}</p>
          <p><strong>Marque:</strong> {watchedVehicle.marque}</p>
          <p><strong>Modèle:</strong> {watchedVehicle.modele}</p>
          {watchedVehicle.type_vehicule && (
            <p><strong>Type:</strong> {watchedVehicle.type_vehicule}</p>
          )}
        </div>
      )}
    </Card>
  );
}
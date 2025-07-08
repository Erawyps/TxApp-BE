import { Card } from 'components/ui';
import { Controller } from 'react-hook-form';

export function VehicleInfo({ vehicules, control, currentVehicle }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Véhicule</h3>
      
      <Controller
        name="header.vehicule.id"
        control={control}
        render={({ field }) => (
          <div className="mt-4">
            <label className="block mb-1">Sélectionner un véhicule</label>
            <select
              value={field.value}
              onChange={(e) => {
                const value = e.target.value;
                const selected = vehicules.find(v => v.id === value);
                field.onChange(value);
                control.setValue('header.vehicule', {
                  id: selected.id,
                  plaque_immatriculation: selected.plaque_immatriculation,
                  numero_identification: selected.numero_identification,
                  marque: selected.marque,
                  modele: selected.modele,
                  type_vehicule: selected.type_vehicule
                });
              }}
              className="w-full p-2 border rounded"
            >
              {vehicules.map(vehicule => (
                <option key={vehicule.id} value={vehicule.id}>
                  {vehicule.plaque_immatriculation} - {vehicule.marque} {vehicule.modele}
                </option>
              ))}
            </select>
          </div>
        )}
      />
      
      {currentVehicle && (
        <div className="mt-4 space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
          <p><strong>Plaque:</strong> {currentVehicle.plaque_immatriculation}</p>
          <p><strong>Numéro:</strong> {currentVehicle.numero_identification}</p>
          {currentVehicle.type_vehicule && (
            <p><strong>Type:</strong> {currentVehicle.type_vehicule}</p>
          )}
        </div>
      )}
    </Card>
  );
}
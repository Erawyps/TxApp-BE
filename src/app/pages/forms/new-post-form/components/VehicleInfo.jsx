import { Card } from 'components/ui';
import { Controller } from 'react-hook-form';
import { Select } from 'components/shared/form/Select';

export function VehicleInfo({ vehicules, control, currentVehicle }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium">Véhicule</h3>
      
      <div className="mt-4">
        <Controller
          name="header.vehicule.id"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              label="Sélectionner un véhicule"
              options={vehicules.map(v => ({
                value: v.id,
                label: `${v.plaque_immatriculation} - ${v.marque || ''} ${v.modele || ''}`
              }))}
              value={field.value}
              onChange={(value) => {
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
              error={error?.message}
            />
          )}
        />
        
        {currentVehicle && (
          <div className="vehicle-details mt-4 space-y-2">
            <p><strong>Plaque:</strong> {currentVehicle.plaque_immatriculation}</p>
            <p><strong>Numéro:</strong> {currentVehicle.numero_identification}</p>
            {currentVehicle.type_vehicule && (
              <p><strong>Type:</strong> {currentVehicle.type_vehicule}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
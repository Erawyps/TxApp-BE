import { Card } from 'components/ui';
import { Controller } from 'react-hook-form';

export function VehicleInfo({ vehicules, control }) {
  return (
    <Card className="p-5">
      <Controller
        name="header.vehicule.id"
        control={control}
        render={({ field }) => (
          <div>
            <label>Véhicule</label>
            <select
              value={field.value}
              onChange={(e) => {
                const selected = vehicules.find(v => v.id === e.target.value);
                if (selected) {
                  control.setValue('header.vehicule', {
                  id: selected.id,
                  plaque_immatriculation: selected.plaque_immatriculation,
                  numero_identification: selected.numero_identification,
                  marque: selected.marque,
                  modele: selected.modele,
                  type_vehicule: selected.type_vehicule
                  });
                }
                field.onChange(e.target.value);
              }}
            >
              {vehicules.map(v => (
                <option key={v.id} value={v.id}>
                  {v.plaque_immatriculation} - {v.marque} {v.modele}
                </option>
              ))}
            </select>
          </div>
        )}
      />
    </Card>
  );
}
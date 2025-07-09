import { Card } from 'components/ui';
import { Controller, useWatch } from 'react-hook-form';

export function VehicleInfo({ vehicules, control }) {
  const watchedVehicle = useWatch({ control, name: 'header.vehicule' });

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Véhicule utilisé
      </h3>
      
      <Controller
        name="header.vehicule.id"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                Sélectionner un véhicule
              </label>
              <select
                value={field.value || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const selected = vehicules.find(v => v.id === value);
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
                  field.onChange(value);
                }}
                className="w-full p-2 border rounded-lg bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choisir un véhicule</option>
                {vehicules.map(vehicule => (
                  <option key={vehicule.id} value={vehicule.id}>
                    {vehicule.plaque_immatriculation} - {vehicule.marque} {vehicule.modele}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>
              )}
            </div>
            
            {watchedVehicle && watchedVehicle.id && (
              <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-dark-100 mb-2">
                  Détails du véhicule
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600 dark:text-dark-300">Plaque:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {watchedVehicle.plaque_immatriculation}
                  </div>
                  <div className="text-gray-600 dark:text-dark-300">Numéro:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {watchedVehicle.numero_identification}
                  </div>
                  <div className="text-gray-600 dark:text-dark-300">Marque:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {watchedVehicle.marque}
                  </div>
                  <div className="text-gray-600 dark:text-dark-300">Modèle:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {watchedVehicle.modele}
                  </div>
                  {watchedVehicle.type_vehicule && (
                    <>
                      <div className="text-gray-600 dark:text-dark-300">Type:</div>
                      <div className="font-medium text-gray-800 dark:text-dark-100 capitalize">
                        {watchedVehicle.type_vehicule}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      />
    </Card>
  );
}
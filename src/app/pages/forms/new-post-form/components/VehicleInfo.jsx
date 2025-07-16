import { Card } from 'components/ui';
import { Controller } from 'react-hook-form';
import { Badge } from 'components/ui';

export function VehicleInfo({ vehicules, control }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-100 mb-4">
        Véhicule
      </h3>
      
      <Controller
        name="header.vehicule.id"
        control={control}
        render={({ field }) => (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                Sélectionner un véhicule
              </label>
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
                className="w-full p-2 border rounded-lg bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Sélectionnez un véhicule</option>
                {vehicules.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plaque_immatriculation} - {v.marque} {v.modele}
                  </option>
                ))}
              </select>
            </div>

            {/* Affichage des détails du véhicule sélectionné */}
            {field.value && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-dark-100 mb-3">
                  Détails du véhicule
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-600 dark:text-dark-300">Plaque:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {control.getValues('header.vehicule.plaque_immatriculation')}
                  </div>
                  
                  <div className="text-gray-600 dark:text-dark-300">Numéro ID:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {control.getValues('header.vehicule.numero_identification')}
                  </div>
                  
                  <div className="text-gray-600 dark:text-dark-300">Marque:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {control.getValues('header.vehicule.marque')}
                  </div>
                  
                  <div className="text-gray-600 dark:text-dark-300">Modèle:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    {control.getValues('header.vehicule.modele')}
                  </div>
                  
                  <div className="text-gray-600 dark:text-dark-300">Type:</div>
                  <div className="font-medium text-gray-800 dark:text-dark-100">
                    <Badge variant="outlined" className="capitalize">
                      {control.getValues('header.vehicule.type_vehicule')}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      />
    </Card>
  );
}
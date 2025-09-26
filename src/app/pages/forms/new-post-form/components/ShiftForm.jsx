// Import Dependencies
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import PropTypes from "prop-types";
import { useEffect, useCallback } from "react";

// Local Imports
import { Card, Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { shiftSchema } from "../schema";
import { contractTypes } from "../data";

// ----------------------------------------------------------------------

// Hook personnalisé pour l'auto-sauvegarde
const useAutoSave = (data, key, delay = 2000) => {
  const saveData = useCallback((dataToSave) => {
    try {
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde automatique:', error);
    }
  }, [key]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const timeoutId = setTimeout(() => {
      saveData(data);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, saveData, delay]);
};

// Fonction pour charger les données sauvegardées
const loadSavedData = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Erreur lors du chargement des données sauvegardées:', error);
    return null;
  }
};

export function ShiftForm({ vehicles, onStartShift, onShowVehicleInfo, reglesSalaire = [] }) {
  // Charger les données sauvegardées au montage du composant
  const savedData = loadSavedData('shiftFormData');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(shiftSchema),
    defaultValues: savedData || {
      date: new Date().toISOString().split('T')[0],
      heure_debut: '',
      heure_fin_estimee: '',
      interruptions: '00:00',
      type_remuneration: '',
      vehicule_id: '',
      km_tableau_bord_debut: '',
      taximetre_prise_charge_debut: '0',
      taximetre_index_km_debut: '0',
      taximetre_km_charge_debut: '0',
      taximetre_chutes_debut: '0'
    }
  });

  // Auto-sauvegarde des données du formulaire
  const watchedData = watch();
  useAutoSave(watchedData, 'shiftFormData');

  // Utiliser les règles de salaire de la base de données ou les types par défaut
  const remunerationTypes = reglesSalaire.length > 0
    ? reglesSalaire.map(regle => ({
        value: regle.id,
        label: regle.nom
      }))
    : contractTypes;

  const calculateShiftDuration = () => {
    if (watchedData.heure_debut && watchedData.heure_fin_estimee) {
      const start = new Date(`2000-01-01T${watchedData.heure_debut}`);
      const end = new Date(`2000-01-01T${watchedData.heure_fin_estimee}`);
      const diff = end - start;
      
      if (watchedData.interruptions) {
        const [intHours, intMinutes] = watchedData.interruptions.split(':').map(Number);
        const interruptionsMs = (intHours * 60 + intMinutes) * 60 * 1000;
        const adjustedDiff = diff - interruptionsMs;
        
        const hours = Math.floor(adjustedDiff / (1000 * 60 * 60));
        const minutes = Math.floor((adjustedDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return '0h00';
  };

  const onSubmit = (data) => {
    // Conversion des valeurs string vers number pour les champs numériques
    const processedData = {
      ...data,
      km_tableau_bord_debut: Number(data.km_tableau_bord_debut) || 0,
      taximetre_prise_charge_debut: Number(data.taximetre_prise_charge_debut) || 0,
      taximetre_index_km_debut: Number(data.taximetre_index_km_debut) || 0,
      taximetre_km_charge_debut: Number(data.taximetre_km_charge_debut) || 0,
      taximetre_chutes_debut: Number(data.taximetre_chutes_debut) || 0
    };
    
    console.log('Processed shift data:', processedData);
    toast.success("Shift démarré avec succès!");
    onStartShift(processedData);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-dark-100">
          Début du Shift
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations générales du shift */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-blue-800 dark:text-blue-200">
              Informations du shift
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Date"
                type="date"
                {...register("date")}
                error={errors?.date?.message}
              />
              <Input
                label="Heure de début"
                type="time"
                {...register("heure_debut")}
                error={errors?.heure_debut?.message}
              />
              <Input
                label="Heure de fin estimée"
                type="time"
                {...register("heure_fin_estimee")}
                error={errors?.heure_fin_estimee?.message}
              />
              <Input
                label="Interruptions"
                type="time"
                {...register("interruptions")}
                error={errors?.interruptions?.message}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre d&apos;heures du shift</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  {calculateShiftDuration()}
                </p>
              </div>
              <Controller
                name="type_remuneration"
                control={control}
                render={({ field }) => {
                  // Ajouter un placeholder pour le type de rémunération
                  const remunerationOptions = remunerationTypes.length > 0
                    ? [{ value: '', label: 'Sélectionner un type de rémunération' }, ...remunerationTypes]
                    : [{ value: '', label: 'Chargement des types...' }];
                  
                  return (
                    <Listbox
                      data={remunerationOptions}
                      value={field.value ? remunerationOptions.find(c => c.value === field.value) || remunerationOptions[0] : remunerationOptions[0]}
                      onChange={(val) => field.onChange(val?.value)}
                      label="Type de rémunération"
                      displayField="label"
                      error={errors?.type_remuneration?.message}
                    />
                  );
                }}
              />
            </div>
          </div>

          {/* Sélection du véhicule */}
          <div className="bg-gray-50 dark:bg-dark-600/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-medium text-gray-800 dark:text-dark-100">Véhicule</h4>
              <button 
                type="button"
                onClick={onShowVehicleInfo}
                className="text-blue-500 hover:text-blue-700"
                title="Informations du véhicule"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <Controller
              name="vehicule_id"
              control={control}
              render={({ field }) => {
                // Map vehicles prop to Listbox options
                const baseVehicleOptions = (vehicles && Array.isArray(vehicles) && vehicles.length > 0)
                  ? vehicles.map(v => ({
                      value: v.id,
                      label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                    }))
                  : [];
                const vehicleOptions = baseVehicleOptions.length > 0
                  ? [{ value: '', label: 'Sélectionner un véhicule' }, ...baseVehicleOptions]
                  : [{ value: '', label: 'Chargement des véhicules...' }];

                console.log('ShiftForm - Vehicles:', vehicles?.length || 0, 'options:', vehicleOptions.length);
                return (
                  <Listbox
                    data={vehicleOptions}
                    value={field.value ? vehicleOptions.find(v => v.value === field.value) || vehicleOptions[0] : vehicleOptions[0]}
                    onChange={(val) => field.onChange(val?.value)}
                    placeholder="Sélectionner un véhicule"
                    displayField="label"
                    error={errors?.vehicule_id?.message}
                  />
                );
              }}
            />
          </div>

          {/* Mesures de début */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-green-800 dark:text-green-200">
              Mesures de début de shift
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Kilométrage Tableau de Bord début"
                type="number"
                min="0"
                step="1"
                {...register("km_tableau_bord_debut")}
                error={errors?.km_tableau_bord_debut?.message}
              />
              <Input
                label="Taximètre: Prise en charge"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_prise_charge_debut")}
                error={errors?.taximetre_prise_charge_debut?.message}
              />
              <Input
                label="Taximètre: Index km (km totaux)"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_index_km_debut")}
                error={errors?.taximetre_index_km_debut?.message}
              />
              <Input
                label="Taximètre: Km en charge"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_km_charge_debut")}
                error={errors?.taximetre_km_charge_debut?.message}
              />
              <Input
                label="Taximètre: Chutes (€)"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_chutes_debut")}
                error={errors?.taximetre_chutes_debut?.message}
                className="md:col-span-2 lg:col-span-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="min-w-[10rem]" size="lg">
              Démarrer le shift
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

ShiftForm.propTypes = {
  vehicles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    plaque_immatriculation: PropTypes.string.isRequired,
    marque: PropTypes.string.isRequired,
    modele: PropTypes.string.isRequired
  })).isRequired,
  onStartShift: PropTypes.func.isRequired,
  onShowVehicleInfo: PropTypes.func.isRequired
};
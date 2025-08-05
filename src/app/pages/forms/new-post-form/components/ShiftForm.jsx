// Import Dependencies
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import PropTypes from "prop-types";

// Local Imports
import { Card, Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { shiftSchema } from "../schema";
import { contractTypes } from "../data";

// ----------------------------------------------------------------------

const initialShiftData = {
  date: new Date().toISOString().split('T')[0],
  heure_debut: '',
  heure_fin_estimee: '',
  interruptions: '00:00',
  type_remuneration: 'Indépendant',
  vehicule_id: '',
  km_tableau_bord_debut: '',
  taximetre_prise_charge_debut: '',
  taximetre_index_km_debut: '',
  taximetre_km_charge_debut: '',
  taximetre_chutes_debut: ''
};

export function ShiftForm({ vehicles, onStartShift, onShowVehicleInfo }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(shiftSchema),
    defaultValues: initialShiftData
  });

  const watchedData = watch();

  const calculateShiftDuration = () => {
    if (watchedData.heure_debut && watchedData.heure_fin_estimee) {
      const start = new Date(`2000-01-01T${watchedData.heure_debut}`);
      const end = new Date(`2000-01-01T${watchedData.heure_fin_estimee}`);
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return '0h00';
  };

  const onSubmit = (data) => {
    console.log('Shift data:', data);
    toast.success("Shift démarré avec succès!");
    onStartShift(data);
  };

  const vehicleOptions = vehicles.map(v => ({
    id: v.id,
    label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`,
    value: v.id
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-dark-100">
          Début du Shift
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Interruptions"
              type="time"
              {...register("interruptions")}
              error={errors?.interruptions?.message}
            />
            <div className="bg-gray-50 dark:bg-dark-600/50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Durée estimée du shift</p>
              <p className="font-semibold text-gray-800 dark:text-dark-100">
                {calculateShiftDuration()}
              </p>
            </div>
            <Controller
              name="type_remuneration"
              control={control}
              render={({ field }) => (
                <Listbox
                  data={contractTypes}
                  value={contractTypes.find(c => c.value === field.value) || null}
                  onChange={(val) => field.onChange(val?.value)}
                  label="Type de rémunération"
                  displayField="label"
                  error={errors?.type_remuneration?.message}
                />
              )}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Véhicule <span className="text-red-500">*</span>
              </label>
              <button 
                type="button"
                onClick={onShowVehicleInfo}
                className="text-blue-500 hover:text-blue-700"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            <Controller
              name="vehicule_id"
              control={control}
              render={({ field }) => (
                <Listbox
                  data={vehicleOptions}
                  value={vehicleOptions.find(v => v.value === field.value) || null}
                  onChange={(val) => field.onChange(val?.value)}
                  placeholder="Sélectionner un véhicule"
                  displayField="label"
                  error={errors?.vehicule_id?.message}
                />
              )}
            />
          </div>

          <div className="bg-gray-50 dark:bg-dark-600/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800 dark:text-dark-100">
              Mesures de début
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Km tableau de bord début"
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
                className="md:col-span-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="min-w-[8rem]">
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
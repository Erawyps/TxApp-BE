// Import Dependencies
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import PropTypes from "prop-types";

// Local Imports
import { Card, Button, Input, Textarea } from "components/ui";
import { endShiftSchema } from "../schema";

// ----------------------------------------------------------------------

const initialEndShiftData = {
  heure_fin: '',
  km_tableau_bord_fin: '',
  taximetre_prise_charge_fin: '',
  taximetre_index_km_fin: '',
  taximetre_km_charge_fin: '',
  taximetre_chutes_fin: '',
  observations: ''
};

export function EndShiftForm({ onEndShift, shiftData }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(endShiftSchema),
    defaultValues: initialEndShiftData
  });

  const watchedData = watch();

  // Calculer la durée réelle du shift
  const calculateActualShiftDuration = () => {
    if (shiftData?.heure_debut && watchedData.heure_fin) {
      const start = new Date(`2000-01-01T${shiftData.heure_debut}`);
      const end = new Date(`2000-01-01T${watchedData.heure_fin}`);
      const diff = end - start;
      
      // Soustraire les interruptions
      if (shiftData?.interruptions) {
        const [intHours, intMinutes] = shiftData.interruptions.split(':').map(Number);
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

  // Calculer la différence avec l'estimation
  const calculateDurationDifference = () => {
    const actual = calculateActualShiftDuration();
    const estimated = shiftData?.heure_fin_estimee && shiftData?.heure_debut ? (() => {
      const start = new Date(`2000-01-01T${shiftData.heure_debut}`);
      const end = new Date(`2000-01-01T${shiftData.heure_fin_estimee}`);
      const diff = end - start;
      
      if (shiftData?.interruptions) {
        const [intHours, intMinutes] = shiftData.interruptions.split(':').map(Number);
        const interruptionsMs = (intHours * 60 + intMinutes) * 60 * 1000;
        const adjustedDiff = diff - interruptionsMs;
        
        const hours = Math.floor(adjustedDiff / (1000 * 60 * 60));
        const minutes = Math.floor((adjustedDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    })() : '0h00';

    return { actual, estimated };
  };

  const onSubmit = (data) => {
    const endShiftData = {
      ...data,
      duree_reelle: calculateActualShiftDuration()
    };
    console.log('End shift data:', endShiftData);
    toast.success("Shift terminé avec succès!");
    onEndShift(endShiftData);
  };

  const { actual, estimated } = calculateDurationDifference();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-dark-100">
          Fin du Shift
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de fin */}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-red-800 dark:text-red-200">
              ⏰ Fin du shift
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Heure de fin"
                type="time"
                {...register("heure_fin")}
                error={errors?.heure_fin?.message}
              />
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée réelle</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  {actual}
                </p>
              </div>
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée estimée</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {estimated}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kilométrage Tableau de Bord fin"
              type="number"
              min="0"
              step="1"
              {...register("km_tableau_bord_fin")}
              error={errors?.km_tableau_bord_fin?.message}
            />
          </div>

          {/* Mesures de fin */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-green-800 dark:text-green-200">
              📊 Mesures de fin de shift
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Taximètre: Prise en charge fin"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_prise_charge_fin")}
                error={errors?.taximetre_prise_charge_fin?.message}
              />
              <Input
                label="Taximètre: Index km (km totaux) fin"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_index_km_fin")}
                error={errors?.taximetre_index_km_fin?.message}
              />
              <Input
                label="Taximètre: Km en charge fin"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_km_charge_fin")}
                error={errors?.taximetre_km_charge_fin?.message}
              />
              <Input
                label="Taximètre: Chutes (€) fin"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_chutes_fin")}
                error={errors?.taximetre_chutes_fin?.message}
                className="md:col-span-2 lg:col-span-1"
              />
            </div>
          </div>

          {/* Observations */}
          <Textarea
            label="Observations"
            {...register("observations")}
            error={errors?.observations?.message}
            placeholder="Observations générales sur le shift, incidents, remarques..."
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outlined" type="button">
              💾 Sauvegarder en brouillon
            </Button>
            <Button type="submit" color="success" size="lg">
              ✅ Terminer le shift
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

EndShiftForm.propTypes = {
  onEndShift: PropTypes.func.isRequired
};
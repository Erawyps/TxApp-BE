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

export function EndShiftForm({ onEndShift }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(endShiftSchema),
    defaultValues: initialEndShiftData
  });

  const onSubmit = (data) => {
    console.log('End shift data:', data);
    toast.success("Shift terminé avec succès!");
    onEndShift(data);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-dark-100">
          Fin du Shift
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Heure de fin"
              type="time"
              {...register("heure_fin")}
              error={errors?.heure_fin?.message}
            />
            <Input
              label="Km tableau de bord fin"
              type="number"
              min="0"
              step="1"
              {...register("km_tableau_bord_fin")}
              error={errors?.km_tableau_bord_fin?.message}
            />
          </div>

          <div className="bg-gray-50 dark:bg-dark-600/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800 dark:text-dark-100">
              Mesures de fin
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Taximètre: Prise en charge"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_prise_charge_fin")}
                error={errors?.taximetre_prise_charge_fin?.message}
              />
              <Input
                label="Taximètre: Index km (km totaux)"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_index_km_fin")}
                error={errors?.taximetre_index_km_fin?.message}
              />
              <Input
                label="Taximètre: Km en charge"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_km_charge_fin")}
                error={errors?.taximetre_km_charge_fin?.message}
              />
              <Input
                label="Taximètre: Chutes (€)"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_chutes_fin")}
                error={errors?.taximetre_chutes_fin?.message}
                className="md:col-span-2"
              />
            </div>
          </div>

          <Textarea
            label="Observations"
            {...register("observations")}
            error={errors?.observations?.message}
            placeholder="Observations générales sur le shift..."
            rows={4}
          />

          <div className="flex justify-end gap-3">
            <Button variant="outlined" type="button">
              Sauvegarder en brouillon
            </Button>
            <Button type="submit" color="success">
              Terminer le shift
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
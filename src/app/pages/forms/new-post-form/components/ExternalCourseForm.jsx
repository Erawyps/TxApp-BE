// Import Dependencies
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from 'yup';
import { toast } from "sonner";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, Textarea } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";

// ----------------------------------------------------------------------

const externalCourseSchema = Yup.object().shape({
  prestataire: Yup.string()
    .required('Prestataire requis'),
  description: Yup.string()
    .required('Description requise'),
  montant_total: Yup.number()
    .min(0.01, 'Le montant doit être supérieur à 0')
    .required('Montant total requis'),
  commission: Yup.number()
    .min(0, 'La commission doit être positive')
    .required('Commission requise'),
  heure: Yup.string()
    .required('Heure requise')
});

const prestataires = [
  { value: 'Uber', label: 'Uber' },
  { value: 'Bolt', label: 'Bolt' },
  { value: 'Heetch', label: 'Heetch' },
  { value: 'G7', label: 'G7' },
  { value: 'Autre', label: 'Autre prestataire' }
];

const initialExternalCourseData = {
  prestataire: '',
  description: '',
  montant_total: '',
  commission: '',
  heure: new Date().toTimeString().slice(0, 5)
};

export function ExternalCourseForm({ onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(externalCourseSchema),
    defaultValues: initialExternalCourseData
  });

  const watchedData = watch();

  // Calcul automatique de la commission (exemple: 20% du montant total)
  const handleMontantChange = (e) => {
    const montant = parseFloat(e.target.value) || 0;
    const commission = montant * 0.2; // 20% de commission par défaut
    setValue('commission', commission.toFixed(2));
  };

  const handleFormSubmit = (data) => {
    const externalCourseData = {
      ...data,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    onSubmit(externalCourseData);
    toast.success("Course externe ajoutée avec succès!");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Controller
        name="prestataire"
        control={control}
        render={({ field }) => (
          <Listbox
            data={prestataires}
            value={prestataires.find(p => p.value === field.value) || null}
            onChange={(val) => field.onChange(val?.value)}
            label="Prestataire"
            placeholder="Sélectionner un prestataire"
            displayField="label"
            error={errors?.prestataire?.message}
          />
        )}
      />

      <Textarea
        label="Description de la course"
        {...register("description")}
        error={errors?.description?.message}
        placeholder="Ex: Course pour client régulier via Uber..."
        rows={2}
      />

      <Input
        label="Heure"
        type="time"
        {...register("heure")}
        error={errors?.heure?.message}
      />

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">
          💰 Détails financiers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Montant total de la course (€)"
            type="number"
            step="0.01"
            min="0"
            {...register("montant_total", {
              onChange: handleMontantChange
            })}
            error={errors?.montant_total?.message}
            placeholder="0.00"
          />
          <Input
            label="Votre commission (€)"
            type="number"
            step="0.01"
            min="0"
            {...register("commission")}
            error={errors?.commission?.message}
            placeholder="0.00"
          />
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Commission suggérée: {watchedData.montant_total ? (parseFloat(watchedData.montant_total) * 0.2).toFixed(2) : '0.00'} € (20%)
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outlined" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit">
          Ajouter la course externe
        </Button>
      </div>
    </form>
  );
}

ExternalCourseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
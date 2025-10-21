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

const expenseSchema = Yup.object().shape({
  categorie: Yup.string()
    .required('Catégorie requise'),
  montant: Yup.number()
    .min(0.01, 'Le montant doit être supérieur à 0')
    .required('Montant requis'),
  description: Yup.string()
    .when('categorie', {
      is: 'Carburant',
      then: (schema) => schema, // Optionnel pour les dépenses d'essence
      otherwise: (schema) => schema.required('Description requise')
    }),
  heure: Yup.string()
    .required('Heure requise')
});

const expenseCategories = [
  { value: 'Carburant', label: 'Carburant' },
  { value: 'Péage', label: 'Péage' },
  { value: 'Parking', label: 'Parking' },
  { value: 'Entretien', label: 'Entretien véhicule' },
  { value: 'Lavage', label: 'Lavage véhicule' },
  { value: 'Repas', label: 'Repas' },
  { value: 'Autre', label: 'Autre' }
];

const initialExpenseData = {
  categorie: '',
  montant: '',
  description: '',
  heure: new Date().toTimeString().slice(0, 5)
};

export function ExpenseForm({ onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(expenseSchema),
    defaultValues: initialExpenseData
  });

  const handleFormSubmit = (data) => {
    const expenseData = {
      ...data,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    
    onSubmit(expenseData);
    toast.success("Dépense ajoutée avec succès!");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Controller
        name="categorie"
        control={control}
        render={({ field }) => (
          <Listbox
            data={expenseCategories}
            value={expenseCategories.find(c => c.value === field.value) || null}
            onChange={(val) => field.onChange(val?.value)}
            label="Catégorie de dépense"
            placeholder="Sélectionner une catégorie"
            displayField="label"
            error={errors?.categorie?.message}
          />
        )}
      />

      <Input
        label="Montant (€)"
        type="number"
        step="0.01"
        min="0"
        {...register("montant")}
        error={errors?.montant?.message}
        placeholder="0.00"
      />

      <Input
        label="Heure"
        type="time"
        {...register("heure")}
        error={errors?.heure?.message}
      />

      <Textarea
        label="Description"
        {...register("description")}
        error={errors?.description?.message}
        placeholder="Détails de la dépense..."
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outlined" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit">
          Ajouter la dépense
        </Button>
      </div>
    </form>
  );
}

ExpenseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
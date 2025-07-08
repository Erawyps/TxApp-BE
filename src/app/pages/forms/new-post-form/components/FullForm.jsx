import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from '../schema';
import { Button, Card, Input, Select } from "components/ui";
import { toast } from "sonner";
import { DatePicker } from "components/shared/form/Datepicker";

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode, onSubmit }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      header: {
        date: new Date(),
        chauffeur: null,
        vehicule: null
      },
      shift: {
        start: "",
        end: "",
        interruptions: 0
      },
      kilometers: {
        start: 0,
        end: null
      },
      courses: [],
      charges: [],
      totals: {
        recettes: 0,
        charges: 0,
        salaire: 0
      },
      validation: {
        signature: null,
        date_validation: null
      }
    }
  });

  useFieldArray({
    control,
    name: "courses"
  });

  useFieldArray({
    control,
    name: "charges"
  });

  const handleFormSubmit = (data) => {
  try {
    // Calcul des totaux
    const recettes = data.courses.reduce((sum, c) => sum + (Number(c.prix) || 0), 0);
    const charges = data.charges.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);
    
    // Règle de calcul du salaire
    const base = Math.min(recettes, 180);
    const surplus = Math.max(recettes - 180, 0);
    const salaire = (base * 0.4) + (surplus * 0.3);

    setValue('totals', { 
      recettes: Number(recettes.toFixed(2)),
      charges: Number(charges.toFixed(2)),
      salaire: Number(salaire.toFixed(2))
    });

    onSubmit(data);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    toast.error("Une erreur est survenue lors de l'enregistrement");
  }
};

  const handleReset = () => {
    reset();
    toast.info("Formulaire réinitialisé");
  };

  return (
    <div className="full-form-container">
      <div className="form-header">
        <h2>Feuille de Route Complète</h2>
        <Button variant="outline" onClick={onSwitchMode}>
          Mode Conduite
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Section En-tête */}
        <Card>
          <h3>Informations Générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="header.date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Date"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.header?.date?.message}
                />
              )}
            />

            <Controller
              name="header.chauffeur.id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Chauffeur"
                  options={chauffeurs.map(c => ({
                    value: c.id,
                    label: `${c.prenom} ${c.nom} (${c.numero_badge})`
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    const selected = chauffeurs.find(c => c.id === value);
                    field.onChange(value);
                    setValue('header.chauffeur', selected);
                  }}
                  error={errors.header?.chauffeur?.id?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="header.vehicule.id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Véhicule"
                  options={vehicules.map(v => ({
                    value: v.id,
                    label: `${v.plaque_immatriculation} - ${v.marque} ${v.modele}`
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    const selected = vehicules.find(v => v.id === value);
                    field.onChange(value);
                    setValue('header.vehicule', selected);
                  }}
                  error={errors.header?.vehicule?.id?.message}
                />
              )}
            />

            <Input
              label="Interruptions (minutes)"
              type="number"
              {...register("shift.interruptions", { valueAsNumber: true })}
              error={errors.shift?.interruptions?.message}
            />
          </div>
        </Card>

        {/* Autres sections (Shift, Kilométrage, Courses, Charges, Validation) */}
        {/* ... (similaire à ce que vous avez déjà) ... */}
        
        {/* Actions */}
        <div className="form-actions">
          <Button type="button" variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button type="submit" color="primary">
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
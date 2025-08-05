// Import Dependencies
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, Textarea } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { courseSchema } from "../schema";
import { paymentMethods, contractTypes } from "../data";

// ----------------------------------------------------------------------

export function CourseForm({ 
  editingCourse, 
  coursesCount, 
  onSubmit, 
  onCancel 
}) {
  const initialData = editingCourse || {
    numero_ordre: coursesCount + 1,
    index_depart: '',
    index_embarquement: '',
    lieu_embarquement: '',
    heure_embarquement: '',
    index_debarquement: '',
    lieu_debarquement: '',
    heure_debarquement: '',
    prix_taximetre: '',
    sommes_percues: '',
    mode_paiement: 'CASH',
    client: '',
    remuneration_chauffeur: 'Indépendant',
    notes: ''
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: initialData
  });

  const watchedData = watch();
  const requiresClient = watchedData.mode_paiement && watchedData.mode_paiement.startsWith('F-');

  const handleFormSubmit = (data) => {
    const courseData = {
      ...data,
      id: editingCourse?.id || Date.now(),
      status: 'completed'
    };
    
    onSubmit(courseData);
    toast.success(editingCourse ? "Course modifiée avec succès!" : "Course ajoutée avec succès!");
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="N° Ordre"
        value={initialData.numero_ordre.toString().padStart(3, '0')}
        disabled
        className="bg-gray-100 dark:bg-dark-600"
      />

      {/* Embarquement Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-blue-800 dark:text-blue-200">
          📍 Embarquement
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Index de départ (facultatif)"
            type="number"
            min="0"
            step="1"
            {...register("index_depart")}
            error={errors?.index_depart?.message}
          />
          <Input
            label="Index embarquement"
            type="number"
            min="0"
            step="1"
            {...register("index_embarquement")}
            error={errors?.index_embarquement?.message}
          />
          <Input
            label="Lieu embarquement"
            {...register("lieu_embarquement")}
            error={errors?.lieu_embarquement?.message}
            placeholder="ex: Place Eugène Flagey"
          />
          <Input
            label="Heure embarquement"
            type="time"
            {...register("heure_embarquement")}
            error={errors?.heure_embarquement?.message}
          />
        </div>
      </div>

      {/* Débarquement Section */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-green-800 dark:text-green-200">
          🏁 Débarquement
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Index débarquement"
            type="number"
            min="0"
            step="1"
            {...register("index_debarquement")}
            error={errors?.index_debarquement?.message}
          />
          <Input
            label="Lieu débarquement"
            {...register("lieu_debarquement")}
            error={errors?.lieu_debarquement?.message}
            placeholder="ex: Gare Centrale"
          />
          <Input
            label="Heure débarquement"
            type="time"
            {...register("heure_debarquement")}
            error={errors?.heure_debarquement?.message}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Tarification Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h4 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">
          💰 Tarification
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prix taximètre (€)"
            type="number"
            step="0.01"
            min="0"
            {...register("prix_taximetre")}
            error={errors?.prix_taximetre?.message}
          />
          <Input
            label="Sommes perçues (€)"
            type="number"
            step="0.01"
            min="0"
            {...register("sommes_percues")}
            error={errors?.sommes_percues?.message}
          />
          <Controller
            name="mode_paiement"
            control={control}
            render={({ field }) => (
              <Listbox
                data={paymentMethods}
                value={paymentMethods.find(p => p.value === field.value) || paymentMethods[0]}
                onChange={(val) => field.onChange(val.value)}
                label="Mode de paiement"
                displayField="label"
                error={errors?.mode_paiement?.message}
              />
            )}
          />
          {requiresClient && (
            <Input
              label="Client (requis pour facture)"
              {...register("client")}
              error={errors?.client?.message}
              placeholder="Nom du client à facturer"
            />
          )}
          <Controller
            name="remuneration_chauffeur"
            control={control}
            render={({ field }) => (
              <Listbox
                data={contractTypes}
                value={contractTypes.find(c => c.value === field.value) || contractTypes[0]}
                onChange={(val) => field.onChange(val.value)}
                label="Rémunération chauffeur"
                displayField="label"
                error={errors?.remuneration_chauffeur?.message}
                className={requiresClient ? "" : "md:col-span-2"}
              />
            )}
          />
        </div>
      </div>

      {/* Notes */}
      <Textarea
        label="Notes"
        {...register("notes")}
        error={errors?.notes?.message}
        placeholder="Notes optionnelles sur la course..."
        rows={2}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outlined" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit">
          {editingCourse ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}

CourseForm.propTypes = {
  editingCourse: PropTypes.object,
  coursesCount: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
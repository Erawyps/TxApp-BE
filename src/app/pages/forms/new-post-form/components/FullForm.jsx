import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schema } from '../schema';
import { Button, Card, Input, Select } from "components/ui";
import { toast } from "sonner";

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode, onSubmit }) {
  const { 
    register, 
    handleSubmit, 
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      header: {
        date: new Date(),
        chauffeur: { id: "CH001" },
        vehicule: { id: "VH001" }
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
      charges: []
    }
  });

  useFieldArray({ control, name: "courses" });
  useFieldArray({ control, name: "charges" });

  const handleFormSubmit = (data) => {
    try {
      onSubmit(data);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Feuille de Route Complète</h2>
        <Button variant="outline" onClick={onSwitchMode}>
          Mode Conduite
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium">Informations Générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-1">Date</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                {...register("header.date")}
              />
            </div>
            
            <Controller
              name="header.chauffeur.id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  label="Chauffeur"
                  options={chauffeurs.map(c => ({
                    value: c.id,
                    label: `${c.prenom} ${c.nom}`
                  }))}
                  error={error?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="header.vehicule.id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Select
                  {...field}
                  label="Véhicule"
                  options={vehicules.map(v => ({
                    value: v.id,
                    label: `${v.plaque_immatriculation}`
                  }))}
                  error={error?.message}
                />
              )}
            />

            <Input
              label="Interruptions (minutes)"
              type="number"
              {...register("shift.interruptions")}
            />
          </div>
        </Card>

        <div className="flex space-x-2">
          <Button type="button" variant="outline" onClick={() => reset()}>
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
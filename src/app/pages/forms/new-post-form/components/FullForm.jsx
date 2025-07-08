import { useFieldArray, Controller } from 'react-hook-form';
import { Button, Card, Input } from "components/ui";
import { toast } from "sonner";

export function FullForm({ chauffeurs, vehicules, control, onSwitchMode, onSubmit }) {
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

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium">Informations Générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="header.date"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </div>
              )}
            />
            
            <Controller
              name="header.chauffeur.id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <label className="block mb-1">Chauffeur</label>
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {chauffeurs.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom}
                      </option>
                    ))}
                  </select>
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="header.vehicule.id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <label className="block mb-1">Véhicule</label>
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    {vehicules.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plaque_immatriculation} - {v.marque} {v.modele}
                      </option>
                    ))}
                  </select>
                  {error && <span className="text-red-500 text-sm">{error.message}</span>}
                </div>
              )}
            />

            <Controller
              name="shift.interruptions"
              control={control}
              render={({ field }) => (
                <Input
                  label="Interruptions (minutes)"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium">Shift</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="shift.start"
              control={control}
              render={({ field }) => (
                <Input
                  label="Heure de début"
                  type="time"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            
            <Controller
              name="shift.end"
              control={control}
              render={({ field }) => (
                <Input
                  label="Heure de fin"
                  type="time"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Controller
              name="kilometers.start"
              control={control}
              render={({ field }) => (
                <Input
                  label="Kilométrage début"
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            
            <Controller
              name="kilometers.end"
              control={control}
              render={({ field }) => (
                <Input
                  label="Kilométrage fin"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
          </div>
        </Card>

        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => control.reset()}
          >
            Réinitialiser
          </Button>
          <Button 
            type="button" 
            color="primary"
            onClick={() => handleFormSubmit(control.getValues())}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
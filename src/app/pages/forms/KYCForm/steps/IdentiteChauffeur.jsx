import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Button, Input, Textarea } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { chauffeurSchema } from "../schema";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const reglesSalaire = [
  { label: "Contrat fixe", value: "fixe" },
  { label: "40% sur tout", value: "40percent" },
  { label: "30% sur tout", value: "30percent" },
  { label: "40% jusqu'à 180€ puis 30%", value: "mixte" },
  { label: "Heure 10€", value: "heure10" },
  { label: "Heure 12€", value: "heure12" },
];

export function IdentiteChauffeur({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(chauffeurSchema),
    defaultValues: {
      ...feuilleRouteCtx.state.formData.chauffeur,
      date: format(new Date(), 'yyyy-MM-dd')
    },
  });

  const regleSelectionnee = watch("regleSalaire");
  const heureDebut = watch("heureDebut");
  const heureFin = watch("heureFin");
  const interruptions = watch("interruptions");

  const calculerTotalHeures = () => {
    if (!heureDebut || !heureFin) return "--:--";
    
    try {
      const debut = parseISO(`2000-01-01T${heureDebut}`);
      const fin = parseISO(`2000-01-01T${heureFin}`);
      let diff = fin - debut;
      
      if (interruptions) {
        const [hours, mins] = interruptions.split(':').map(Number);
        diff -= (hours * 60 * 60 * 1000) + (mins * 60 * 1000);
      }
      
      if (diff <= 0) return "00:00";
      
      return format(new Date(diff), 'HH:mm', { locale: fr });
    } catch {
      return "--:--";
    }
  };

  const onSubmit = async (data) => {
    try {
      await chauffeurSchema.validate(data, { abortEarly: false });
      
      feuilleRouteCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { chauffeur: data },
      });
      
      feuilleRouteCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { identiteChauffeur: { isDone: true } },
      });
      
      setCurrentStep(1);
    } catch (err) {
      console.error('Erreurs de validation:', err.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("nom")}
            label="Nom"
            error={errors?.nom?.message}
            placeholder="Entrez le nom"
          />
          <Input
            {...register("prenom")}
            label="Prénom"
            error={errors?.prenom?.message}
            placeholder="Entrez le prénom"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            {...register("date")}
            label="Date"
            type="date"
            error={errors?.date?.message}
          />
          <Input
            {...register("heureDebut")}
            label="Heure début"
            type="time"
            error={errors?.heureDebut?.message}
            onChange={(e) => {
              setValue("heureDebut", e.target.value);
            }}
          />
          <Input
            {...register("heureFin")}
            label="Heure fin"
            type="time"
            error={errors?.heureFin?.message}
            onChange={(e) => {
              setValue("heureFin", e.target.value);
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            {...register("interruptions")}
            label="Interruptions"
            type="time"
            placeholder="HH:MM"
            error={errors?.interruptions?.message}
            onChange={(e) => {
              setValue("interruptions", e.target.value);
            }}
          />
          <div className="flex items-end">
            <Input
              label="Total heures"
              value={calculerTotalHeures()}
              readOnly
              className="bg-gray-100 dark:bg-dark-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            render={({ field }) => (
              <Listbox
                data={reglesSalaire}
                value={
                  reglesSalaire.find((r) => r.value === field.value) || null
                }
                onChange={(val) => field.onChange(val.value)}
                name={field.name}
                label="Règle de rémunération"
                placeholder="Sélectionnez une règle"
                displayField="label"
                error={errors?.regleSalaire?.message}
              />
            )}
            control={control}
            name="regleSalaire"
          />

          {["fixe", "heure10", "heure12"].includes(regleSelectionnee) && (
            <Input
              {...register("tauxSalaire", { 
                setValueAs: v => v ? parseFloat(v.toString().replace(',', '.')) : v 
              })}
              label="Taux de salaire"
              error={errors?.tauxSalaire?.message}
              placeholder="Ex: 12.50"
              type="text"
              inputMode="decimal"
            />
          )}
        </div>

        <Textarea
          {...register("note")}
          label="Note supplémentaire"
          placeholder="Ajoutez une note si nécessaire"
        />
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button className="min-w-[7rem]">Annuler</Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Suivant
        </Button>
      </div>
    </form>
  );
}
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Button, Input, Textarea } from "components/ui";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { chauffeurSchema } from "../schema";
import { Listbox } from "components/shared/form/Listbox";

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
  } = useForm({
    resolver: yupResolver(chauffeurSchema),
    defaultValues: feuilleRouteCtx.state.formData.chauffeur,
  });

  const regleSelectionnee = watch("regleSalaire");

  const onSubmit = async (data) => {
  try {
    // Validez manuellement pour voir les erreurs
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
              {...register("tauxSalaire", { valueAsNumber: true })}
              label="Taux de salaire"
              error={errors?.tauxSalaire?.message}
              placeholder="Entrez le taux"
              type="number"
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

IdentiteChauffeur.propTypes = {
  setCurrentStep: PropTypes.func,
};
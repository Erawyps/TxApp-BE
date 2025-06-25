import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Input } from "components/ui";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { vehiculeSchema } from "../schema";


export function InfoVehicule({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(vehiculeSchema),
    defaultValues: feuilleRouteCtx.state.formData.vehicule,
  });

  const handleKmFinChange = (e) => {
    const value = e.target.value;
    setValue("kmFin", value, { shouldValidate: true });
    trigger(["kmDebut"]);
  };

  const onSubmit = (data) => {
    feuilleRouteCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { vehicule: { ...data } },
    });
    feuilleRouteCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { infoVehicule: { isDone: true } },
    });
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("plaqueImmatriculation")}
            label="Plaque d'immatriculation"
            error={errors?.plaqueImmatriculation?.message}
            placeholder="Saisissez la plaque d'immatriculation (Ex: TX-123-AB)"
          />
          <Input
            {...register("numeroIdentification")}
            label="Numéro d'identification"
            error={errors?.numeroIdentification?.message}
            placeholder="Ex: 10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("kmDebut", { 
              valueAsNumber: true,
              onChange: () => trigger("kmFin")
            })}
            label="Index km début"
            error={errors?.kmDebut?.message}
            placeholder="Ex: 188132"
            type="number"
            min="0"
          />
          <Input
            {...register("kmFin", { 
              valueAsNumber: true,
              onChange: handleKmFinChange
            })}
            label="Index km fin"
            error={errors?.kmFin?.message}
            placeholder="Ex: 188500"
            type="number"
            min="0"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(0)}
          type="button"
        >
          Retour
        </Button>
        <Button 
          type="submit" 
          className="min-w-[7rem]" 
          color="primary"
        >
          Suivant
        </Button>
      </div>
    </form>
  );
}
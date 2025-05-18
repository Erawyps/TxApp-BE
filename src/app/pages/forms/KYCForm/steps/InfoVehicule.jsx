import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Button, Input } from "components/ui";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { vehiculeSchema } from "../schema";

export function InfoVehicule({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(vehiculeSchema),
    defaultValues: feuilleRouteCtx.state.formData.vehicule,
  });

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
  {...register("plaqueImmatriculation", {
    setValueAs: value => value ? value.toUpperCase().replace(/\s/g, '') : value
  })}
  label="Plaque d'immatriculation"
  error={errors?.plaqueImmatriculation?.message}
  placeholder="Ex: TX-123-ABC"
  onChange={(e) => {
    // Formatage automatique
    let value = e.target.value.toUpperCase();
    // Ajoute automatiquement les tirets
    if (value.length === 3 && !value.includes('-')) {
      value = value + '-';
    }
    if (value.length === 7 && value[6] !== '-') {
      value = value.slice(0,6) + '-' + value[6];
    }
    e.target.value = value;
  }}
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
            {...register("kmDebut", { valueAsNumber: true })}
            label="Index kilométrique début"
            error={errors?.kmDebut?.message}
            placeholder="Ex: 188132"
            type="number"
          />
          <Input
            {...register("kmFin", { valueAsNumber: true })}
            label="Index kilométrique fin"
            error={errors?.kmFin?.message}
            placeholder="Ex: 188500"
            type="number"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("priseEnChargeDebut", { valueAsNumber: true })}
            label="Prise en charge début"
            error={errors?.priseEnChargeDebut?.message}
            placeholder="Ex: 2984"
            type="number"
          />
          <Input
            {...register("priseEnChargeFin", { valueAsNumber: true })}
            label="Prise en charge fin"
            error={errors?.priseEnChargeFin?.message}
            placeholder="Ex: 3100"
            type="number"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(0)}
        >
          Retour
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Suivant
        </Button>
      </div>
    </form>
  );
}

InfoVehicule.propTypes = {
  setCurrentStep: PropTypes.func,
};
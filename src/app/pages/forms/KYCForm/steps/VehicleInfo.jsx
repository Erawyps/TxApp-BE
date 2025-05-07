import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Button, Input, Textarea, Card } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { vehicleInfoSchema } from "../schema";
import { DatePicker } from "components/shared/form/Datepicker";
import { TrashIcon } from "@heroicons/react/24/outline";

const CHARGE_TYPES = [
  { value: "carburant", label: "Carburant" },
  { value: "peage", label: "Péage" },
  { value: "entretien", label: "Entretien" },
  { value: "divers", label: "Divers" }
];

export function VehicleInfo({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(vehicleInfoSchema),
    defaultValues: kycFormCtx.state.formData.vehicleInfo,
    mode: 'onChange'
  });

  const { fields: chargeFields, append, remove } = useFieldArray({
    control,
    name: "charges"
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { vehicleInfo: data }
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { vehicleInfo: { isDone: true } }
    });
    setCurrentStep(1);
  };

  const addCharge = () => append({ type: "", description: "", montant: "" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section Véhicule */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Informations Véhicule</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            {...register("vehicle.plaqueImmatriculation")}
            label="Plaque d'immatriculation"
            placeholder="AB-123-CD"
            error={errors?.vehicle?.plaqueImmatriculation?.message}
          />
          <Input
            {...register("vehicle.numeroIdentification")}
            label="Numéro d'identification"
            error={errors?.vehicle?.numeroIdentification?.message}
          />
        </div>
      </Card>

      {/* Section Service */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Période de Service</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            name="service.date"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Date"
                error={errors?.service?.date?.message}
              />
            )}
          />
          <Input
            {...register("service.heureDebut")}
            label="Heure début"
            type="time"
            error={errors?.service?.heureDebut?.message}
          />
          <Input
            {...register("service.heureFin")}
            label="Heure fin"
            type="time"
            error={errors?.service?.heureFin?.message}
          />
        </div>
        <div className="mt-4">
          <Input
            {...register("service.interruptions")}
            label="Interruptions (minutes)"
            error={errors?.service?.interruptions?.message}
          />
        </div>
      </Card>

      {/* Section Taximètre */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Taximètre</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            {...register("taximetre.priseEnChargeDebut", { valueAsNumber: true })}
            label="Prise en charge début"
            type="number"
            step="0.01"
            error={errors?.taximetre?.priseEnChargeDebut?.message}
          />
          <Input
            {...register("taximetre.indexKmDebut", { valueAsNumber: true })}
            label="Index km début"
            type="number"
            error={errors?.taximetre?.indexKmDebut?.message}
          />
          <Input
            {...register("taximetre.priseEnChargeFin", { valueAsNumber: true })}
            label="Prise en charge fin"
            type="number"
            step="0.01"
            error={errors?.taximetre?.priseEnChargeFin?.message}
          />
          <Input
            {...register("taximetre.indexKmFin", { valueAsNumber: true })}
            label="Index km fin"
            type="number"
            error={errors?.taximetre?.indexKmFin?.message}
          />
        </div>
      </Card>

      {/* Section Charges */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Charges</h3>
          <span className="text-sm text-gray-500">
            {chargeFields.length} charge(s)
          </span>
        </div>

        <div className="space-y-4">
          {chargeFields.map((field, index) => (
            <Card key={field.id} className="p-4 relative group">
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>

              <div className="grid gap-4 md:grid-cols-2">
  <div>
    <label className="block text-sm font-medium mb-1">
      Type de charge
    </label>
    <select
      {...register(`charges.${index}.type`)}
      className="w-full border border-gray-300 rounded-md p-2"
    >
      <option value="">Sélectionnez un type</option>
      {CHARGE_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
    {errors?.charges?.[index]?.type && (
      <p className="mt-1 text-sm text-red-500">
        {errors.charges[index].type.message}
      </p>
    )}
  </div>

  <Input
    {...register(`charges.${index}.montant`, { valueAsNumber: true })}
    label="Montant (€)"
    type="number"
    step="0.01"
    error={errors?.charges?.[index]?.montant?.message}
  />
</div>

              <div className="mt-4">
                <Input
                  {...register(`charges.${index}.description`)}
                  label="Description"
                  error={errors?.charges?.[index]?.description?.message}
                />
              </div>
            </Card>
          ))}

          <Button
            type="button"
            variant="outlined"
            className="w-full mt-2"
            onClick={addCharge}
          >
            + Ajouter une charge
          </Button>
        </div>
      </Card>

      {/* Notes supplémentaires */}
      <Card className="p-4">
        <Textarea
          {...register("notes")}
          label="Notes supplémentaires"
          rows={3}
        />
      </Card>

      {/* Boutons de navigation */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          color="primary"
          disabled={!isValid}
        >
          Suivant
        </Button>
      </div>
    </form>
  );
}
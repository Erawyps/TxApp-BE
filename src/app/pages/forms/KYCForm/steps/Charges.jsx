import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PropTypes from "prop-types";
import { Button, Input, Textarea } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { chargeSchema } from "../schema";

const typesCharge = [
  { label: "Carburant", value: "carburant" },
  { label: "Péage", value: "peage" },
  { label: "Entretien", value: "entretien" },
  { label: "Divers", value: "divers" },
];

const modesPaiement = [
  { label: "Cash", value: "cash" },
  { label: "Bancontact", value: "bancontact" },
  { label: "Virement", value: "virement" },
];

export function Charges({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [charges, setCharges] = useState(feuilleRouteCtx.state.formData.charges);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: yupResolver(chargeSchema),
  });

  const onSubmit = (data) => {
    const newCharge = { ...data, id: Date.now() };
    setCharges([...charges, newCharge]);
    feuilleRouteCtx.dispatch({ type: "ADD_CHARGE", payload: newCharge });
    reset();
  };

  const onNext = () => {
    feuilleRouteCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { charges: { isDone: true } },
    });
    setCurrentStep(4);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              render={({ field }) => (
                <Listbox
                  data={typesCharge}
                  value={
                    typesCharge.find((t) => t.value === field.value) || null
                  }
                  onChange={(val) => field.onChange(val.value)}
                  name={field.name}
                  label="Type de charge"
                  placeholder="Sélectionnez un type"
                  displayField="label"
                  error={errors?.type?.message}
                />
              )}
              control={control}
              name="type"
            />

            <Input
              {...register("montant", { valueAsNumber: true })}
              label="Montant"
              error={errors?.montant?.message}
              placeholder="Ex: 15.00"
              type="number"
              step="0.01"
            />
          </div>

          <div>
            <Controller
              render={({ field }) => (
                <Listbox
                  data={modesPaiement}
                  value={
                    modesPaiement.find((m) => m.value === field.value) || null
                  }
                  onChange={(val) => field.onChange(val.value)}
                  name={field.name}
                  label="Mode de paiement"
                  placeholder="Sélectionnez un mode"
                  displayField="label"
                  error={errors?.modePaiement?.message}
                />
              )}
              control={control}
              name="modePaiement"
            />
          </div>

          <Textarea
            {...register("description")}
            label="Description"
            error={errors?.description?.message}
            placeholder="Décrivez la charge"
          />

          <Button type="submit" color="primary" className="w-full">
            Ajouter cette charge
          </Button>
        </div>
      </form>

      {/* Liste des charges existantes */}
      {charges.length > 0 && (
        <div className="mt-8">
          <h6 className="mb-4 text-lg font-medium">Charges enregistrées</h6>
          <div className="space-y-4">
            {charges.map((charge) => (
              <div
                key={charge.id}
                className="rounded-lg border p-4 dark:border-dark-500"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">Type:</p>
                    <p>
                      {typesCharge.find((t) => t.value === charge.type)?.label ||
                        "Inconnu"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Montant:</p>
                    <p>{charge.montant} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Paiement:</p>
                    <p>
                      {modesPaiement.find((m) => m.value === charge.modePaiement)
                        ?.label || "Inconnu"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Description:</p>
                    <p className="truncate">{charge.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(2)}
        >
          Retour
        </Button>
        <Button
          className="min-w-[7rem]"
          color="primary"
          onClick={onNext}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

Charges.propTypes = {
  setCurrentStep: PropTypes.func,
};
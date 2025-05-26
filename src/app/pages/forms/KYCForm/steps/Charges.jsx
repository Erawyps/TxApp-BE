import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
    setValue,
  } = useForm({
    resolver: yupResolver(chargeSchema),
    defaultValues: {
      type: "divers",
      modePaiement: "cash"
    }
  });

  const parseNumber = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const num = parseFloat(value.toString().replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const onSubmit = (data) => {
    const newCharge = { 
      ...data,
      id: Date.now(),
      montant: parseNumber(data.montant)
    };
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
              name="type"
              control={control}
              render={({ field }) => (
                <Listbox
                  data={typesCharge}
                  value={typesCharge.find(t => t.value === field.value) || typesCharge[3]}
                  onChange={(val) => field.onChange(val.value)}
                  label="Type de charge"
                  displayField="label"
                />
              )}
            />

            <Input
              {...register("montant")}
              label="Montant"
              error={errors?.montant?.message}
              placeholder="Ex: 15,00"
              inputMode="decimal"
              onChange={(e) => {
                // Permet les nombres avec virgule ou point
                const value = e.target.value.replace(/[^0-9,.]/g, '');
                setValue("montant", value, { shouldValidate: true });
              }}
            />
          </div>

          <Controller
            name="modePaiement"
            control={control}
            render={({ field }) => (
              <Listbox
                data={modesPaiement}
                value={modesPaiement.find(m => m.value === field.value) || modesPaiement[0]}
                onChange={(val) => field.onChange(val.value)}
                label="Mode de paiement"
                displayField="label"
              />
            )}
          />

          <Textarea
            {...register("description")}
            label="Description"
            placeholder="Décrivez la charge (facultatif)"
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-500">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-4 py-2 text-left">N°</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Montant</th>
                  <th className="px-4 py-2 text-left">Mode paiement</th>
                  <th className="px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                {charges.map((charge, index) => (
                  <tr key={charge.id}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">
                      {typesCharge.find((t) => t.value === charge.type)?.label}
                    </td>
                    <td className="px-4 py-2">
                      {parseNumber(charge.montant).toFixed(2).replace('.', ',')} €
                    </td>
                    <td className="px-4 py-2">
                      {modesPaiement.find((m) => m.value === charge.modePaiement)?.label}
                    </td>
                    <td className="px-4 py-2">{charge.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
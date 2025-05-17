import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useFieldArray } from "react-hook-form";
import { Button, Input, Card } from "components/ui";
import { chargesSchema } from "../schema";
import { useKYCFormContext } from "../KYCFormContext";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PAYMENT_MODES } from "../constants/paymentModes";

const CHARGE_TYPES = [
  { value: "carburant", label: "Carburant" },
  { value: "peage", label: "Péage" },
  { value: "entretien", label: "Entretien" },
  { value: "carwash", label: "Carwash" },
  { value: "divers", label: "Divers" }
];

export function ChargesList({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(chargesSchema),
    defaultValues: kycFormCtx.state.etape4
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges"
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: 'SET_ETAPE4_DATA',
      payload: data
    });
    setCurrentStep(4);
  };

  const addCharge = () => {
    append({
      type: "",
      description: "",
      montant: "",
      modePaiement: "cash"
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4 relative group">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <TrashIcon className="h-5 w-5" />
            </button>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">Type de charge</label>
                <select
                  {...register(`charges.${index}.type`)}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Sélectionnez un type</option>
                  {CHARGE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.charges?.[index]?.type && (
                  <p className="mt-1 text-sm text-red-500">{errors.charges[index].type.message}</p>
                )}
              </div>

              <Input
                {...register(`charges.${index}.montant`, { valueAsNumber: true })}
                label="Montant (€)"
                type="number"
                step="0.01"
                error={errors.charges?.[index]?.montant?.message}
              />
            </div>

            <div className="mt-4">
              <Input
                {...register(`charges.${index}.description`)}
                label="Description"
                error={errors.charges?.[index]?.description?.message}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Mode de paiement</label>
              <select
                {...register(`charges.${index}.modePaiement`)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                {PAYMENT_MODES.filter(m => ['cash', 'bancontact', 'virement'].includes(m.value))
                  .map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
              </select>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" onClick={addCharge}>
          Ajouter une charge
        </Button>
        <div className="space-x-3">
          <Button type="button" onClick={() => setCurrentStep(2)}>
            Retour
          </Button>
          <Button type="submit" color="primary">
            Suivant
          </Button>
        </div>
      </div>
    </form>
  );
}
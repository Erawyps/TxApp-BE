import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Textarea } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { chargeSchema } from "../schema";

const typesCharge = [
  { label: "Carburant", value: "carburant" },
  { label: "Péage", value: "peage" },
  { label: "Entretien", value: "entretien" },
  { label: "Carwash", value: "carwash" },
  { label: "Divers", value: "divers" },
];

const modesPaiement = [
  { label: "Cash", value: "cash" },
  { label: "Bancontact", value: "bancontact" },
];

export function Charges({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [charges, setCharges] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCharges(feuilleRouteCtx.state.formData.charges || []);
  }, [feuilleRouteCtx.state.formData.charges]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: yupResolver(chargeSchema),
    defaultValues: {
      type: "divers",
      modePaiement: "cash",
      montant: "",
      description: ""
    }
  });

  const parseNumber = (value) => {
    if (!value) return 0;
    const num = parseFloat(value.toString().replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const newCharge = { 
        ...data,
        id: Date.now(),
        type_charge: data.type,
        montant: parseNumber(data.montant),
        date: new Date().toISOString().split('T')[0]
      };
      
      feuilleRouteCtx.dispatch({ 
        type: "ADD_CHARGE", 
        payload: newCharge 
      });
      
      reset();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la charge:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onNext = async () => {
    try {
      setIsSubmitting(true);
      
      if (charges.length === 0) {
        throw new Error("Au moins une charge est requise");
      }

      const chargesValid = charges.every(charge => {
        try {
          chargeSchema.validateSync({
            type: charge.type_charge,
            montant: charge.montant,
            modePaiement: charge.modePaiement
          });
          return true;
        } catch {
          return false;
        }
      });

      if (!chargesValid) {
        throw new Error("Certaines charges ne sont pas valides");
      }

      feuilleRouteCtx.dispatch({
        type: "SET_STEP_STATUS",
        payload: { charges: { isDone: true } },
      });

      setCurrentStep(4);
    } catch (error) {
      console.error("Erreur lors de la navigation:", error);
      alert(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCharge = (chargeId) => {
    feuilleRouteCtx.dispatch({
      type: "REMOVE_CHARGE",
      payload: chargeId
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Listbox
                  data={typesCharge}
                  value={typesCharge.find(t => t.value === field.value)}
                  onChange={(val) => field.onChange(val.value)}
                  label="Type de charge"
                  displayField="label"
                />
              )}
            />

            <Input
              {...register("montant")}
              label="Montant (€)"
              error={errors?.montant?.message}
              placeholder="Ex: 15,00"
              inputMode="decimal"
            />
          </div>

          <Controller
            name="modePaiement"
            control={control}
            render={({ field }) => (
              <Listbox
                data={modesPaiement}
                value={modesPaiement.find(m => m.value === field.value)}
                onChange={(val) => field.onChange(val.value)}
                label="Mode de paiement"
                displayField="label"
              />
            )}
          />

          <Textarea
            {...register("description")}
            label="Description (facultatif)"
            placeholder="Détails de la charge"
          />

          <Button 
            type="submit" 
            color="primary" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter cette charge"}
          </Button>
        </div>
      </form>

      {charges.length > 0 && (
        <div className="mt-8">
          <h6 className="mb-4 text-lg font-medium">Charges enregistrées</h6>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-500">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Montant</th>
                  <th className="px-4 py-2 text-left">Paiement</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                {charges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="px-4 py-2">
                      {typesCharge.find(t => t.value === charge.type_charge)?.label}
                    </td>
                    <td className="px-4 py-2">
                      {charge.montant.toFixed(2).replace('.', ',')} €
                    </td>
                    <td className="px-4 py-2">
                      {modesPaiement.find(m => m.value === charge.modePaiement)?.label}
                    </td>
                    <td className="px-4 py-2">{charge.description || '-'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleRemoveCharge(charge.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
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
          disabled={isSubmitting}
        >
          Retour
        </Button>
        <Button
          className="min-w-[7rem]"
          color="primary"
          onClick={onNext}
          disabled={isSubmitting || charges.length === 0}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
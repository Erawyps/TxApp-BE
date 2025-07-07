import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, Card, Input, Select } from "components/ui";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export function ExpensesSection() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges"
  });

  const expenseTypes = [
    { value: "carburant", label: "Carburant" },
    { value: "peage", label: "Péage" },
    { value: "entretien", label: "Entretien" },
    { value: "carwash", label: "Carwash" },
    { value: "divers", label: "Divers" }
  ];

  const paymentMethods = [
    { value: "cash", label: "Cash" },
    { value: "bancontact", label: "Bancontact" }
  ];

  const addNewExpense = () => {
    append({
      type: "divers",
      description: "",
      montant: "",
      mode_paiement: "cash",
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dépenses</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={addNewExpense}
          icon={<PlusIcon className="h-4 w-4" />}
        >
          Ajouter
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Aucune dépense enregistrée
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((item, index) => (
            <Card key={item.id} className="p-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Type de dépense"
                  options={expenseTypes}
                  {...register(`charges.${index}.type`)}
                />
                
                <Input
                  label="Montant (€)"
                  type="number"
                  step="0.01"
                  {...register(`charges.${index}.montant`)}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Mode de paiement"
                  options={paymentMethods}
                  {...register(`charges.${index}.mode_paiement`)}
                />
                
                <Input
                  label="Description"
                  {...register(`charges.${index}.description`)}
                  placeholder="Facultatif"
                />
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {fields.length > 0 && (
        <div className="pt-2">
          <p className="text-right font-medium">
            Total dépenses: {fields.reduce( (sum, item) => sum + (Number(item.montant) || 0), 0).toFixed(2)} €
          </p>
        </div>
      )}
    </div>
  );
}
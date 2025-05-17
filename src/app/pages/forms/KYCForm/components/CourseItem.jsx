import { Input } from "components/ui";

export function CourseItem({ 
  index, 
  course, 
  errors, 
  onChange, 
  onRemove, 
  paymentModes,
}) {
  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="rounded-lg border p-4 mb-4">
      <div className="mb-3 flex justify-between">
        <h4 className="font-medium">Course #{index + 1}</h4>
        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={() => onRemove()}
        >
          Supprimer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Index départ"
          value={course.indexDepart || ''}
          onChange={(e) => handleChange("indexDepart", e.target.value)}
          error={errors?.indexDepart?.message}
          type="number"
        />

        <Input
          label="Lieu embarquement"
          value={course.lieuEmbarquement || ''}
          onChange={(e) => handleChange("lieuEmbarquement", e.target.value)}
          error={errors?.lieuEmbarquement?.message}
        />

        {/* Ajoutez tous les autres champs de la même manière */}
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mode de paiement</label>
          <select
            value={course.modePaiement || 'cash'}
            onChange={(e) => handleChange("modePaiement", e.target.value)}
            className="w-full border rounded p-2"
          >
            {paymentModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
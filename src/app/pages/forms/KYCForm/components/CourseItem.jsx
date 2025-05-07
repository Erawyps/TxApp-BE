import { Input } from "components/ui";

export function CourseItem({ index, course, errors, onChange, onRemove, paymentModes }) {
  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex justify-between">
        <h4 className="font-medium">Course #{index + 1}</h4>
        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={onRemove}
        >
          Supprimer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Index départ"
          value={course.indexDepart}
          onChange={(e) => handleChange("indexDepart", e.target.value)}
          error={errors?.indexDepart?.message}
          type="number"
        />

        <Input
          label="Lieu embarquement"
          value={course.lieuEmbarquement}
          onChange={(e) => handleChange("lieuEmbarquement", e.target.value)}
          error={errors?.lieuEmbarquement?.message}
        />

        <Input
          label="Heure embarquement"
          type="time"
          value={course.heureEmbarquement}
          onChange={(e) => handleChange("heureEmbarquement", e.target.value)}
          error={errors?.heureEmbarquement?.message}
        />

        <Input
          label="Index arrivée"
          type="number"
          value={course.indexArrivee}
          onChange={(e) => handleChange("indexArrivee", e.target.value)}
          error={errors?.indexArrivee?.message}
        />

        <Input
          label="Lieu débarquement"
          value={course.lieuDebarquement}
          onChange={(e) => handleChange("lieuDebarquement", e.target.value)}
          error={errors?.lieuDebarquement?.message}
        />

        <Input
          label="Heure débarquement"
          type="time"
          value={course.heureDebarquement}
          onChange={(e) => handleChange("heureDebarquement", e.target.value)}
          error={errors?.heureDebarquement?.message}
        />

        <Input
          label="Prix taximètre (€)"
          type="number"
          value={course.prixTaximetre}
          onChange={(e) => handleChange("prixTaximetre", e.target.value)}
          error={errors?.prixTaximetre?.message}
        />

        <Input
          label="Somme perçue (€)"
          type="number"
          value={course.sommePercue}
          onChange={(e) => handleChange("sommePercue", e.target.value)}
          error={errors?.sommePercue?.message}
        />

<div className="md:col-span-2 mt-4">
<select
  value={course.modePaiement}
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
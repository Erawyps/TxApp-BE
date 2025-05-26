import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { courseSchema } from "../schema";

const modesPaiement = [
  { label: "Cash", value: "cash" },
  { label: "Bancontact", value: "bancontact" },
  { label: "Facture", value: "facture" },
  { label: "Virement", value: "virement" },
];

export function ListeCourses({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [courses, setCourses] = useState(feuilleRouteCtx.state.formData.courses);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(courseSchema),
  });

  const formatNumberInput = (value) => {
    if (!value) return value;
    return value.toString().replace('.', ',');
  };

  const parseNumberInput = (value) => {
    if (!value) return value;
    return parseFloat(value.toString().replace(',', '.').replace(/\s/g, ''));
  };

  const onSubmit = (data) => {
    const newCourse = { 
      ...data,
      id: Date.now(),
      prixTaximetre: parseNumberInput(data.prixTaximetre),
      sommePercue: parseNumberInput(data.sommePercue)
    };
    setCourses([...courses, newCourse]);
    feuilleRouteCtx.dispatch({ type: "ADD_COURSE", payload: newCourse });
    reset();
  };

  const onNext = () => {
    feuilleRouteCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { listeCourses: { isDone: true } },
    });
    setCurrentStep(3);
  };


  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("indexDepart", { valueAsNumber: true })}
              label="Index départ"
              error={errors?.indexDepart?.message}
              placeholder="Ex: 140"
              type="number"
            />
            <Input
              {...register("indexArrivee", { valueAsNumber: true })}
              label="Index arrivée"
              error={errors?.indexArrivee?.message}
              placeholder="Ex: 147"
              type="number"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("lieuEmbarquement")}
              label="Lieu embarquement"
              error={errors?.lieuEmbarquement?.message}
              placeholder="Ex: Wavre"
            />
            <Input
              {...register("lieuDebarquement")}
              label="Lieu débarquement"
              error={errors?.lieuDebarquement?.message}
              placeholder="Ex: Ceroux-Mousty"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("heureEmbarquement")}
              label="Heure embarquement"
              error={errors?.heureEmbarquement?.message}
              placeholder="Ex: 12:40"
              type="time"
            />
            <Input
              {...register("heureDebarquement")}
              label="Heure débarquement"
              error={errors?.heureDebarquement?.message}
              placeholder="Ex: 12:50"
              type="time"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
          <Input
            {...register("prixTaximetre")}
            label="Prix taximètre"
            error={errors?.prixTaximetre?.message}
            placeholder="Ex: 27,00"
            type="text"  // Utiliser type="text" pour mieux gérer le format
            inputMode="decimal"
            onChange={(e) => {
              // Formatage pour l'affichage
              const formattedValue = formatNumberInput(e.target.value);
              setValue("prixTaximetre", formattedValue, {
                shouldValidate: true
              });
            }}
          />
          <Input
            {...register("sommePercue")}
            label="Somme perçue"
            error={errors?.sommePercue?.message}
            placeholder="Ex: 25,00"
            type="text"  // Utiliser type="text" pour mieux gérer le format
            inputMode="decimal"
            onChange={(e) => {
              // Formatage pour l'affichage
              const formattedValue = formatNumberInput(e.target.value);
              setValue("sommePercue", formattedValue, {
                shouldValidate: true
              });
            }}
          />
        </div>

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

          <Button type="submit" color="primary" className="w-full">
            Ajouter cette course
          </Button>
        </div>
      </form>

      {/* Liste des courses existantes */}
      {courses.length > 0 && (
        <div className="mt-8">
          <h6 className="mb-4 text-lg font-medium">Courses enregistrées</h6>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-500">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-4 py-2 text-left">N°</th>
                  <th className="px-4 py-2 text-left">Index départ</th>
                  <th className="px-4 py-2 text-left">Lieu embarquement</th>
                  <th className="px-4 py-2 text-left">Heure embarquement</th>
                  <th className="px-4 py-2 text-left">Index arrivée</th>
                  <th className="px-4 py-2 text-left">Lieu débarquement</th>
                  <th className="px-4 py-2 text-left">Heure débarquement</th>
                  <th className="px-4 py-2 text-left">Prix taximètre</th>
                  <th className="px-4 py-2 text-left">Somme perçue</th>
                  <th className="px-4 py-2 text-left">Mode paiement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                {courses.map((course, index) => (
                  <tr key={course.id}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{course.indexDepart}</td>
                    <td className="px-4 py-2">{course.lieuEmbarquement || '-'}</td>
                    <td className="px-4 py-2">{course.heureEmbarquement || '-'}</td>
                    <td className="px-4 py-2">{course.indexArrivee}</td>
                    <td className="px-4 py-2">{course.lieuDebarquement || '-'}</td>
                    <td className="px-4 py-2">{course.heureDebarquement || '-'}</td>
                    <td className="px-4 py-2">{course.prixTaximetre?.toFixed(2).replace('.', ',') || '-'} €</td>
                    <td className="px-4 py-2">{course.sommePercue?.toFixed(2).replace('.', ',')} €</td>
                    <td className="px-4 py-2">
                      {modesPaiement.find((m) => m.value === course.modePaiement)?.label}
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
          onClick={() => setCurrentStep(1)}
        >
          Retour
        </Button>
        <Button
          className="min-w-[7rem]"
          color="primary"
          onClick={onNext}
          disabled={courses.length === 0}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
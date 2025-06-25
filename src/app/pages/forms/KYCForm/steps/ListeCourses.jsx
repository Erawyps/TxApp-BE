import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { courseSchema } from "../schema";

const modesPaiement = [
  { label: "Cash", value: "cash" },
  { label: "Bancontact", value: "bancontact" },
  { label: "Facture", value: "facture" },
];

export function ListeCourses({ setCurrentStep }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [courses, setCourses] = useState(feuilleRouteCtx.state.formData.courses);
  const [clients, setClients] = useState([]);

  // Charger les clients depuis l'API (simulé)
  useEffect(() => {
    // En pratique, vous feriez un appel API ici
    setClients([
      { id: 1, nom: "SNCB" },
      { id: 2, nom: "William Lenox" },
      { id: 3, nom: "Ville d'Ottignies" }
    ]);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      modePaiement: "cash",
      client_id: null
    }
  });

  const parseNumberInput = (value) => {
    if (!value) return 0;
    return parseFloat(value.toString().replace(',', '.').replace(/\s/g, ''));
  };

  const onSubmit = (data) => {
    const newCourse = { 
      ...data,
      id: Date.now(),
      prixTaximetre: parseNumberInput(data.prixTaximetre),
      sommePercue: parseNumberInput(data.sommePercue),
      client_id: data.modePaiement === 'facture' ? data.client_id : null,
      numero_ordre: courses.length + 1
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

  const handleRemoveCourse = (courseId) => {
    feuilleRouteCtx.dispatch({
      type: "REMOVE_COURSE",
      payload: courseId
    });
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
              min="0"
            />
            <Input
              {...register("indexArrivee", { valueAsNumber: true })}
              label="Index arrivée"
              error={errors?.indexArrivee?.message}
              placeholder="Ex: 147"
              type="number"
              min="0"
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
              type="time"
            />
            <Input
              {...register("heureDebarquement")}
              label="Heure débarquement"
              error={errors?.heureDebarquement?.message}
              type="time"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("prixTaximetre")}
              label="Prix taximètre"
              error={errors?.prixTaximetre?.message}
              placeholder="Ex: 27,00"
              inputMode="decimal"
            />
            <Input
              {...register("sommePercue")}
              label="Somme perçue"
              error={errors?.sommePercue?.message}
              placeholder="Ex: 25,00"
              inputMode="decimal"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <Controller
              name="client_id"
              control={control}
              render={({ field }) => (
                <Listbox
                  data={clients}
                  value={clients.find(c => c.id === field.value)}
                  onChange={(val) => field.onChange(val?.id)}
                  label="Client (pour facture)"
                  displayField="nom"
                  disabled={watch("modePaiement") !== "facture"}
                />
              )}
            />
          </div>

          <Button type="submit" color="primary" className="w-full">
            Ajouter cette course
          </Button>
        </div>
      </form>

      {courses.length > 0 && (
        <div className="mt-8">
          <h6 className="mb-4 text-lg font-medium">Courses enregistrées</h6>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-500">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-4 py-2 text-left">N°</th>
                  <th className="px-4 py-2 text-left">Départ</th>
                  <th className="px-4 py-2 text-left">Arrivée</th>
                  <th className="px-4 py-2 text-left">Montant</th>
                  <th className="px-4 py-2 text-left">Paiement</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-500">
                {courses.map((course, index) => (
                  <tr key={course.id}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">
                      {course.lieuEmbarquement} ({course.indexDepart})
                    </td>
                    <td className="px-4 py-2">
                      {course.lieuDebarquement} ({course.indexArrivee})
                    </td>
                    <td className="px-4 py-2">
                      {course.sommePercue?.toFixed(2).replace('.', ',')} €
                    </td>
                    <td className="px-4 py-2">
                      {modesPaiement.find(m => m.value === course.modePaiement)?.label}
                      {course.client_id && ` (${clients.find(c => c.id === course.client_id)?.nom})`}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleRemoveCourse(course.id)}
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
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import PropTypes from "prop-types";
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

const reglesSalaire = [
  { label: "Par défaut", value: null },
  { label: "Contrat fixe", value: "fixe" },
  { label: "40% sur tout", value: "40percent" },
  { label: "30% sur tout", value: "30percent" },
  { label: "40% jusqu'à 180€ puis 30%", value: "mixte" },
  { label: "Heure 10€", value: "heure10" },
  { label: "Heure 12€", value: "heure12" },
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
  } = useForm({
    resolver: yupResolver(courseSchema),
  });

  const onSubmit = (data) => {
    const newCourse = { ...data, id: Date.now() };
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
              {...register("prixTaximetre", { valueAsNumber: true })}
              label="Prix taximètre"
              error={errors?.prixTaximetre?.message}
              placeholder="Ex: 27.00"
              type="number"
              step="0.01"
            />
            <Input
              {...register("sommePercue", { valueAsNumber: true })}
              label="Somme perçue"
              error={errors?.sommePercue?.message}
              placeholder="Ex: 25.00"
              type="number"
              step="0.01"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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

            <Controller
              render={({ field }) => (
                <Listbox
                  data={reglesSalaire}
                  value={
                    reglesSalaire.find((r) => r.value === field.value) || null
                  }
                  onChange={(val) => field.onChange(val.value)}
                  name={field.name}
                  label="Règle exceptionnelle"
                  placeholder="Par défaut"
                  displayField="label"
                  error={errors?.regleExceptionnelle?.message}
                />
              )}
              control={control}
              name="regleExceptionnelle"
            />
          </div>

          <Button type="submit" color="primary" className="w-full">
            Ajouter cette course
          </Button>
        </div>
      </form>

      {/* Liste des courses existantes */}
      {courses.length > 0 && (
        <div className="mt-8">
          <h6 className="mb-4 text-lg font-medium">Courses enregistrées</h6>
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border p-4 dark:border-dark-500"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">De:</p>
                    <p>{course.lieuEmbarquement}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">À:</p>
                    <p>{course.lieuDebarquement}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Montant:</p>
                    <p>{course.sommePercue} €</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Paiement:</p>
                    <p>
                      {modesPaiement.find((m) => m.value === course.modePaiement)
                        ?.label || "Inconnu"}
                    </p>
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

ListeCourses.propTypes = {
  setCurrentStep: PropTypes.func,
};
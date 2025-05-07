import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { coursesSchema } from "../schema";
import { CourseItem } from "../components/CourseItem";
import { PAYMENT_MODES } from "../constants/paymentModes"; // Importez les modes de paiement

export function CoursesList({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(coursesSchema),
    defaultValues: {
      ...kycFormCtx.state.formData.coursesList,
      // Définir le mode de paiement par défaut
      courses: kycFormCtx.state.formData.coursesList.courses.map(course => ({
        ...course,
        modePaiement: course.modePaiement || "cash" // Valeur par défaut
      }))
    },
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { coursesList: data },
    });
    kycFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { coursesList: { isDone: true } },
    });
    setCurrentStep(2);
  };

  const handleAddCourse = () => {
    const currentCourses = watch("courses") || [];
    setValue("courses", [
      ...currentCourses,
      {
        indexDepart: "",
        lieuEmbarquement: "",
        heureEmbarquement: "",
        indexArrivee: "",
        lieuDebarquement: "",
        heureDebarquement: "",
        prixTaximetre: "",
        sommePercue: "",
        modePaiement: "cash", // Valeur par défaut
      },
    ]);
  };

  const handleRemoveCourse = (index) => {
    const currentCourses = watch("courses");
    setValue("courses", currentCourses.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index, field, value) => {
    const currentCourses = [...watch("courses")];
    currentCourses[index][field] = value;
    setValue("courses", currentCourses);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {watch("courses")?.map((course, index) => (
          <CourseItem
            key={index}
            index={index}
            course={course}
            errors={errors?.courses?.[index]}
            onChange={handleCourseChange}
            onRemove={() => handleRemoveCourse(index)}
            paymentModes={PAYMENT_MODES} // Passez les modes de paiement au composant CourseItem
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" onClick={handleAddCourse}>
          Ajouter une course
        </Button>

        <div className="space-x-3">
          <Button type="button" onClick={() => setCurrentStep(0)}>
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
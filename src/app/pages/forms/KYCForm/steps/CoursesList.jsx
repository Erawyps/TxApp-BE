import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "components/ui";
import { coursesSchema } from "../schema";
import { useKYCFormContext } from "../KYCFormContext";
import { CourseItem } from "../components/CourseItem";
import { PAYMENT_MODES } from "../constants/paymentModes";
import { REMUNERATION_TYPES } from "../constants/remunerationTypes";

export function CoursesList({ setCurrentStep }) {
  const kycFormCtx = useKYCFormContext();
  const { 
    handleSubmit, 
    control, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm({
    resolver: yupResolver(coursesSchema),
    defaultValues: kycFormCtx.state.etape3
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses"
  });

  const onSubmit = (data) => {
    kycFormCtx.dispatch({
      type: 'SET_ETAPE3_DATA',
      payload: data
    });
    setCurrentStep(3);
  };

  const addCourse = () => {
    append({
      indexDepart: '',
      lieuEmbarquement: '',
      heureEmbarquement: '',
      indexArrivee: '',
      lieuDebarquement: '',
      heureDebarquement: '',
      prixTaximetre: '',
      sommePercue: '',
      modePaiement: 'cash',
      remunerationExceptionnelle: ''
    });
  };

  const handleCourseChange = (index, field, value) => {
    const courses = [...watch('courses')];
    courses[index][field] = value;
    setValue('courses', courses);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <CourseItem
            key={field.id}
            index={index}
            course={watch(`courses.${index}`)}
            errors={errors.courses?.[index]}
            onRemove={() => remove(index)}
            onChange={handleCourseChange}
            paymentModes={PAYMENT_MODES}
            remunerationTypes={REMUNERATION_TYPES}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" onClick={addCourse}>
          Ajouter une course
        </Button>
        <div className="space-x-3">
          <Button type="button" onClick={() => setCurrentStep(1)}>
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
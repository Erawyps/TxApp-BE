// Import Dependencies
import { 
  PlusIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyEuroIcon,
  TrashIcon,
  PencilIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import { useFieldArray } from "react-hook-form";
import { useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input, Card, Button, Textarea, Badge } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";

// ----------------------------------------------------------------------

const paymentOptions = [
  { id: 'CASH', label: 'Espèces (CASH)' },
  { id: 'BC', label: 'Bancontact (BC)' },
  { id: 'VIR', label: 'Virement (VIR)' },
  { id: 'F-SNCB', label: 'Facture SNCB' },
  { id: 'F-WL', label: 'Facture Wallonie' },
  { id: 'F-TX', label: 'Facture Taxi' },
];

const CourseForm = ({ control, register, errors, className = "" }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "courses"
  });

  const [expandedCourse, setExpandedCourse] = useState(null);

  const addCourse = () => {
    const newCourse = {
      numero_ordre: fields.length + 1,
      index_depart: '',
      embarquement: {
        index: '',
        lieu: '',
        heure: ''
      },
      debarquement: {
        index: '',
        lieu: '',
        heure: ''
      },
      prix_taximetre: '',
      sommes_percues: '',
      mode_paiement: 'CASH',
      client: '',
      notes: ''
    };
    append(newCourse);
    setExpandedCourse(fields.length);
  };

  const CourseCard = ({ course, index }) => {
    const isExpanded = expandedCourse === index;
    // Removed unused variable 'isFacture'

    return (
      <Card className="p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="primary" className="text-xs">
              Course #{course.numero_ordre.toString().padStart(3, '0')}
            </Badge>
            {course.embarquement.lieu && course.debarquement.lieu && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {course.embarquement.lieu} → {course.debarquement.lieu}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpandedCourse(isExpanded ? null : index)}
              icon={<PencilIcon className="h-4 w-4" />}
            >
              {isExpanded ? 'Réduire' : 'Modifier'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(index)}
              icon={<TrashIcon className="h-4 w-4" />}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Supprimer
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6">
            {/* Embarquement */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                  Embarquement
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Index départ"
                  type="number"
                  min="0"
                  step="1"
                  {...register(`courses.${index}.index_depart`)}
                  error={errors?.courses?.[index]?.index_depart?.message}
                />
                
                <Input
                  label="Index embarquement"
                  type="number"
                  min="0"
                  step="1"
                  {...register(`courses.${index}.embarquement.index`)}
                  error={errors?.courses?.[index]?.embarquement?.index?.message}
                />
                
                <Input
                  label="Heure"
                  type="time"
                  {...register(`courses.${index}.embarquement.heure`)}
                  error={errors?.courses?.[index]?.embarquement?.heure?.message}
                  icon={<ClockIcon className="h-4 w-4" />}
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="Lieu d'embarquement"
                  placeholder="ex: Place Eugène Flagey"
                  {...register(`courses.${index}.embarquement.lieu`)}
                  error={errors?.courses?.[index]?.embarquement?.lieu?.message}
                  icon={<MapPinIcon className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Débarquement */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-green-800 dark:text-green-200">
                  Débarquement
                </h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Index débarquement"
                  type="number"
                  min="0"
                  step="1"
                  {...register(`courses.${index}.debarquement.index`)}
                  error={errors?.courses?.[index]?.debarquement?.index?.message}
                />
                
                <Input
                  label="Heure"
                  type="time"
                  {...register(`courses.${index}.debarquement.heure`)}
                  error={errors?.courses?.[index]?.debarquement?.heure?.message}
                  icon={<ClockIcon className="h-4 w-4" />}
                />
              </div>
              
              <div className="mt-4">
                <Input
                  label="Lieu de débarquement"
                  placeholder="ex: Gare Centrale"
                  {...register(`courses.${index}.debarquement.lieu`)}
                  error={errors?.courses?.[index]?.debarquement?.lieu?.message}
                  icon={<MapPinIcon className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Tarification */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CurrencyEuroIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Tarification
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Prix de base (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register(`courses.${index}.tarification.prix_de_base`)}
                  error={errors?.courses?.[index]?.tarification?.prix_de_base?.message}
                  icon={<CurrencyEuroIcon className="h-4 w-4" />}
                />

                <Input
                  label="Suppléments (€)"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register(`courses.${index}.tarification.supplements`)}
                  error={errors?.courses?.[index]?.tarification?.supplements?.message}
                  icon={<CurrencyEuroIcon className="h-4 w-4" />}
                />
              </div>
                <div className="mt-4">
                    <Input
                    label="Prix taximètre (€)"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`courses.${index}.prix_taximetre`)}
                    error={errors?.courses?.[index]?.prix_taximetre?.message}
                    icon={<CurrencyEuroIcon className="h-4 w-4" />}
                    />
                </div>
                <div className="mt-4">
                    <Input
                    label="Sommes perçues (€)"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`courses.${index}.sommes_percues`)}
                    error={errors?.courses?.[index]?.sommes_percues?.message}
                    icon={<CurrencyEuroIcon className="h-4 w-4" />}
                    />
                </div>
                <div className="mt-4">
                    <Input
                    label="Total (€)"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`courses.${index}.total`)}
                    error={errors?.courses?.[index]?.total?.message}
                    icon={<CurrencyEuroIcon className="h-4 w-4" />}
                    />
                </div>
                <div className="mt-4">
                    <Input
                    label="Total (€)"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`courses.${index}.total`)}
                    error={errors?.courses?.[index]?.total?.message}
                    icon={<CurrencyEuroIcon className="h-4 w-4" />}
                    />
                </div>
                <div className="mt-4">
                    <Input
                    label="Total (€)"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`courses.${index}.total`)}
                    error={errors?.courses?.[index]?.total?.message}
                    icon={<CurrencyEuroIcon className="h-4 w-4" />}
                    />
                </div>
                <div className="mt-4">
                    <Listbox
                    label="Mode de paiement"
                    options={paymentOptions}
                    {...register(`courses.${index}.mode_paiement`)}
                    error={errors?.courses?.[index]?.mode_paiement?.message}
                    control={control}
                    />
                </div>
            </div>
            {/* Client */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <Input
                label="Client"
                placeholder="Nom du client ou entreprise"
                {...register(`courses.${index}.client`)}
                error={errors?.courses?.[index]?.client?.message}
                icon={<UserIcon className="h-4 w-4" />}
              />
            </div>
            {/* Notes */}
            <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
              <Textarea
                label="Notes"
                placeholder="Notes supplémentaires sur la course"
                {...register(`courses.${index}.notes`)}
                error={errors?.courses?.[index]?.notes?.message}
                rows={3}
              />
            </div>
          </div>
        )}
      </Card>
    );
  };
    return (
        <Card className={`p-4 sm:px-5 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
            <PlusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
            Ajouter une Course
            </h3>
        </div>
        
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCourse}
            className="mb-4"
        >
            Ajouter une course
        </Button>
    
        {fields.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
        ))}
        </Card>
    );
};

CourseForm.displayName = "CourseForm";
CourseForm.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  className: PropTypes.string,
};
export { CourseForm };

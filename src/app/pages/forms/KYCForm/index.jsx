import { useState } from "react";
import clsx from "clsx";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { KYCFormProvider } from "./KYCFormProvider";
import { Stepper } from "./Stepper";
import { ValidationComplete } from "./ValidationComplete";
import { VehicleInfo } from "./steps/VehicleInfo";
import { CoursesList } from "./steps/CoursesList";
import { FinalValidation } from "./steps/FinalValidation";

const steps = [
  {
    key: "vehicleInfo",
    component: VehicleInfo,
    label: "Informations Véhicule",
    description: "Renseignez les informations de base du véhicule et des charges",
  },
  {
    key: "coursesList",
    component: CoursesList,
    label: "Liste des Courses",
    description: "Ajoutez et vérifiez toutes les courses effectuées",
  },
  {
    key: "finalValidation",
    component: FinalValidation,
    label: "Validation Finale",
    description: "Vérifiez et validez la feuille de route complète",
  },
];

const TaxiRouteSheet = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const ActiveForm = steps[currentStep].component;

  const stepsNode = (
    <>
      <div className="col-span-12 sm:order-last sm:col-span-4 lg:col-span-3">
        <div className="sticky top-24 sm:mt-3">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
      <div className="col-span-12 sm:col-span-8 lg:col-span-9">
        <Card className="h-full p-4 sm:p-5">
          <div className="space-y-2">
            <h5 className="text-lg font-medium text-gray-800 dark:text-dark-100">
              {steps[currentStep].label}
            </h5>
            <p className="text-sm text-gray-500 dark:text-dark-200">
              {steps[currentStep].description}
            </p>
          </div>
          
          <div className="mt-6">
            {!completed && (
              <ActiveForm
                setCurrentStep={setCurrentStep}
                setCompleted={setCompleted}
              />
            )}
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <Page title="Feuille de Route Taxi">
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:text-2xl">
            Nouvelle Feuille de Route
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-300">
            Complétez toutes les étapes pour enregistrer votre feuille de route
          </p>
        </div>

        <KYCFormProvider>
          <div
            className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
              !completed && "grid-rows-[auto_1fr] sm:grid-rows-none"
            )}
          >
            {completed ? (
              <div className="col-span-12">
                <ValidationComplete />
              </div>
            ) : (
              stepsNode
            )}
          </div>
        </KYCFormProvider>
      </div>
    </Page>
  );
};

export default TaxiRouteSheet;
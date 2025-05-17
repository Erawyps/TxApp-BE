import { useState, useEffect } from "react";
import clsx from "clsx";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { KYCFormProvider } from "./KYCFormProvider";
import { Stepper } from "./Stepper";
import { ValidationComplete } from "./ValidationComplete";
import { ChauffeurInfo } from "./steps/ChauffeurInfo";
import { VehicleInfo } from "./steps/VehicleInfo";
import { CoursesList } from "./steps/CoursesList";
import { ChargesList } from "./steps/ChargesList";
import { Recapitulatif } from "./steps/Recapitulatif";
import { FinalValidation } from "./steps/FinalValidation";
import { ValidationModal } from "./components/ValidationModal";

const steps = [
  { key: "chauffeur", label: "Identité du chauffeur" },
  { key: "vehicle", label: "Informations véhicule" },
  { key: "courses", label: "Liste des courses" },
  { key: "charges", label: "Charges" },
  { key: "recap", label: "Récapitulatif" },
  { key: "validation", label: "Validation" }
];

const STEP_COMPONENTS = {
  0: ChauffeurInfo,
  1: VehicleInfo,
  2: CoursesList,
  3: ChargesList,
  4: Recapitulatif,
  5: FinalValidation
};

export function TaxiRouteSheet() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const ActiveForm = STEP_COMPONENTS[currentStep];

  useEffect(() => {
    console.log('Current step:', currentStep);
    console.log('Active form:', ActiveForm);
  }, [currentStep, ActiveForm]);

  return (
    <Page title="Feuille de Route Taxi">
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-medium tracking-wide text-gray-800 lg:text-2xl">
            Nouvelle Feuille de Route
          </h2>
          <p className="text-sm text-gray-500">
            Complétez toutes les étapes pour enregistrer votre feuille de route
          </p>
        </div>

        <KYCFormProvider>
          <div className={clsx(
            "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
            !completed && "grid-rows-[auto_1fr] sm:grid-rows-none"
          )}>
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
                {completed ? (
                  <ValidationComplete />
                ) : (
                  <>
                    <div className="space-y-2">
                      <h5 className="text-lg font-medium text-gray-800">
                        {steps[currentStep].label}
                      </h5>
                    </div>
                    
                    <div className="mt-6">
                      <ActiveForm
                        setCurrentStep={setCurrentStep}
                        setCompleted={setCompleted}
                        setShowValidationModal={setShowValidationModal}
                      />
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>

          {showValidationModal && (
            <ValidationModal 
              onClose={() => setShowValidationModal(false)}
              onConfirm={() => {
                setCurrentStep(5);
                setShowValidationModal(false);
              }}
            />
          )}
        </KYCFormProvider>
      </div>
    </Page>
  );
}
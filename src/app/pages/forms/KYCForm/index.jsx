import { useState } from "react";
import clsx from "clsx";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { FeuilleRouteProvider } from "./FeuilleRouteProvider";
import { Stepper } from "./Stepper";
import { Validation } from "./Validation";
import { IdentiteChauffeur } from "./steps/IdentiteChauffeur";
import { InfoVehicule } from "./steps/InfoVehicule";
import { ListeCourses } from "./steps/ListeCourses";
import { Charges } from "./steps/Charges";
import { Recapitulatif } from "./steps/Recapitulatif";

const steps = [
  {
    key: "identiteChauffeur",
    component: IdentiteChauffeur,
    label: "Identité du Chauffeur",
    description: "Sélectionnez le chauffeur et configurez sa rémunération",
  },
  {
    key: "infoVehicule",
    component: InfoVehicule,
    label: "Informations Véhicule",
    description: "Renseignez les détails du véhicule et du taximètre",
  },
  {
    key: "listeCourses",
    component: ListeCourses,
    label: "Liste des Courses",
    description: "Ajoutez et gérez toutes les courses effectuées",
  },
  {
    key: "charges",
    component: Charges,
    label: "Charges",
    description: "Enregistrez les charges associées à cette feuille de route",
  },
  {
    key: "recapitulatif",
    component: Recapitulatif,
    label: "Récapitulatif",
    description: "Vérifiez le récapitulatif avant validation",
  },
];

const FeuilleRoute = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validated, setValidated] = useState(false);

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
          <h5 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            {steps[currentStep].label}
          </h5>
          <p className="text-sm text-gray-500 dark:text-dark-200">
            {steps[currentStep].description}
          </p>
          {!validated && (
            <ActiveForm
              setCurrentStep={setCurrentStep}
              setValidated={setValidated}
            />
          )}
        </Card>
      </div>
    </>
  );

  return (
    <Page title="Feuille de Route">
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <h2 className="py-5 text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:py-6 lg:text-2xl">
          Nouvelle Feuille de Route
        </h2>

        <FeuilleRouteProvider>
          <div
            className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",
              !validated && "grid-rows-[auto_1fr] sm:grid-rows-none "
            )}
          >
            {validated ? (
              <div className="col-span-12 place-self-center">
                <Validation />
              </div>
            ) : (
              stepsNode
            )}
          </div>
        </FeuilleRouteProvider>
      </div>
    </Page>
  );
};

export default FeuilleRoute;
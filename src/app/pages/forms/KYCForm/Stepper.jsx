import PropTypes from "prop-types";
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";
import { useKYCFormContext } from "./KYCFormContext";

const STEP_ICONS = {
  chauffeur: "👤",
  vehicle: "🚗",
  courses: "📋",
  charges: "💰",
  recap: "📊",
  validation: "✅"
};

export function Stepper({ steps, currentStep, setCurrentStep }) {
  const { smAndUp } = useBreakpointsContext();
  const kycFormCtx = useKYCFormContext();

  return (
    <ol
      className={clsx(
        "steps line-space text-center text-xs sm:text-start sm:text-sm",
        smAndUp && "is-vertical"
      )}
      aria-label="Progression de la feuille de route"
    >
      {steps.map((step, index) => {
        const isDone = kycFormCtx.state.stepStatus[`etape${index + 1}`]?.isDone;
        const isClickable = isDone || (index > 0 && 
          kycFormCtx.state.stepStatus[`etape${index}`]?.isDone);
        const isActive = currentStep === index;

        return (
          <li
            className={clsx(
              "step",
              index < currentStep
                ? "before:bg-primary-500"
                : "before:bg-gray-200 dark:before:bg-dark-500",
              smAndUp && "items-center pb-8"
            )}
            key={step.key}
          >
            <button
              className={clsx(
                "step-header rounded-full outline-hidden dark:text-white",
                isClickable && "cursor-pointer hover:ring-2 hover:ring-primary-300",
                isActive && "ring-2 ring-primary-500",
                isDone
                  ? "bg-primary-600 text-white ring-offset-[3px] ring-offset-gray-100 dark:bg-primary-500 dark:ring-offset-dark-900"
                  : "bg-gray-200 text-gray-950 dark:bg-dark-500",
                "flex items-center justify-center transition-all duration-200"
              )}
              onClick={() => isClickable && !isActive && setCurrentStep(index)}
              onKeyDown={createScopedKeydownHandler({
                siblingSelector: ".step-header",
                parentSelector: ".steps",
                loop: false,
                orientation: smAndUp ? "vertical" : "horizontal",
                activateOnFocus: true,
              })}
              disabled={!isClickable}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Étape ${index + 1}: ${step.label}`}
            >
              {isDone ? (
                <HiCheck className="size-4.5" aria-hidden="true" />
              ) : (
                <span className="text-sm" aria-hidden="true">
                  {STEP_ICONS[step.key]}
                </span>
              )}
            </button>
            <h3
              className={clsx(
                "text-gray-800 dark:text-dark-100 sm:text-start",
                smAndUp && "ltr:ml-4 rtl:mr-4",
                !isClickable && "opacity-60",
                isActive && "font-medium"
              )}
            >
              {step.label}
            </h3>
          </li>
        );
      })}
    </ol>
  );
}

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
};
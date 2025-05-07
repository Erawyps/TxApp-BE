import PropTypes from "prop-types";
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";
import { useKYCFormContext } from "./KYCFormContext";

export function Stepper({ steps, currentStep, setCurrentStep }) {
  const { smAndUp } = useBreakpointsContext();
  const taxiRouteCtx = useKYCFormContext();
  const stepStatus = taxiRouteCtx.state.stepStatus;

  const stepIcons = {
    vehicleInfo: "🚗",
    coursesList: "📋", 
    finalValidation: "✅"
  };

  return (
    <ol
      className={clsx(
        "steps line-space text-center text-xs sm:text-start sm:text-sm",
        smAndUp && "is-vertical"
      )}
    >
      {steps.map((step, i) => {
        const isClickable =
          stepStatus[step.key].isDone ||
          (i > 0 && stepStatus[steps[i - 1].key].isDone);

        return (
          <li
            className={clsx(
              "step",
              currentStep > i
                ? "before:bg-primary-500"
                : "before:bg-gray-200 dark:before:bg-dark-500",
              smAndUp && "items-center pb-8"
            )}
            key={step.key}
          >
            <button
              className={clsx(
                "step-header rounded-full outline-hidden dark:text-white",
                isClickable && "cursor-pointer",
                currentStep === i && "ring-2 ring-primary-500",
                stepStatus[step.key].isDone
                  ? "bg-primary-600 text-white ring-offset-[3px] ring-offset-gray-100 dark:bg-primary-500 dark:ring-offset-dark-900"
                  : "bg-gray-200 text-gray-950 dark:bg-dark-500",
                "flex items-center justify-center"
              )}
              {...{
                onClick: isClickable
                  ? () => currentStep !== i && setCurrentStep(i)
                  : undefined,
              }}
              onKeyDown={createScopedKeydownHandler({
                siblingSelector: ".step-header",
                parentSelector: ".steps",
                loop: false,
                orientation: smAndUp ? "vertical" : "horizontal",
                activateOnFocus: true,
              })}
              disabled={!isClickable}
            >
              {stepStatus[step.key].isDone ? (
                <HiCheck className="size-4.5" />
              ) : (
                <span className="text-sm">{stepIcons[step.key]}</span>
              )}
            </button>
            <h3
              className={clsx(
                "text-gray-800 dark:text-dark-100 sm:text-start",
                smAndUp && "ltr:ml-4 rtl:mr-4",
                !isClickable && "opacity-60"
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
      component: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
};
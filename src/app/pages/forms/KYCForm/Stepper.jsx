import PropTypes from "prop-types";
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { createScopedKeydownHandler } from "utils/dom/createScopedKeydownHandler";
import { useFeuilleRouteContext } from "./FeuilleRouteContext";

function getLeftSiblingStep(step, stepStatus) {
  let keys = Object.keys(stepStatus);
  let index = keys.indexOf(step);
  return index < 1 ? undefined : keys[index - 1];
}

export function Stepper({ steps, currentStep, setCurrentStep }) {
  const { smAndUp } = useBreakpointsContext();
  const feuilleRouteCtx = useFeuilleRouteContext();
  const stepStatus = feuilleRouteCtx.state.stepStatus;

  return (
    <ol
      className={clsx(
        "steps line-space text-center text-xs sm:text-start sm:text-sm",
        smAndUp && "is-vertical",
      )}
    >
      {steps.map((step, i) => {
        const isClickable =
          stepStatus[step.key].isDone ||
          stepStatus[getLeftSiblingStep(step.key, stepStatus)]?.isDone;
        return (
          <li
            className={clsx(
              "step",
              currentStep > i
                ? "before:bg-primary-500"
                : "before:bg-gray-200 dark:before:bg-dark-500",
              smAndUp && "items-center pb-8",
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
                i + 1
              )}
            </button>
            <h3
              className={clsx(
                "text-gray-800 dark:text-dark-100 sm:text-start",
                smAndUp && "ltr:ml-4 rtl:mr-4",
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
  steps: PropTypes.array,
  currentStep: PropTypes.number,
  setCurrentStep: PropTypes.func,
};
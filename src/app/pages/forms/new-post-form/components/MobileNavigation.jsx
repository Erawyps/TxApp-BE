import { Button } from "components/ui";
export function MobileNavigation({ currentStep, steps, onStepChange, isShiftActive }) {
  // Empêcher de naviguer en arrière si le shift est actif
  const canGoBack = !isShiftActive && currentStep > 1;
  const canGoForward = currentStep < steps.length && 
    (currentStep !== 1 || !isShiftActive);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
      <div className="flex justify-between">
        <Button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={!canGoBack}
          variant="ghost"
        >
          Retour
        </Button>
        
        <div className="flex items-center space-x-1">
          {steps.map(step => (
            <div 
              key={step.id}
              className={`w-2 h-2 rounded-full ${currentStep === step.id ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
        
        <Button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={!canGoForward}
        >
          {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
        </Button>
      </div>
    </div>
  );
}
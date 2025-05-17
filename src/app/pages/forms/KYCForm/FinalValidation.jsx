import { Button } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { Recapitulatif } from "./Recapitulatif";

export function FinalValidation({ setCompleted }) {
  const kycFormCtx = useKYCFormContext();

  const handleSubmit = () => {
    // Enregistrer la date/heure de validation
    const now = new Date();
    kycFormCtx.dispatch({
      type: 'SET_ETAPE5_DATA',
      payload: {
        signature: 'Validé',
        dateSignature: now.toISOString()
      }
    });
    
    // Marquer comme complété
    kycFormCtx.dispatch({ type: 'COMPLETE_FORM' });
    setCompleted(true);
  };

  return (
    <div className="space-y-6">
      <Recapitulatif 
        setCurrentStep={() => {}} 
        setShowValidationModal={() => {}}
      />
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          onClick={() => kycFormCtx.dispatch({ type: 'SET_CURRENT_STEP', payload: 4 })}
        >
          Retour
        </Button>
        <Button 
          type="button" 
          color="primary"
          onClick={handleSubmit}
        >
          Finaliser la validation
        </Button>
      </div>
    </div>
  );
}
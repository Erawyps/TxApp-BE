import { useState } from "react";
import { Button } from "components/ui";
import { Modal } from "components/shared/modal/Modal";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { useNavigate } from "react-router-dom";

export function Recapitulatif({ setCurrentStep, setValidated }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { chauffeur, vehicule, courses = [], charges = [] } = feuilleRouteCtx.state.formData;

  // Calcul des totaux
  const totalRecettes = courses.reduce((sum, course) => sum + (course?.sommePercue || 0), 0);
  const totalKmCourses = courses.reduce((sum, course) => sum + ((course?.indexArrivee || 0) - (course?.indexDepart || 0)), 0);
  const totalCharges = charges.reduce((sum, charge) => sum + (charge?.montant || 0), 0);

  const calculerSalaire = () => {
    if (!chauffeur?.regleSalaire) return 0;

    // Déplacer la déclaration de heures en dehors du switch
    let heures = 0;
    
    switch (chauffeur.regleSalaire) {
      case "fixe":
        return chauffeur.tauxSalaire || 0;
      case "40percent":
        return totalRecettes * 0.4;
      case "30percent":
        return totalRecettes * 0.3;
      case "mixte": {
        const seuil = 180;
        return totalRecettes <= seuil 
          ? totalRecettes * 0.4 
          : (seuil * 0.4) + ((totalRecettes - seuil) * 0.3);
      }
      case "heure10": {
        if (!chauffeur.heureDebut || !chauffeur.heureFin) return 0;
        
        const [debutH, debutM] = chauffeur.heureDebut.split(':').map(Number);
        const [finH, finM] = chauffeur.heureFin.split(':').map(Number);
        heures = (finH * 60 + finM - debutH * 60 - debutM) / 60;
        
        if (chauffeur.interruptions) {
          const [interH, interM] = chauffeur.interruptions.split(':').map(Number);
          heures -= (interH * 60 + interM) / 60;
        }
        return heures * 10;
      }
      case "heure12": {
        if (!chauffeur.heureDebut || !chauffeur.heureFin) return 0;
        
        const [debutH, debutM] = chauffeur.heureDebut.split(':').map(Number);
        const [finH, finM] = chauffeur.heureFin.split(':').map(Number);
        heures = (finH * 60 + finM - debutH * 60 - debutM) / 60;
        
        if (chauffeur.interruptions) {
          const [interH, interM] = chauffeur.interruptions.split(':').map(Number);
          heures -= (interH * 60 + interM) / 60;
        }
        return heures * 12;
      }
      default:
        return 0;
    }
  };

  const salaire = calculerSalaire();
  const benefice = totalRecettes - salaire - totalCharges;

  const onValidate = () => {
    if (courses.length === 0) {
      setError("Au moins une course est requise");
      return;
    }
    if (!vehicule?.kmFin) {
      setError("Le kilométrage de fin est requis");
      return;
    }
    setShowModal(true);
  };

  const confirmValidation = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      setShowModal(false);
      setValidated(true);
      navigate("/feuilles-route");
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Afficher les totaux et détails */}
      <div className="mt-6 space-y-6">
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Récapitulatif</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total Recettes:</p>
              <p>{totalRecettes.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Charges:</p>
              <p>{totalCharges.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium">Salaire Calculé:</p>
              <p>{salaire.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(3)}
        >
          Retour
        </Button>
        <Button
          className="min-w-[7rem]"
          color="primary"
          onClick={onValidate}
        >
          Valider
        </Button>
      </div>

      <Modal
        open={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title="Validation de la feuille de route"
      >
        <div className="space-y-4">
          <p>Confirmez-vous la validation de cette feuille de route ?</p>
          
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              color="primary"
              onClick={confirmValidation}
              loading={isSubmitting}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
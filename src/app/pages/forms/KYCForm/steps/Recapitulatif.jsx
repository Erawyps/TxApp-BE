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

  // Calcul des totaux (maintenant utilisés dans le JSX)
  const totalRecettes = courses.reduce((sum, course) => sum + (course?.sommePercue || 0), 0);
  const totalKmCourses = courses.reduce((sum, course) => sum + ((course?.indexArrivee || 0) - (course?.indexDepart || 0)), 0);
  const totalCharges = charges.reduce((sum, charge) => sum + (charge?.montant || 0), 0);

  const calculerSalaire = () => {
    if (!chauffeur?.regleSalaire) return 0;

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
      <div className="mt-6 space-y-6">
        {/* Bloc Performances */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Performances</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Nombre de courses:
              </p>
              <p>{courses.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Km parcourus:
              </p>
              <p>{totalKmCourses}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Ratio €/km:
              </p>
              <p>{totalKmCourses > 0 ? (totalRecettes / totalKmCourses).toFixed(2) : 0}</p>
            </div>
          </div>
        </div>

        {/* Bloc Recettes */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Recettes</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Total recettes:
              </p>
              <p>{totalRecettes.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Bloc Charges */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Charges</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Total charges:
              </p>
              <p>{totalCharges.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Salaire:
              </p>
              <p>{salaire.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Bloc Bénéfice */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Bénéfice</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Total bénéfice:
              </p>
              <p className="text-lg font-bold text-green-600">
                {benefice.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3">
        <Button
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(3)}
          disabled={isSubmitting}
        >
          Retour
        </Button>
        <Button
          className="min-w-[7rem]"
          color="primary"
          onClick={onValidate}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Validation..." : "Valider"}
        </Button>
      </div>

      <Modal
        open={showModal}
        onClose={() => !isSubmitting && setShowModal(false)}
        title="Validation de la feuille de route"
      >
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir valider cette feuille de route ?</p>
          
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              className="min-w-[7rem]"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              className="min-w-[7rem]"
              color="primary"
              onClick={confirmValidation}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi..." : "Confirmer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
import { useState } from "react";
import { Button } from "components/ui";
import { Modal } from "components/shared/modal/Modal";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { useNavigate } from "react-router-dom";
import FeuilleRouteWebForm from "../components/FeuilleRouteWebForm";
import { generateFeuilleRoutePDF } from "../utils/generatePDF";

export function Recapitulatif({ setCurrentStep, setValidated }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { formData } = feuilleRouteCtx.state;
  const { courses = [], charges = [] } = formData;

  // Calculs des totaux
  const totalRecettes = courses.reduce((sum, course) => sum + (course?.sommePercue || 0), 0);
  const totalCharges = charges.reduce((sum, charge) => sum + (charge?.montant || 0), 0);
  const totalKmCourses = courses.reduce((sum, c) => sum + ((c?.indexArrivee || 0) - (c?.indexDepart || 0)), 0);
  const ratioEurosParKm = totalKmCourses > 0 ? (totalRecettes / totalKmCourses).toFixed(2) : "0.00";

  const calculerSalaire = () => {
    if (!formData.regleSalaire) return 0;
    let heures = 0;
    
    switch (formData.regleSalaire) {
      case "fixe": return formData.tauxSalaire || 0;
      case "40percent": return totalRecettes * 0.4;
      case "30percent": return totalRecettes * 0.3;
      case "mixte": {
        const seuil = 180;
        return totalRecettes <= seuil ? totalRecettes * 0.4 : (seuil * 0.4) + ((totalRecettes - seuil) * 0.3);
      }
      case "heure10":
      case "heure12": {
        if (!formData.heure_debut || !formData.heure_fin) return 0;
        const [debutH, debutM] = formData.heure_debut.split(":").map(Number);
        const [finH, finM] = formData.heure_fin.split(":").map(Number);
        heures = (finH * 60 + finM - debutH * 60 - debutM) / 60;
        if (formData.interruptions) {
          const [interH, interM] = formData.interruptions.split(":").map(Number);
          heures -= (interH * 60 + interM) / 60;
        }
        return heures * (formData.regleSalaire === "heure10" ? 10 : 12);
      }
      default: return 0;
    }
  };

  const salaire = calculerSalaire();
  const beneficeNet = totalRecettes - salaire - totalCharges; // Renommé pour plus de clarté

  const calculerTotalHeures = () => {
    if (!formData.heure_debut || !formData.heure_fin) return "00:00";
    try {
      const [debutH, debutM] = formData.heure_debut.split(":").map(Number);
      const [finH, finM] = formData.heure_fin.split(":").map(Number);
      let totalMinutes = (finH * 60 + finM) - (debutH * 60 + debutM);
      if (formData.interruptions) {
        const [interH, interM] = formData.interruptions.split(":").map(Number);
        totalMinutes -= (interH * 60 + interM);
      }
      return totalMinutes <= 0 ? "00:00" : 
        `${Math.floor(totalMinutes / 60).toString().padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
    } catch {
      return "00:00";
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const pdfData = {
        date: formData.date || new Date().toISOString().split('T')[0],
        chauffeur: {
          nom: formData.chauffeur?.nom || 'Nom inconnu',
          prenom: formData.chauffeur?.prenom || '',
          heureDebut: formData.heure_debut || '00:00',
          heureFin: formData.heure_fin || '00:00',
          interruptions: formData.interruptions || 'Aucune',
          totalHeures: calculerTotalHeures()
        },
        vehicule: {
          plaqueImmatriculation: formData.vehicule?.plaqueImmatriculation || 'N/A',
          numeroIdentification: formData.vehicule?.numeroIdentification || 'N/A',
          kmDebut: formData.km_debut ?? 0,
          kmFin: formData.km_fin ?? 0
        },
        courses: (formData.courses || []).map(course => ({
          indexDepart: course.indexDepart ?? 0,
          indexArrivee: course.indexArrivee ?? 0,
          lieuEmbarquement: course.lieuEmbarquement || 'Non spécifié',
          lieuDebarquement: course.lieuDebarquement || 'Non spécifié',
          heureEmbarquement: course.heureEmbarquement || '00:00',
          heureDebarquement: course.heureDebarquement || '00:00',
          prixTaximetre: parseFloat(course.prixTaximetre) || 0,
          sommePercue: parseFloat(course.sommePercue) || 0
        }))
      };

      await generateFeuilleRoutePDF(pdfData);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      setError(error.message || "Erreur lors de la génération du PDF");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validerDonnees = () => {
    const erreurs = [];
    if (!formData.date) erreurs.push("La date est requise");
    if (!formData.chauffeur_id) erreurs.push("Le chauffeur est requis");
    if (!formData.vehicule_id) erreurs.push("Le véhicule est requis");
    if (!formData.heure_debut) erreurs.push("L'heure de début est requise");
    if (!formData.km_debut && formData.km_debut !== 0) erreurs.push("Le kilométrage de début est requis");
    if (courses.length === 0) erreurs.push("Au moins une course est requise");
    return erreurs;
  };

  const onValidate = () => {
    const erreurs = validerDonnees();
    if (erreurs.length > 0) {
      setError(erreurs.join('\n'));
      return;
    }
    setShowModal(true);
  };

  const confirmValidation = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
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
        <FeuilleRouteWebForm
          data={{
            date: formData.date,
            chauffeur: `${formData.chauffeur?.prenom || ''} ${formData.chauffeur?.nom || ''}`,
            plaque: formData.vehicule?.plaqueImmatriculation,
            numeroIdentification: formData.vehicule?.numeroIdentification,
            heureDebut: formData.heure_debut,
            heureFin: formData.heure_fin,
            interruptions: formData.interruptions,
            totalHeures: calculerTotalHeures(),
            kmDebut: formData.km_debut,
            kmFin: formData.km_fin,
            courses: formData.courses || []
          }}
        />

        {/* Bloc Performances */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Performances</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Courses :</p>
              <p>{courses.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Km parcourus :</p>
              <p>{totalKmCourses}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Ratio €/km :</p>
              <p>{ratioEurosParKm}</p>
            </div>
          </div>
        </div>

        {/* Bloc Financier */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Finances</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Recettes :</p>
              <p>{totalRecettes.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Charges :</p>
              <p>{totalCharges.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Salaire :</p>
              <p>{salaire.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Bénéfice net :</p>
              <p className="font-bold text-green-600">{beneficeNet.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button className="min-w-[7rem]" onClick={() => setCurrentStep(3)} disabled={isSubmitting}>
            Retour
          </Button>
          <Button className="min-w-[7rem]" color="secondary" onClick={handleDownloadPDF} disabled={isSubmitting}>
            {isSubmitting ? "Génération..." : "Télécharger PDF"}
          </Button>
          <Button className="min-w-[7rem]" color="primary" onClick={onValidate} disabled={isSubmitting}>
            {isSubmitting ? "Validation..." : "Valider"}
          </Button>
        </div>
      </div>

      <Modal open={showModal} onClose={() => !isSubmitting && setShowModal(false)} title="Confirmation">
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir valider cette feuille de route ?</p>
          {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <div className="flex justify-end space-x-3">
            <Button className="min-w-[7rem]" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button className="min-w-[7rem]" color="primary" onClick={confirmValidation} loading={isSubmitting}>
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
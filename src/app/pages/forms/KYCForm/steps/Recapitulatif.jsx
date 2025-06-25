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

  const { formData } = feuilleRouteCtx.state;
  const { courses = [], charges = [] } = formData;

  // Calcul des totaux
  const totalRecettes = courses.reduce((sum, course) => sum + (course?.sommePercue || 0), 0);
  const totalKmCourses = courses.reduce((sum, course) => sum + ((course?.indexArrivee || 0) - (course?.indexDepart || 0)), 0);
  const totalCharges = charges.reduce((sum, charge) => sum + (charge?.montant || 0), 0);

  const calculerSalaire = () => {
    if (!formData.regleSalaire) return 0;

    let heures = 0;
    
    switch (formData.regleSalaire) {
      case "fixe":
        return formData.tauxSalaire || 0;
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
        if (!formData.heure_debut || !formData.heure_fin) return 0;
        
        const [debutH, debutM] = formData.heure_debut.split(':').map(Number);
        const [finH, finM] = formData.heure_fin.split(':').map(Number);
        heures = (finH * 60 + finM - debutH * 60 - debutM) / 60;
        
        if (formData.interruptions) {
          const [interH, interM] = formData.interruptions.split(':').map(Number);
          heures -= (interH * 60 + interM) / 60;
        }
        return heures * 10;
      }
      case "heure12": {
        if (!formData.heure_debut || !formData.heure_fin) return 0;
        
        const [debutH, debutM] = formData.heure_debut.split(':').map(Number);
        const [finH, finM] = formData.heure_fin.split(':').map(Number);
        heures = (finH * 60 + finM - debutH * 60 - debutM) / 60;
        
        if (formData.interruptions) {
          const [interH, interM] = formData.interruptions.split(':').map(Number);
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

  const preparerDonneesPourAPI = () => {
    return {
      date: formData.date,
      chauffeur_id: formData.chauffeur_id,
      vehicule_id: formData.vehicule_id,
      heure_debut: formData.heure_debut,
      heure_fin: formData.heure_fin,
      interruptions: formData.interruptions,
      km_debut: formData.km_debut,
      km_fin: formData.km_fin,
      prise_en_charge_debut: formData.prise_en_charge_debut,
      prise_en_charge_fin: formData.prise_en_charge_fin,
      chutes_debut: formData.chutes_debut,
      chutes_fin: formData.chutes_fin,
      statut: "Validée",
      saisie_mode: formData.saisie_mode,
      courses: courses.map(course => ({
        index_depart: course.indexDepart,
        index_arrivee: course.indexArrivee,
        lieu_embarquement: course.lieuEmbarquement,
        lieu_debarquement: course.lieuDebarquement,
        heure_embarquement: course.heureEmbarquement,
        heure_debarquement: course.heureDebarquement,
        prix_taximetre: course.prixTaximetre,
        somme_percue: course.sommePercue,
        mode_paiement: course.modePaiement,
        client_id: course.client_id,
        numero_ordre: course.numero_ordre
      })),
      charges: charges.map(charge => ({
        type_charge: charge.type_charge,
        description: charge.description,
        montant: charge.montant,
        mode_paiement: charge.modePaiement,
        date: charge.date
      }))
    };
  };

  const onValidate = () => {
    if (courses.length === 0) {
      setError("Au moins une course est requise");
      return;
    }
    if (!formData.km_fin) {
      setError("Le kilométrage de fin est requis");
      return;
    }
    setShowModal(true);
  };

  const handleDownloadPDF = () => {
    // Logic to generate and download the PDF
    console.log("Downloading PDF...");
  };

  const confirmValidation = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const donneesAPI = preparerDonneesPourAPI();
      console.log("Données prêtes pour l'API:", donneesAPI);
      
      // Ici vous feriez normalement l'appel API vers Supabase
      // await api.post('/feuilles-route', donneesAPI);
      
      setShowModal(false);
      setValidated(true);
      navigate("/feuilles-route");
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement");
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
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Courses:</p>
              <p>{courses.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Km parcourus:</p>
              <p>{totalKmCourses}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Ratio €/km:</p>
              <p>{totalKmCourses > 0 ? (totalRecettes / totalKmCourses).toFixed(2) : 0}</p>
            </div>
          </div>
        </div>

        {/* Bloc Recettes */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Recettes</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Total:</p>
              <p>{totalRecettes.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Bloc Charges */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Charges</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Total:</p>
              <p>{totalCharges.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Salaire:</p>
              <p>{salaire.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Bloc Bénéfice */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Bénéfice</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">Total:</p>
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
         {/* Bouton de téléchargement PDF */}
        <Button
          className="min-w-[7rem]"
          color="secondary"
          onClick={handleDownloadPDF}
        >
          Télécharger PDF
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
import { useState } from "react";
import { Button } from "components/ui";
import { Modal } from "components/shared/modal/Modal";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";
import { useNavigate } from "react-router-dom";
import "jspdf-autotable";
import { generateFeuilleRoutePDF } from "../utils/generatePDF";

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
  // Convertir les heures en format ISO
  const formatHeure = (heure) => {
    if (!heure) return null;
    return `2000-01-01T${heure}:00`; // Date fictive, seule l'heure nous intéresse
  };

  return {
    date: formData.date,
    chauffeur_id: formData.chauffeur_id,
    vehicule_id: formData.vehicule_id,
    heure_debut: formatHeure(formData.heure_debut),
    heure_fin: formatHeure(formData.heure_fin),
    interruptions: formData.interruptions ? `PT${formData.interruptions.replace(':', 'H')}M` : null, // Format ISO8601
    km_debut: formData.km_debut,
    km_fin: formData.km_fin,
    prise_en_charge_debut: formData.prise_en_charge_debut,
    prise_en_charge_fin: formData.prise_en_charge_fin,
    chutes_debut: formData.chutes_debut,
    chutes_fin: formData.chutes_fin,
    statut: "Validée",
    saisie_mode: "admin", // ou "chauffeur" selon le cas
    courses: courses.map((course, index) => ({
      numero_ordre: index + 1,
      index_depart: course.indexDepart,
      index_arrivee: course.indexArrivee,
      lieu_embarquement: course.lieuEmbarquement,
      lieu_debarquement: course.lieuDebarquement,
      heure_embarquement: `${formData.date}T${course.heureEmbarquement}:00`,
      heure_debarquement: course.heureDebarquement ? `${formData.date}T${course.heureDebarquement}:00` : null,
      prix_taximetre: course.prixTaximetre,
      somme_percue: course.sommePercue,
      mode_paiement: course.modePaiement,
      client_id: course.client_id || null
    })),
    charges: charges.map(charge => ({
      type_charge: charge.type_charge,
      description: charge.description,
      montant: charge.montant,
      mode_paiement: charge.modePaiement,
      date: formData.date // Utilise la date de la feuille de route
    }))
  };
};

  const validerDonnees = () => {
  const erreurs = [];

  if (!formData.date) erreurs.push("La date est requise");
  if (!formData.chauffeur_id) erreurs.push("Le chauffeur est requis");
  if (!formData.vehicule_id) erreurs.push("Le véhicule est requis");
  if (!formData.heure_debut) erreurs.push("L'heure de début est requise");
  if (!formData.km_debut && formData.km_debut !== 0) erreurs.push("Le kilométrage de début est requis");
  
  if (courses.length === 0) {
    erreurs.push("Au moins une course est requise");
  } else {
    courses.forEach((course, index) => {
      if (course.indexArrivee <= course.indexDepart) {
        erreurs.push(`Course ${index + 1}: L'index d'arrivée doit être supérieur au départ`);
      }
      if (course.modePaiement === 'facture' && !course.client_id) {
        erreurs.push(`Course ${index + 1}: Un client doit être sélectionné pour les factures`);
      }
    });
  }

  return erreurs;
};

// Modifiez onValidate pour utiliser cette validation
const onValidate = () => {
  const erreurs = validerDonnees();
  if (erreurs.length > 0) {
    setError(erreurs.join('\n'));
    return;
  }
  setShowModal(true);
};

// Ajoutez cette fonction dans le composant Recapitulatif
const calculerTotalHeures = () => {
  if (!formData.heure_debut || !formData.heure_fin) return "00:00";
  
  try {
    const [debutH, debutM] = formData.heure_debut.split(':').map(Number);
    const [finH, finM] = formData.heure_fin.split(':').map(Number);
    
    let totalMinutes = (finH * 60 + finM) - (debutH * 60 + debutM);
    
    if (formData.interruptions) {
      const [interH, interM] = formData.interruptions.split(':').map(Number);
      totalMinutes -= (interH * 60 + interM);
    }
    
    if (totalMinutes <= 0) return "00:00";
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return "00:00";
  }
};

const handleDownloadPDF = async () => {
  try {
    // Formater correctement les données avant génération
    const pdfData = {
      date: formatDate(formData.date), // Fonction à créer pour formater la date
      chauffeur: {
        nom: formData.chauffeur?.nom || '',
        prenom: formData.chauffeur?.prenom || '',
        heureDebut: formatTime(formData.heure_debut),
        heureFin: formatTime(formData.heure_fin),
        interruptions: formData.interruptions ? formatTime(formData.interruptions) : 'Aucune',
        totalHeures: calculerTotalHeures()
      },
      vehicule: {
        plaqueImmatriculation: formData.vehicule?.plaqueImmatriculation || 'N/A',
        numeroIdentification: formData.vehicule?.numeroIdentification || 'N/A',
        kmDebut: formData.km_debut || 0,
        kmFin: formData.km_fin || 0,
        kmParcourus: (formData.km_fin || 0) - (formData.km_debut || 0)
      },
      courses: formData.courses.map(course => ({
        indexDepart: course.indexDepart || 0,
        indexArrivee: course.indexArrivee || 0,
        lieuEmbarquement: truncateText(course.lieuEmbarquement, 20), // Limiter à 20 caractères
        lieuDebarquement: truncateText(course.lieuDebarquement, 20),
        heureEmbarquement: formatTime(course.heureEmbarquement),
        heureDebarquement: formatTime(course.heureDebarquement),
        prixTaximetre: formatCurrency(course.prixTaximetre),
        sommePercue: formatCurrency(course.sommePercue)
      }))
    };

    await generateFeuilleRoutePDF(pdfData);
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    setError("Erreur lors de la génération du PDF");
  }
};

// Fonctions utilitaires
const formatDate = (dateString) => {
  // Implémentez le formatage de date selon vos besoins
  return dateString; // ou utiliser date-fns pour formater
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.length === 5 ? timeString : `${timeString}:00`;
};

const formatCurrency = (amount) => {
  return parseFloat(amount || 0).toFixed(2);
};

const truncateText = (text, maxLength) => {
  return text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
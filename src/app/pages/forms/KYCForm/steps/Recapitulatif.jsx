import { useState } from "react";
import { Button, Textarea } from "components/ui";
import { Modal } from "components/shared/modal/Modal";
import { useFeuilleRouteContext } from "../FeuilleRouteContext";

const reglesSalaire = [
  { value: "fixe", label: "Fixe" },
  { value: "40percent", label: "40% des recettes" },
  { value: "30percent", label: "30% des recettes" },
  { value: "mixte", label: "Mixte (40%/30%)" },
  { value: "heure10", label: "Heures (10€/h)" },
  { value: "heure12", label: "Heures (12€/h)" },
];

export function Recapitulatif({ setCurrentStep, setValidated }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [showModal, setShowModal] = useState(false);

  const { chauffeur, vehicule, courses, charges } = feuilleRouteCtx.state.formData;

  // Calcul des totaux
  const totalCourses = courses.length;
  
  // Calcul des km parcourus basé sur les courses
  const kmParcourus = courses.length > 0 
    ? courses[courses.length - 1].indexArrivee - courses[0].indexDepart 
    : 0;
  
  const totalRecettes = courses.reduce((sum, course) => sum + course.sommePercue, 0);
  
  // Calcul du ratio €/km basé sur les courses
  const totalKmCourses = courses.reduce((sum, course) => {
    return sum + (course.indexArrivee - course.indexDepart);
  }, 0);
  
  const ratioEuroKm = totalKmCourses > 0 
    ? (totalRecettes / totalKmCourses).toFixed(2)
    : 0;

  const totalCash = courses
    .filter((c) => c.modePaiement === "cash")
    .reduce((sum, course) => sum + course.sommePercue, 0);
  
  const totalBancontactVirement = courses
    .filter((c) => ["bancontact", "virement"].includes(c.modePaiement))
    .reduce((sum, course) => sum + course.sommePercue, 0);
  
  const totalChargesCash = charges
    .filter((c) => c.modePaiement === "cash")
    .reduce((sum, charge) => sum + charge.montant, 0);
  
  const totalChargesBancontact = charges
    .filter((c) => c.modePaiement === "bancontact")
    .reduce((sum, charge) => sum + charge.montant, 0);

  // Calcul du salaire selon la règle
  const calculerSalaire = () => {
    switch (chauffeur.regleSalaire) {
      case "fixe":
        return { 
          montant: chauffeur.tauxSalaire, 
          type: "Fixe",
          details: `${chauffeur.tauxSalaire?.toFixed(2)} €`
        };
      case "40percent":
        return { 
          montant: totalRecettes * 0.4, 
          type: "40% des recettes",
          details: `40% de ${totalRecettes.toFixed(2)} € = ${(totalRecettes * 0.4).toFixed(2)} €`
        };
      case "30percent":
        return { 
          montant: totalRecettes * 0.3, 
          type: "30% des recettes",
          details: `30% de ${totalRecettes.toFixed(2)} € = ${(totalRecettes * 0.3).toFixed(2)} €`
        };
      case "mixte": {
        const seuil = 180;
        const montant = totalRecettes <= seuil 
          ? totalRecettes * 0.4 
          : (seuil * 0.4) + ((totalRecettes - seuil) * 0.3);
        return { 
          montant,
          type: "Mixte (40%/30%)",
          details: totalRecettes <= seuil
            ? `40% de ${totalRecettes.toFixed(2)} € = ${montant.toFixed(2)} €`
            : `40% de 180 € + 30% de ${(totalRecettes - seuil).toFixed(2)} € = ${montant.toFixed(2)} €`
        };
      }
      case "heure10": {
        // Calcul basé sur les heures de prestation
        const heures = calculerHeuresPrestation();
        return { 
          montant: heures * 10,
          type: "Heures (10€/h)",
          details: `${heures} h × 10 € = ${(heures * 10).toFixed(2)} €`
        };
      }
      case "heure12": {
        const heures12 = calculerHeuresPrestation();
        return { 
          montant: heures12 * 12,
          type: "Heures (12€/h)",
          details: `${heures12} h × 12 € = ${(heures12 * 12).toFixed(2)} €`
        };
      }
      default:
        return { montant: 0, type: "Inconnu", details: "" };
    }
  };

  const calculerHeuresPrestation = () => {
    if (!chauffeur.heureDebut || !chauffeur.heureFin) return 0;
    
    try {
      const [debutH, debutM] = chauffeur.heureDebut.split(':').map(Number);
      const [finH, finM] = chauffeur.heureFin.split(':').map(Number);
      
      let totalMinutes = (finH * 60 + finM) - (debutH * 60 + debutM);
      
      // Soustraire les interruptions
      if (chauffeur.interruptions) {
        const [interH, interM] = chauffeur.interruptions.split(':').map(Number);
        totalMinutes -= (interH * 60 + interM);
      }
      
      return totalMinutes > 0 ? (totalMinutes / 60).toFixed(2) : 0;
    } catch {
      return 0;
    }
  };

  const salaire = calculerSalaire();
  const benefice = totalRecettes - salaire.montant - totalChargesCash - totalChargesBancontact;

  const onValidate = () => {
    setShowModal(true);
  };

  const confirmValidation = () => {
    setShowModal(false);
    setValidated(true);
    // Ici, vous pourriez ajouter une requête API pour sauvegarder la feuille de route
  };

  return (
    <div>
      <div className="mt-6 space-y-6">
        {/* Bloc Chauffeur + Véhicule */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h6 className="mb-3 text-lg font-medium">Chauffeur</h6>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nom:</p>
                  <p>{chauffeur.prenom} {chauffeur.nom}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date:</p>
                  <p>{chauffeur.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Heures:</p>
                  <p>{chauffeur.heureDebut} - {chauffeur.heureFin}</p>
                </div>
                {chauffeur.interruptions && (
                  <div>
                    <p className="text-sm font-medium">Interruptions:</p>
                    <p>{chauffeur.interruptions}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Règle salaire:</p>
                  <p>
                    {reglesSalaire.find((r) => r.value === chauffeur.regleSalaire)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Détails salaire:</p>
                  <p>{salaire.details}</p>
                </div>
              </div>
            </div>

            <div>
              <h6 className="mb-3 text-lg font-medium">Véhicule</h6>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Plaque:</p>
                  <p>{vehicule.plaqueImmatriculation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">N° Identification:</p>
                  <p>{vehicule.numeroIdentification}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Km début:</p>
                  <p>{vehicule.kmDebut}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Km fin:</p>
                  <p>{vehicule.kmFin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bloc Performances */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Performances</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium">Nombre de courses:</p>
              <p>{totalCourses}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Km parcourus:</p>
              <p>{kmParcourus}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Ratio €/km:</p>
              <p>{ratioEuroKm}</p>
            </div>
          </div>
        </div>

        {/* Bloc Recettes */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Recettes</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium">Total recettes:</p>
              <p>{totalRecettes.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium">Cash:</p>
              <p>{totalCash.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium">Bancontact/Virement:</p>
              <p>{totalBancontactVirement.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Bloc Charges */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Charges</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium">Charges cash:</p>
              <p>{totalChargesCash.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium">Charges Bancontact:</p>
              <p>{totalChargesBancontact.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm font-medium">Salaire:</p>
              <p>{salaire.montant.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Bloc Bénéfice */}
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Bénéfice</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Total bénéfice:</p>
              <p className="text-lg font-bold text-green-600">
                {benefice.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        <Textarea
          label="Note supplémentaire"
          placeholder="Ajoutez une note si nécessaire"
        />
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
        onClose={() => setShowModal(false)}
        title="Validation de la feuille de route"
      >
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir valider cette feuille de route ?</p>
          <div className="flex justify-end space-x-3">
            <Button
              className="min-w-[7rem]"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button
              className="min-w-[7rem]"
              color="primary"
              onClick={confirmValidation}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
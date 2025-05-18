import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Textarea } from "components/ui";
import { Modal } from "components/shared/modal/Modal";

// Define or import reglesSalaire
const reglesSalaire = [
  { value: "fixe", label: "Fixe" },
  { value: "40percent", label: "40% des recettes" },
  { value: "30percent", label: "30% des recettes" },
  { value: "mixte", label: "Mixte (40%/30%)" },
  { value: "heure10", label: "Heures (10€/h)" },
  { value: "heure12", label: "Heures (12€/h)" },
];
import { useFeuilleRouteContext } from "../FeuilleRouteContext";

export function Recapitulatif({ setCurrentStep, setValidated }) {
  const feuilleRouteCtx = useFeuilleRouteContext();
  const [showModal, setShowModal] = useState(false);

  const { chauffeur, vehicule, courses, charges } = feuilleRouteCtx.state.formData;

  // Calcul des totaux
  const totalCourses = courses.length;
  const totalKm = vehicule.kmFin - vehicule.kmDebut;
  const totalRecettes = courses.reduce((sum, course) => sum + course.sommePercue, 0);
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
        return { montant: chauffeur.tauxSalaire, type: "Fixe" };
      case "40percent":
        return { montant: totalRecettes * 0.4, type: "40% des recettes" };
      case "30percent":
        return { montant: totalRecettes * 0.3, type: "30% des recettes" };
      case "mixte": {
        const seuil = 180;
        const montant = totalRecettes <= seuil 
          ? totalRecettes * 0.4 
          : (seuil * 0.4) + ((totalRecettes - seuil) * 0.3);
        return { montant, type: "Mixte (40%/30%)" };
      }
      case "heure10":
        // Supposons 8 heures de travail par défaut
        return { montant: 8 * 10, type: "Heures (10€/h)" };
      case "heure12":
        // Supposons 8 heures de travail par défaut
        return { montant: 8 * 12, type: "Heures (12€/h)" };
      default:
        return { montant: 0, type: "Inconnu" };
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
        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Identité du Chauffeur</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Nom:</p>
              <p>{chauffeur.prenom} {chauffeur.nom}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Règle de rémunération:</p>
              <p>
                {reglesSalaire.find((r) => r.value === chauffeur.regleSalaire)?.label}
              </p>
            </div>
            {chauffeur.note && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Note:</p>
                <p>{chauffeur.note}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Informations Véhicule</h6>
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

        <div className="rounded-lg border p-4 dark:border-dark-500">
          <h6 className="mb-3 text-lg font-medium">Performances</h6>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm font-medium">Nombre de courses:</p>
              <p>{totalCourses}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Km parcourus:</p>
              <p>{totalKm}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Ratio €/km:</p>
              <p>{(totalRecettes / totalKm).toFixed(2)}</p>
            </div>
          </div>
        </div>

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
              <p>{salaire.montant.toFixed(2)} € ({salaire.type})</p>
            </div>
          </div>
        </div>

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

Recapitulatif.propTypes = {
  setCurrentStep: PropTypes.func,
  setValidated: PropTypes.func,
};
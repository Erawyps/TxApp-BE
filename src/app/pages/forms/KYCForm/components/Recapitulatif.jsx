import { Button, Card } from "components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import { calculerSalaire } from "../utils/calculations";
import { REMUNERATION_TYPES } from "../constants"; // Make sure this path is correct

export function Recapitulatif({ setCurrentStep, setShowValidationModal }) {
  const kycFormCtx = useKYCFormContext();
  const { etape1, etape2, etape3, etape4 } = kycFormCtx.state;

  // Calcul des statistiques
  const totalCourses = etape3.courses.length;
  const totalKm = etape3.courses.reduce((sum, course) => 
    sum + (course.indexArrivee - course.indexDepart), 0);
  const totalCA = etape3.courses.reduce((sum, course) => 
    sum + parseFloat(course.sommePercue), 0);
  const ratio = totalKm > 0 ? (totalCA / totalKm).toFixed(2) : 0;

  // Calcul des charges
  const totalCharges = etape4.charges.reduce((sum, charge) => 
    sum + parseFloat(charge.montant), 0);

  // Calcul du salaire
  const heuresService = etape1.periodeService.heureDebut && etape1.periodeService.heureFin ?
    (new Date(`1970-01-01T${etape1.periodeService.heureFin}`) - 
     new Date(`1970-01-01T${etape1.periodeService.heureDebut}`)) / (1000 * 60 * 60) : 0;

  const salaire = calculerSalaire(
    etape1.remunerationType,
    totalCA,
    heuresService
  );

  const benefices = totalCA - salaire - totalCharges;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Chauffeur</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Nom" value={etape1.chauffeurId} />
          <StatItem label="Type rémunération" value={
            REMUNERATION_TYPES.find(t => t.value === etape1.remunerationType)?.label
          } />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Véhicule</h3>
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Plaque" value={etape2.plaqueImmatriculation} />
          <StatItem label="N° identification" value={etape2.numeroIdentification} />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatItem label="Nombre de courses" value={totalCourses} />
          <StatItem label="Km parcourus" value={totalKm} />
          <StatItem label="Ratio €/km" value={ratio} />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Finances</h3>
        <div className="space-y-4">
          <StatItem label="CA généré" value={`${totalCA.toFixed(2)} €`} />
          <StatItem label="Charges totales" value={`${totalCharges.toFixed(2)} €`} />
          <StatItem label="Salaire" value={`${salaire.toFixed(2)} €`} />
          <StatItem label="Bénéfices" value={`${benefices.toFixed(2)} €`} />
        </div>
      </Card>

      <div className="flex justify-between">
        <Button type="button" onClick={() => setCurrentStep(3)}>
          Retour
        </Button>
        <Button 
          type="button" 
          color="primary"
          onClick={() => setShowValidationModal(true)}
        >
          Valider
        </Button>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
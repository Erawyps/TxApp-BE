import { useState } from 'react';
import { 
  PrinterIcon, 
  DocumentArrowDownIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from "@heroicons/react/24/outline";

// Mock des fonctions utilitaires (normalement importées)
const generateAndDownloadReport = (shiftData, courses, driver, vehicle) => {
  // Simulation de la génération - remplacer par l'import réel
  console.log('Génération PDF avec données:', { shiftData, courses, driver, vehicle });
  return `Feuille_de_Route_${driver.prenom}_${driver.nom}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
};

const validateDataForPDF = (shiftData, courses, driver, vehicle) => {
  const errors = [];
  
  if (!driver || (!driver.prenom && !driver.nom)) {
    errors.push('Informations du chauffeur manquantes');
  }
  
  if (!vehicle || !vehicle.plaque_immatriculation) {
    errors.push('Informations du véhicule manquantes');
  }
  
  if (!Array.isArray(courses)) {
    errors.push('Liste des courses invalide');
  }
  
  if (courses.length === 0) {
    errors.push('Aucune course enregistrée');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const EnhancedPrintComponent = ({ 
  shiftData, 
  courses = [], 
  driver, 
  vehicle,
  onSuccess,
  onError 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  // Données de démonstration si non fournies
  const demoShiftData = shiftData || {
    date: '2025-08-07',
    heure_debut: '08:00',
    heure_fin: '16:00',
    interruptions: '01:00',
    km_tableau_bord_debut: 50000,
    km_tableau_bord_fin: 50250,
    taximetre_prise_charge_debut: 0,
    taximetre_prise_charge_fin: 245.50,
    taximetre_index_km_debut: 50000,
    taximetre_index_km_fin: 50250,
    taximetre_km_charge_debut: 0,
    taximetre_km_charge_fin: 180,
    taximetre_chutes_debut: 0,
    taximetre_chutes_fin: 25.75
  };

  const demoCourses = courses.length > 0 ? courses : [
    {
      id: 1,
      numero_ordre: 1,
      index_depart: 152,
      index_embarquement: 152,
      lieu_embarquement: "Place Eugène Flagey",
      heure_embarquement: "08:30",
      index_debarquement: 158,
      lieu_debarquement: "Gare Centrale",
      heure_debarquement: "08:45",
      prix_taximetre: 12.50,
      sommes_percues: 15.00,
      mode_paiement: "CASH",
      status: "completed"
    },
    {
      id: 2,
      numero_ordre: 2,
      index_depart: 158,
      index_embarquement: 158,
      lieu_embarquement: "Gare Centrale",
      heure_embarquement: "09:15",
      index_debarquement: 165,
      lieu_debarquement: "Avenue Louise 123",
      heure_debarquement: "09:35",
      prix_taximetre: 18.75,
      sommes_percues: 20.00,
      mode_paiement: "BC",
      status: "completed"
    }
  ];

  const demoDriver = driver || {
    prenom: "Hasler",
    nom: "Tehou",
    numero_badge: "TX-2023-001"
  };

  const demoVehicle = vehicle || {
    plaque_immatriculation: "TX-AA-171",
    numero_identification: "10",
    marque: "Mercedes",
    modele: "Classe E"
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Validation des données
      const validation = validateDataForPDF(demoShiftData, demoCourses, demoDriver, demoVehicle);
      
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      // Génération du PDF
      const fileName = generateAndDownloadReport(demoShiftData, demoCourses, demoDriver, demoVehicle);
      
      setLastGenerated({
        fileName,
        timestamp: new Date(),
        coursesCount: demoCourses.length,
        totalRecettes: demoCourses.reduce((sum, c) => sum + (c.sommes_percues || 0), 0)
      });

      onSuccess?.(`Feuille de route générée avec succès : ${fileName}`);
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      onError?.(`Erreur lors de la génération : ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const validation = validateDataForPDF(demoShiftData, demoCourses, demoDriver, demoVehicle);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <PrinterIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Génération Feuille de Route
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Format PDF officiel conforme aux exigences taxi
          </p>
        </div>
      </div>

      {/* Validation Status */}
      <div className="mb-6">
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          validation.isValid 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {validation.isValid ? (
            <>
              <CheckCircleIcon className="h-5 w-5" />
              <span className="font-medium">Données validées - Prêt pour l&apos;impression</span>
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="h-5 w-5" />
              <div>
                <p className="font-medium">Données incomplètes :</p>
                <ul className="text-sm mt-1 list-disc list-inside">
                  {validation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Aperçu des données */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Informations Shift
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {demoShiftData.date ? new Date(demoShiftData.date).toLocaleDateString('fr-FR') : 'Non définie'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Durée:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {demoShiftData.heure_debut} - {demoShiftData.heure_fin || 'En cours'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Véhicule:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {demoVehicle.plaque_immatriculation}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Résumé Courses
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nombre:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {demoCourses.length} course{demoCourses.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Recettes:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {demoCourses.reduce((sum, c) => sum + (c.sommes_percues || 0), 0).toFixed(2)} €
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Chauffeur:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {demoDriver.prenom} {demoDriver.nom}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Generated Info */}
      {lastGenerated && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <InformationCircleIcon className="h-5 w-5" />
            <div className="text-sm">
              <p className="font-medium">Dernière génération :</p>
              <p>{lastGenerated.fileName}</p>
              <p className="text-xs opacity-75">
                {lastGenerated.timestamp.toLocaleString('fr-FR')} - 
                {lastGenerated.coursesCount} courses - 
                {lastGenerated.totalRecettes.toFixed(2)} € de recettes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating || !validation.isValid}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
            validation.isValid && !isGenerating
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <DocumentArrowDownIcon className="h-5 w-5" />
              <span>Générer et Télécharger PDF</span>
            </>
          )}
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Imprimer la page actuelle"
        >
          <PrinterIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Format Information */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Détails du format généré
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Format A4 (210x297mm) respectant la feuille de route officielle</li>
          <li>• Tableaux avec bordures et alignements précis</li>
          <li>• Gestion automatique des débordements de texte</li>
          <li>• Page 2 automatique si plus de 8 courses</li>
          <li>• Signature du chauffeur incluse</li>
          <li>• Compatible impression professionnelle</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedPrintComponent;
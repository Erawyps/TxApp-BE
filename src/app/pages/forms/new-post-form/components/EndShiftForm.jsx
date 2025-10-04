// Import Dependencies
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { PrinterIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useCallback, useEffect } from "react";

// Local Imports
import { Card, Button, Input, Textarea } from "components/ui";
import { endShiftSchema } from "../schema";

// ----------------------------------------------------------------------

// Hook personnalisé pour l'auto-sauvegarde
const useAutoSave = (data, key, delay = 2000) => {
  const saveData = useCallback((dataToSave) => {
    try {
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde automatique:', error);
    }
  }, [key]);

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const timeoutId = setTimeout(() => {
      saveData(data);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [data, saveData, delay]);
};

// Fonction pour charger les données sauvegardées avec validation
const loadSavedData = (key) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsedData = JSON.parse(saved);
      
      // Vérifier si les données sont significatives (pas que des valeurs vides)
      const hasSignificantData = Object.values(parsedData).some(value => 
        value !== '' && value !== null && value !== undefined && value !== '0'
      );
      
      console.log(`📦 loadSavedData(${key}):`, {
        found: !!parsedData,
        hasSignificantData,
        data: parsedData
      });
      
      return hasSignificantData ? parsedData : null;
    }
    return null;
  } catch (error) {
    console.warn('Erreur lors du chargement des données sauvegardées:', error);
    return null;
  }
};

const initialEndShiftData = {
  heure_fin: '',
  interruptions: '',
  km_tableau_bord_fin: '',
  taximetre_prise_charge_fin: '',
  taximetre_index_km_fin: '',
  taximetre_km_charge_fin: '',
  taximetre_chutes_fin: '',
  observations: '',
  signature_chauffeur: ''
};

export function EndShiftForm({ onEndShift, shiftData, driver, onPrintReport }) {
  // Charger les données sauvegardées du formulaire de fin
  const savedEndData = loadSavedData('endShiftFormData');
  
  // Charger les données sauvegardées du formulaire de début pour récupérer heure_fin_estimee
  const savedStartData = loadSavedData('shiftFormData');

  // Debug: Afficher les données reçues
  console.log('🔍 EndShiftForm DEBUG:');
  console.log('  shiftData:', shiftData);
  console.log('  shiftData?.taximetre:', shiftData?.taximetre);
  console.log('  shiftData?.taximetre_prise_charge_fin:', shiftData?.taximetre_prise_charge_fin);
  console.log('  shiftData?.index_km_fin_tdb:', shiftData?.index_km_fin_tdb);
  console.log('  savedEndData:', savedEndData);

  // Créer les valeurs par défaut avec priorité correcte
  const getDefaultValues = () => {
    console.log('  🔄 getDefaultValues() appelée:');
    console.log('    shiftData au moment de getDefaultValues:', shiftData);
    console.log('    savedEndData au moment de getDefaultValues:', savedEndData);
    
    // Si on a des données sauvegardées ET qu'elles ne sont pas vides, les utiliser
    if (savedEndData && Object.keys(savedEndData).length > 0) {
      console.log('  ✅ Utilisation des données sauvegardées localStorage');
      return savedEndData;
    }

    // Sinon, utiliser les données du shift existant
    const defaultValues = {
      ...initialEndShiftData,
      // Pré-remplir avec les données existantes si disponibles
      heure_fin: shiftData?.heure_fin || '',
      interruptions: shiftData?.interruptions || '',
      km_tableau_bord_fin: shiftData?.index_km_fin_tdb || shiftData?.km_tableau_bord_fin || '',
      // Champs taximètre de fin avec données existantes du shift actuel
      taximetre_prise_charge_fin: shiftData?.taximetre?.taximetre_prise_charge_fin || shiftData?.taximetre_prise_charge_fin || '',
      taximetre_index_km_fin: shiftData?.taximetre?.taximetre_index_km_fin || shiftData?.taximetre_index_km_fin || '',
      taximetre_km_charge_fin: shiftData?.taximetre?.taximetre_km_charge_fin || shiftData?.taximetre_km_charge_fin || '',
      taximetre_chutes_fin: shiftData?.taximetre?.taximetre_chutes_fin || shiftData?.taximetre_chutes_fin || '',
      observations: shiftData?.observations || '',
      signature_chauffeur: shiftData?.signature_chauffeur || `${driver?.utilisateur?.prenom || 'Non défini'} ${driver?.utilisateur?.nom || 'Non défini'}`
    };

    console.log('  ✅ Utilisation des données du shift existant:', defaultValues);
    console.log('    defaultValues.taximetre_prise_charge_fin:', defaultValues.taximetre_prise_charge_fin);
    console.log('    defaultValues.km_tableau_bord_fin:', defaultValues.km_tableau_bord_fin);
    return defaultValues;
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(endShiftSchema),
    defaultValues: getDefaultValues()
  });

  // Effet pour mettre à jour les valeurs quand shiftData change
  useEffect(() => {
    console.log('  🔄 useEffect EndShiftForm déclenché !');
    console.log('    shiftData:', shiftData);
    console.log('    driver:', driver);
    
    if (shiftData) {
      console.log('  🔄 shiftData a changé, mise à jour du formulaire...');
      console.log('  📊 DEBUG shiftData complet:', shiftData);
      console.log('  🎯 DEBUG données taximètre dans shiftData:');
      console.log('    shiftData.taximetre_prise_charge_fin:', shiftData.taximetre_prise_charge_fin);
      console.log('    shiftData.taximetre_index_km_fin:', shiftData.taximetre_index_km_fin);
      console.log('    shiftData.taximetre_km_charge_fin:', shiftData.taximetre_km_charge_fin);
      console.log('    shiftData.taximetre_chutes_fin:', shiftData.taximetre_chutes_fin);
      console.log('    shiftData.taximetre:', shiftData.taximetre);
      
      // Ne pas écraser les données déjà saisies par l'utilisateur
      const currentValues = watch();
      
      // Une saisie utilisateur "significative" n'est pas juste des chaînes vides ou des zéros
      const hasSignificantUserInput = Object.entries(currentValues).some(([key, value]) => {
        // Ignorer les champs de signature et observations pour cette vérification
        if (key === 'signature_chauffeur' || key === 'observations') return false;
        
        // Une valeur significative n'est pas vide, null, undefined, ou "0"
        return value !== '' && value !== null && value !== undefined && value !== '0' && String(value).trim() !== '';
      });

      console.log('    currentValues:', currentValues);
      console.log('    hasSignificantUserInput:', hasSignificantUserInput);

      if (!hasSignificantUserInput) {
        console.log('  ✅ Aucune saisie utilisateur significative détectée, mise à jour des valeurs par défaut');
        const newValues = {
          heure_fin: shiftData.heure_fin || '',
          interruptions: shiftData.interruptions || '',
          km_tableau_bord_fin: shiftData.index_km_fin_tdb || shiftData.km_tableau_bord_fin || '',
          taximetre_prise_charge_fin: shiftData.taximetre?.taximetre_prise_charge_fin || shiftData.taximetre_prise_charge_fin || '',
          taximetre_index_km_fin: shiftData.taximetre?.taximetre_index_km_fin || shiftData.taximetre_index_km_fin || '',
          taximetre_km_charge_fin: shiftData.taximetre?.taximetre_km_charge_fin || shiftData.taximetre_km_charge_fin || '',
          taximetre_chutes_fin: shiftData.taximetre?.taximetre_chutes_fin || shiftData.taximetre_chutes_fin || '',
          observations: shiftData.observations || '',
          signature_chauffeur: shiftData.signature_chauffeur || `${driver?.utilisateur?.prenom || 'Non défini'} ${driver?.utilisateur?.nom || 'Non défini'}`
        };
        
        console.log('  📝 DEBUG newValues calculées:', newValues);
        console.log('  🔧 Application des valeurs avec reset()...');
        reset(newValues);
      } else {
        console.log('  ⚠️ Saisie utilisateur significative détectée, conservation des valeurs actuelles');
      }
    } else {
      console.log('  ❌ Pas de shiftData disponible pour le pré-remplissage');
    }
  }, [shiftData, reset, watch, driver]);

  // useEffect supplémentaire pour forcer le pré-remplissage des données taximètre
  useEffect(() => {
    if (shiftData?.taximetre || shiftData?.taximetre_prise_charge_fin) {
      console.log('  🎯 FORCE UPDATE: Données taximètre détectées, forçage de la mise à jour');
      
      const forceValues = {
        km_tableau_bord_fin: shiftData.index_km_fin_tdb || shiftData.km_tableau_bord_fin || '',
        taximetre_prise_charge_fin: shiftData.taximetre?.taximetre_prise_charge_fin || shiftData.taximetre_prise_charge_fin || '',
        taximetre_index_km_fin: shiftData.taximetre?.taximetre_index_km_fin || shiftData.taximetre_index_km_fin || '',
        taximetre_km_charge_fin: shiftData.taximetre?.taximetre_km_charge_fin || shiftData.taximetre_km_charge_fin || '',
        taximetre_chutes_fin: shiftData.taximetre?.taximetre_chutes_fin || shiftData.taximetre_chutes_fin || ''
      };
      
      console.log('  🔧 FORCE UPDATE values:', forceValues);
      
      // Mettre à jour seulement les champs taximètre et km tableau de bord
      Object.entries(forceValues).forEach(([fieldName, value]) => {
        if (value) {
          console.log(`    Updating ${fieldName} = ${value}`);
          setValue(fieldName, value);
        }
      });
    }
  }, [shiftData?.taximetre, shiftData?.taximetre_prise_charge_fin, shiftData?.taximetre_index_km_fin, shiftData?.taximetre_km_charge_fin, shiftData?.taximetre_chutes_fin, shiftData?.index_km_fin_tdb, shiftData?.km_tableau_bord_fin, setValue]);

  const watchedData = watch();

  // Auto-sauvegarde des données du formulaire
  useAutoSave(watchedData, 'endShiftFormData');

  // Récupérer heure_fin_estimee depuis les données sauvegardées du formulaire de début
  const heureFinEstimee = savedStartData?.heure_fin_estimee || shiftData?.heure_fin_estimee;

  // Calculer la durée réelle du shift
  const calculateActualShiftDuration = () => {
    if (shiftData?.heure_debut && watchedData.heure_fin) {
      const start = new Date(`2000-01-01T${shiftData.heure_debut}`);
      const end = new Date(`2000-01-01T${watchedData.heure_fin}`);
      const diff = end - start;
      
      // Soustraire les interruptions (en minutes)
      if (watchedData.interruptions && !isNaN(watchedData.interruptions)) {
        const interruptionsMs = Number(watchedData.interruptions) * 60 * 1000;
        const adjustedDiff = diff - interruptionsMs;
        
        if (adjustedDiff > 0) {
          const hours = Math.floor(adjustedDiff / (1000 * 60 * 60));
          const minutes = Math.floor((adjustedDiff % (1000 * 60 * 60)) / (1000 * 60));
          return `${hours}h${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return '0h00';
  };

  // Calculer la différence avec l'estimation
  const calculateDurationDifference = () => {
    const actual = calculateActualShiftDuration();
    const estimated = heureFinEstimee && shiftData?.heure_debut ? (() => {
      const start = new Date(`2000-01-01T${shiftData.heure_debut}`);
      const end = new Date(`2000-01-01T${heureFinEstimee}`);
      const diff = end - start;
      
      // Soustraire les interruptions (en minutes depuis le formulaire)
      if (watchedData.interruptions && !isNaN(watchedData.interruptions)) {
        const interruptionsMs = Number(watchedData.interruptions) * 60 * 1000;
        const adjustedDiff = diff - interruptionsMs;
        
        if (adjustedDiff > 0) {
          const hours = Math.floor(adjustedDiff / (1000 * 60 * 60));
          const minutes = Math.floor((adjustedDiff % (1000 * 60 * 60)) / (1000 * 60));
          return `${hours}h${minutes.toString().padStart(2, '0')}`;
        }
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    })() : '0h00';

    return { actual, estimated };
  };

  const onSubmit = (data) => {
    const endShiftData = {
      ...data,
      duree_reelle: calculateActualShiftDuration()
    };
    console.log('End shift data:', endShiftData);
    toast.success("Shift terminé avec succès!");
    onEndShift(endShiftData);
  };

  const { actual, estimated } = calculateDurationDifference();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-dark-100">
          Fin du Shift
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations générales */}
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-gray-800 dark:text-gray-200">
              Informations générales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Nom de l&apos;exploitant</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  {driver?.societe_taxi?.nom_exploitant || 'Non défini'}
                </p>
              </div>
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Chauffeur</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  {driver?.utilisateur?.prenom || 'Non défini'} {driver?.utilisateur?.nom || 'Non défini'}
                </p>
              </div>
            </div>
          </div>

          {/* Informations de fin */}
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-red-800 dark:text-red-200">
              Fin du shift
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Heure de fin"
                type="time"
                {...register("heure_fin")}
                error={errors?.heure_fin?.message}
              />
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée réelle</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  {actual}
                </p>
              </div>
              <div className="bg-white dark:bg-dark-700 p-3 rounded-lg border">
                <p className="text-sm text-gray-600 dark:text-gray-400">Durée estimée</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {estimated}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Input
                label="Interruptions (minutes)"
                type="number"
                min="0"
                step="1"
                {...register("interruptions")}
                error={errors?.interruptions?.message}
                placeholder="Durée totale des interruptions en minutes"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kilométrage Tableau de Bord fin"
              type="number"
              min="0"
              step="1"
              {...register("km_tableau_bord_fin")}
              error={errors?.km_tableau_bord_fin?.message}
            />
          </div>

          {/* Mesures de fin */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-green-800 dark:text-green-200">
              Mesures de fin de shift
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Taximètre: Prise en charge fin"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_prise_charge_fin")}
                error={errors?.taximetre_prise_charge_fin?.message}
              />
              <Input
                label="Taximètre: Index km (km totaux) fin"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_index_km_fin")}
                error={errors?.taximetre_index_km_fin?.message}
              />
              <Input
                label="Taximètre: Km en charge fin"
                type="number"
                min="0"
                step="1"
                {...register("taximetre_km_charge_fin")}
                error={errors?.taximetre_km_charge_fin?.message}
              />
              <Input
                label="Taximètre: Chutes (€) fin"
                type="number"
                min="0"
                step="0.01"
                {...register("taximetre_chutes_fin")}
                error={errors?.taximetre_chutes_fin?.message}
                className="md:col-span-2 lg:col-span-1"
              />
            </div>
          </div>

          {/* Observations */}
          <Textarea
            label="Observations"
            {...register("observations")}
            error={errors?.observations?.message}
            placeholder="Observations générales sur le shift, incidents, remarques..."
            rows={4}
          />

          {/* Signature */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium mb-4 text-blue-800 dark:text-blue-200">
              Signature du chauffeur
            </h4>
            <Input
              label="Nom et prénom pour signature"
              {...register("signature_chauffeur")}
              error={errors?.signature_chauffeur?.message}
              placeholder="Nom et prénom du chauffeur"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Cette signature apparaîtra sur la feuille de route imprimée
            </p>
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button 
              variant="outlined" 
              type="button"
              onClick={onPrintReport}
              className="flex items-center gap-2"
            >
              <PrinterIcon className="h-4 w-4" />
              Imprimer feuille de route
            </Button>
            <div className="flex gap-3">
              <Button variant="outlined" type="button">
                Sauvegarder en brouillon
              </Button>
              <Button type="submit" color="success" size="lg">
                Terminer le shift
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

EndShiftForm.propTypes = {
  onEndShift: PropTypes.func.isRequired,
  shiftData: PropTypes.object,
  driver: PropTypes.object,
  onPrintReport: PropTypes.func.isRequired
};
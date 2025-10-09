// Import Dependencies
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { PrinterIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useState } from "react";

// Local Imports
import { Card, Button, Input, Textarea } from "components/ui";
import { endShiftSchema } from "../schema";

// ----------------------------------------------------------------------

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

export function EndShiftForm({ onEndShift, onValidate, shiftData, driver, onPrintReport }) {
  // État de validation
  const [isValidated, setIsValidated] = useState(false);
  // ✅ État de chargement pour éviter les clics multiples
  const [isValidating, setIsValidating] = useState(false);

  // Debug: Afficher les données reçues
  console.log('🔍 EndShiftForm DEBUG:');
  console.log('  shiftData:', shiftData);
  console.log('  driver:', driver);

  // ✅ CORRECTION: Valeurs par défaut VIDES pour éviter le pré-remplissage
  const getDefaultValues = () => {
    console.log('  🔄 getDefaultValues() appelée pour EndShiftForm');
    
    // Signature pré-remplie avec le nom du chauffeur
    const signature = `${driver?.utilisateur?.prenom || ''} ${driver?.utilisateur?.nom || ''}`.trim();
    
    return {
      ...initialEndShiftData,
      signature_chauffeur: signature || 'Non défini',
      // ✅ Pré-remplir interruptions si déjà présentes dans shiftData
      interruptions: shiftData?.interruptions || ''
    };
  };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(endShiftSchema),
    defaultValues: getDefaultValues()
  });

  // ❌ SUPPRIMÉ: useEffect qui forçait le pré-remplissage avec des données de shift précédent
  // Cela causait le problème de pré-remplissage automatique incorrect
  
  const watchedData = watch();

  // ✅ Auto-sauvegarde désactivée pour éviter le pré-remplissage incorrect
  // useAutoSave(watchedData, 'endShiftFormData');

  // ✅ Récupérer heure_fin_estimee depuis shiftData uniquement
  const heureFinEstimee = shiftData?.heure_fin_estimee;

  // Fonction utilitaire pour normaliser le format d'heure
  const normalizeTimeFormat = (timeValue) => {
    if (!timeValue) return null;
    
    const timeStr = String(timeValue);
    
    // Si c'est une date ISO (contient 'T'), extraire la partie heure
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1]; // "06:00:00.000Z"
      return timePart.substring(0, 5); // "06:00"
    }
    
    // Si c'est déjà au format HH:MM ou HH:MM:SS, garder HH:MM
    if (timeStr.includes(':')) {
      return timeStr.substring(0, 5);
    }
    
    return timeStr;
  };

  // Calculer la durée réelle du shift
  const calculateActualShiftDuration = () => {
    if (shiftData?.heure_debut && watchedData.heure_fin) {
      const normalizedStart = normalizeTimeFormat(shiftData.heure_debut);
      const normalizedEnd = normalizeTimeFormat(watchedData.heure_fin);
      
      if (!normalizedStart || !normalizedEnd) {
        console.warn('🔴 Heures non valides:', { start: normalizedStart, end: normalizedEnd });
        return '0h00';
      }
      
      console.log('⏰ Calcul durée:', { start: normalizedStart, end: normalizedEnd });
      
      const start = new Date(`2000-01-01T${normalizedStart}:00`);
      const end = new Date(`2000-01-01T${normalizedEnd}:00`);
      
      let diff = end - start;
      
      // Si l'heure de fin est le jour suivant (ex: 23h -> 01h)
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000; // Ajouter 24h
      }
      
      // Soustraire les interruptions (en minutes)
      if (watchedData.interruptions && !isNaN(watchedData.interruptions)) {
        const interruptionsMs = Number(watchedData.interruptions) * 60 * 1000;
        diff = Math.max(0, diff - interruptionsMs);
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const result = `${hours}h${minutes.toString().padStart(2, '0')}`;
      
      console.log('✅ Durée calculée:', result);
      return result;
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
    console.log('🔍 EndShiftForm - Données brutes du formulaire:', data);
    
    const endShiftData = {
      ...data,
      duree_reelle: calculateActualShiftDuration()
    };
    
    console.log('🔍 EndShiftForm - Données envoyées avec durée calculée:', endShiftData);
    toast.success("Shift terminé avec succès!");
    onEndShift(endShiftData);
  };

  // Fonction de validation sans terminer le shift
  // Fonction de validation sans terminer le shift
  const handleValidate = async () => {
    // ✅ Éviter les clics multiples pendant la validation
    if (isValidating) {
      console.log('🔍 EndShiftForm - Validation déjà en cours, ignorée');
      return;
    }

    setIsValidating(true);
    console.log('🔍 EndShiftForm - Validation déclenchée');

    try {
      // Utiliser watch() pour obtenir les valeurs actuelles
      const currentValues = watch();
      console.log('🔍 EndShiftForm - Valeurs actuelles du formulaire (watch):', currentValues);

      // ✅ APPROCHE COMPATIBLE NAVIGATEUR: Validation synchrone d'abord
      const isValid = trigger(); // Validation synchrone pour compatibilité navigateur
      console.log('🔍 EndShiftForm - Résultat de validation synchrone:', isValid);

      // ✅ FALLBACK: Si la validation synchrone échoue, attendre un court instant et réessayer
      let finalIsValid = isValid;
      if (!isValid) {
        console.log('🔍 EndShiftForm - Tentative de validation asynchrone...');
        // Petit délai pour laisser le temps au navigateur de synchroniser
        await new Promise(resolve => setTimeout(resolve, 50));
        finalIsValid = await trigger();
        console.log('🔍 EndShiftForm - Résultat de validation asynchrone:', finalIsValid);
      }

      if (finalIsValid) {
        // Rafraîchir les valeurs après validation
        const updatedValues = watch();
        const formData = { ...updatedValues };
        console.log('🔍 EndShiftForm - Données validées:', formData);

        const endShiftData = {
          ...formData,
          duree_reelle: calculateActualShiftDuration()
        };

        console.log('🔍 EndShiftForm - Données finales envoyées:', endShiftData);

        // ✅ Appeler onValidate pour sauvegarder SANS terminer le shift
        const success = await onValidate(endShiftData);

        if (success) {
          setIsValidated(true);
          toast.success("Données validées et enregistrées avec succès!");
        }
      } else {
        console.log('❌ EndShiftForm - Validation échouée, erreurs:', errors);
        toast.error("Veuillez corriger les erreurs dans le formulaire");
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error);
      toast.error("Erreur lors de la validation des données");
    } finally {
      setIsValidating(false);
    }
  };

  // Handler pour le bouton d'impression
  const handlePrint = () => {
    if (!isValidated) {
      toast.warning("Veuillez d'abord valider les données avant d'imprimer");
      return;
    }
    onPrintReport();
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
            <div className="flex gap-3">
              <Button 
                variant="outlined" 
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2"
                disabled={!isValidated}
              >
                <PrinterIcon className="h-4 w-4" />
                Imprimer feuille de route
              </Button>
              
              <Button 
                variant="outlined"
                type="button" 
                onClick={(e) => {
                  // ✅ Prévention des clics multiples pour compatibilité navigateur
                  e.preventDefault();
                  e.stopPropagation();
                  handleValidate();
                }}
                disabled={isValidated || isValidating}
                className="flex items-center gap-2"
              >
                {isValidating ? (
                  <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}
                {isValidating ? 'Validation...' : 'Valider'}
              </Button>
            </div>
            
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
  onValidate: PropTypes.func.isRequired,
  shiftData: PropTypes.object,
  driver: PropTypes.object,
  onPrintReport: PropTypes.func.isRequired
};
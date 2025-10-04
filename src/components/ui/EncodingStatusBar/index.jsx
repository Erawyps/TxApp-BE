// Import Dependencies
import { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { 
  Cog6ToothIcon,
  InformationCircleIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// Local Imports
import { Card, Button, EncodingModeSelector } from 'components/ui';
import { useEncodingMode } from 'hooks/useEncodingMode';

// ----------------------------------------------------------------------

export function EncodingStatusBar({ 
  className,
  onModeChange,
  showSettings = true,
  compact = false 
}) {
  const [showSelector, setShowSelector] = useState(false);
  
  const {
    currentMode,
    allowedModes,
    modeInfo,
    changeMode,
    isChanging,
    isLiveMode,
    isDeferredMode,
    isAdminMode
  } = useEncodingMode({
    onModeChange: async (newMode, oldMode) => {
      console.log(`🔄 Changement de mode : ${oldMode} → ${newMode}`);
      onModeChange?.(newMode, oldMode);
    }
  });

  const handleModeChange = async (newMode) => {
    const success = await changeMode(newMode);
    if (success) {
      setShowSelector(false);
    }
  };

  const getStatusMessage = () => {
    if (isLiveMode) {
      return "Vous encodez en temps réel";
    } else if (isDeferredMode) {
      return "Encodage différé activé";
    } else if (isAdminMode) {
      return "Mode administrateur actif";
    }
    return "Mode d'encodage actif";
  };

  if (compact) {
    return (
      <div className={clsx("flex items-center gap-2", className)}>
        <EncodingModeSelector 
          value={currentMode}
          onChange={handleModeChange}
          allowedModes={allowedModes}
          showBadgeOnly={true}
          disabled={isChanging}
        />
      </div>
    );
  }

  return (
    <Card className={clsx(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Informations du mode actuel */}
          <div className="flex items-center gap-3">
            <div className={clsx(
              "p-2 rounded-lg",
              isLiveMode && "bg-green-100 dark:bg-green-900/20",
              isDeferredMode && "bg-orange-100 dark:bg-orange-900/20", 
              isAdminMode && "bg-blue-100 dark:bg-blue-900/20"
            )}>
              {modeInfo.icon ? (
                <modeInfo.icon className={clsx(
                  "h-5 w-5",
                  isLiveMode && "text-green-600 dark:text-green-400",
                  isDeferredMode && "text-orange-600 dark:text-orange-400",
                  isAdminMode && "text-blue-600 dark:text-blue-400"
                )} />
              ) : (
                <BoltIcon className="h-5 w-5 text-gray-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Mode d&apos;encodage : {modeInfo.label}
                </h3>
                <EncodingModeSelector 
                  value={currentMode}
                  onChange={handleModeChange}
                  allowedModes={allowedModes}
                  showBadgeOnly={true}
                  disabled={isChanging}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getStatusMessage()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {allowedModes.length > 1 && showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSelector(!showSelector)}
                disabled={isChanging}
                icon={<Cog6ToothIcon className="h-4 w-4" />}
              >
                Changer
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              icon={<InformationCircleIcon className="h-4 w-4" />}
              onClick={() => {
                const infoMessage = `
ℹ️ Modes d'encodage disponibles :

🟢 EN DIRECT (LIVE)
• Encodage en temps réel
• Courses enregistrées immédiatement
• Recommandé pour l'usage normal

🟠 ULTÉRIEUR (DIFFÉRÉ)  
• Encodage après les courses
• Permet de saisir les données plus tard
• Utile pour récupérer des courses oubliées

${allowedModes.includes('ADMIN') ? `🟣 ADMINISTRATEUR
• Accès administrateur complet
• Fonctionnalités avancées
• Réservé aux administrateurs` : ''}

Mode actuel : ${modeInfo.label}
                `.trim();
                alert(infoMessage);
              }}
            />
          </div>
        </div>

        {/* Sélecteur de mode (étendu) */}
        {showSelector && allowedModes.length > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Choisir un mode d&apos;encodage :
            </h4>
            <EncodingModeSelector 
              value={currentMode}
              onChange={handleModeChange}
              allowedModes={allowedModes}
              disabled={isChanging}
            />
          </div>
        )}

        {/* Indicateur de changement */}
        {isChanging && (
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            Changement de mode en cours...
          </div>
        )}
      </div>
    </Card>
  );
}

EncodingStatusBar.propTypes = {
  className: PropTypes.string,
  onModeChange: PropTypes.func,
  showSettings: PropTypes.bool,
  compact: PropTypes.bool
};

export default EncodingStatusBar;
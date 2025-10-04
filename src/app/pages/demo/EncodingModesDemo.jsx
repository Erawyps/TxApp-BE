// Import Dependencies
import { useState } from 'react';
import { Page } from 'components/shared/Page';
import { 
  EncodingModeSelector, 
  EncodingStatusBar, 
  EncodingModeBadge,
  Card,
  Button
} from 'components/ui';

// ----------------------------------------------------------------------

/**
 * Page de démonstration pour les composants de mode d'encodage
 * Accessible via /demo/encoding-modes
 */
export default function EncodingModesDemo() {
  const [currentMode, setCurrentMode] = useState('LIVE');
  const [allowedModes, setAllowedModes] = useState(['LIVE', 'ULTERIEUR']);

  const handleModeChange = (newMode, oldMode) => {
    console.log(`🔄 Demo - Changement de mode : ${oldMode || 'N/A'} → ${newMode}`);
    setCurrentMode(newMode);
  };

  const switchToAdminModes = () => {
    setAllowedModes(['LIVE', 'ULTERIEUR', 'ADMIN']);
  };

  const switchToDriverModes = () => {
    setAllowedModes(['LIVE', 'ULTERIEUR']);
  };

  return (
    <Page title="Démo - Modes d'Encodage">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* En-tête avec badge */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Démonstration - Modes d&apos;Encodage
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Test des composants de sélection de mode d&apos;encodage
              </p>
            </div>
            <EncodingModeBadge onModeChange={handleModeChange} />
          </div>
        </Card>

        {/* Contrôles de test */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Contrôles de test</h2>
          <div className="flex gap-4 mb-4">
            <Button onClick={switchToDriverModes} variant="outline">
              Mode Chauffeur (LIVE + ULTÉRIEUR)
            </Button>
            <Button onClick={switchToAdminModes} variant="outline">
              Mode Admin (TOUS)
            </Button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Mode actuel :</strong> {currentMode} <br />
            <strong>Modes autorisés :</strong> {allowedModes.join(', ')}
          </div>
        </Card>

        {/* Barre de statut complète */}
        <EncodingStatusBar 
          onModeChange={handleModeChange}
          className="max-w-2xl mx-auto"
        />

        {/* Sélecteur individuel */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Sélecteur de Mode</h2>
          <div className="max-w-md">
            <EncodingModeSelector
              value={currentMode}
              onChange={handleModeChange}
              allowedModes={allowedModes}
            />
          </div>
        </Card>

        {/* Sélecteur en badge uniquement */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Affichage Badge Seul</h2>
          <div className="max-w-md">
            <EncodingModeSelector
              value={currentMode}
              onChange={handleModeChange}
              allowedModes={allowedModes}
              showBadgeOnly={true}
            />
          </div>
        </Card>

        {/* Exemples d'intégration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Exemples d&apos;intégration</h2>
          
          {/* Simulation header */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Header d&apos;application</h3>
              <EncodingModeBadge />
            </div>
          </div>

          {/* Simulation formulaire */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Formulaire de course</h3>
              <EncodingModeBadge />
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-white dark:bg-gray-700 rounded border"></div>
              <div className="h-8 bg-white dark:bg-gray-700 rounded border"></div>
              <div className="h-8 bg-white dark:bg-gray-700 rounded border"></div>
            </div>
          </div>

          {/* Simulation dashboard */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Dashboard Chauffeur</h3>
            <EncodingStatusBar 
              onModeChange={handleModeChange}
              compact={false}
              showSettings={true}
            />
          </div>
        </Card>

        {/* Informations techniques */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informations techniques</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Hook utilisé :</strong> useEncodingMode</div>
            <div><strong>Persistance :</strong> localStorage (&apos;tx-app-encoding-mode&apos;)</div>
            <div><strong>Composants :</strong> EncodingModeSelector, EncodingStatusBar, EncodingModeBadge</div>
            <div><strong>Permissions :</strong> Basées sur le rôle utilisateur</div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
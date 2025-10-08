import React from 'react';
import { EncodingModeSelector } from 'components/ui';
import { useEncodingMode } from 'hooks/useEncodingMode';

// Composant de test simple pour vérifier le sélecteur de mode
function TestModeSelector() {
  const { 
    currentMode, 
    allowedModes, 
    changeMode, 
    isChanging,
    modeInfo 
  } = useEncodingMode({
    defaultMode: 'LIVE'
  });

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test Sélecteur de Mode</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mode d'encodage actuel: {currentMode}
          </label>
          <EncodingModeSelector
            value={currentMode}
            onChange={changeMode}
            allowedModes={allowedModes}
            disabled={isChanging}
            className="w-full"
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium">Informations du mode:</h3>
          <p><strong>Label:</strong> {modeInfo.label}</p>
          <p><strong>Description:</strong> {modeInfo.description}</p>
          <p><strong>Modes autorisés:</strong> {allowedModes.join(', ')}</p>
        </div>
      </div>
    </div>
  );
}

export default TestModeSelector;
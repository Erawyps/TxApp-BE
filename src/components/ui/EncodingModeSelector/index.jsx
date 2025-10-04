// Import Dependencies
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { 
  BoltIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Local Imports
import { Badge } from '../Badge';
import { Card } from '../Card';

// ----------------------------------------------------------------------

const ENCODING_MODES = {
  LIVE: {
    id: 'LIVE',
    label: 'En Direct',
    description: 'Encodage en temps réel',
    icon: BoltIcon,
    color: 'success',
    badge: { text: 'LIVE', variant: 'filled' }
  },
  ULTERIEUR: {
    id: 'ULTERIEUR',
    label: 'Ultérieur',
    description: 'Encodage différé',
    icon: ClockIcon,
    color: 'warning',
    badge: { text: 'DIFFÉRÉ', variant: 'filled' }
  },
  ADMIN: {
    id: 'ADMIN',
    label: 'Administrateur',
    description: 'Mode administrateur',
    icon: ShieldCheckIcon,
    color: 'primary',
    badge: { text: 'ADMIN', variant: 'filled' }
  }
};

export function EncodingModeSelector({ 
  value = 'LIVE', 
  onChange, 
  allowedModes = ['LIVE', 'ULTERIEUR'],
  showBadgeOnly = false,
  className,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState(value);

  useEffect(() => {
    setSelectedMode(value);
  }, [value]);

  const currentMode = ENCODING_MODES[selectedMode] || ENCODING_MODES.LIVE;
  const filteredModes = allowedModes.map(mode => ENCODING_MODES[mode]).filter(Boolean);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id);
    onChange?.(mode.id);
    setIsOpen(false);
  };

  // Mode badge uniquement
  if (showBadgeOnly) {
    return (
      <div className={clsx("flex items-center gap-2", className)}>
        <Badge 
          color={currentMode.color} 
          variant={currentMode.badge.variant}
          className="text-xs font-medium"
        >
          {currentMode.badge.text}
        </Badge>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Mode : {currentMode.label}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("relative", className)}>
      {/* Sélecteur de mode */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg",
          "hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={clsx(
            "p-2 rounded-lg",
            currentMode.color === 'success' && "bg-green-100 dark:bg-green-900/20",
            currentMode.color === 'warning' && "bg-orange-100 dark:bg-orange-900/20",
            currentMode.color === 'primary' && "bg-blue-100 dark:bg-blue-900/20"
          )}>
            <currentMode.icon className={clsx(
              "h-5 w-5",
              currentMode.color === 'success' && "text-green-600 dark:text-green-400",
              currentMode.color === 'warning' && "text-orange-600 dark:text-orange-400",
              currentMode.color === 'primary' && "text-blue-600 dark:text-blue-400"
            )} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {currentMode.label}
              </span>
              <Badge 
                color={currentMode.color} 
                variant={currentMode.badge.variant}
                className="text-xs"
              >
                {currentMode.badge.text}
              </Badge>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentMode.description}
            </span>
          </div>
        </div>
        
        {!disabled && filteredModes.length > 1 && (
          <ChevronDownIcon 
            className={clsx(
              "h-5 w-5 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        )}
      </button>

      {/* Dropdown des modes */}
      {isOpen && !disabled && filteredModes.length > 1 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="p-2 space-y-1">
            {filteredModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleModeSelect(mode)}
                className={clsx(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left",
                  "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150",
                  selectedMode === mode.id && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                )}
              >
                <div className={clsx(
                  "p-2 rounded-lg",
                  mode.color === 'success' && "bg-green-100 dark:bg-green-900/20",
                  mode.color === 'warning' && "bg-orange-100 dark:bg-orange-900/20",
                  mode.color === 'primary' && "bg-blue-100 dark:bg-blue-900/20"
                )}>
                  <mode.icon className={clsx(
                    "h-5 w-5",
                    mode.color === 'success' && "text-green-600 dark:text-green-400",
                    mode.color === 'warning' && "text-orange-600 dark:text-orange-400",
                    mode.color === 'primary' && "text-blue-600 dark:text-blue-400"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {mode.label}
                    </span>
                    <Badge 
                      color={mode.color} 
                      variant={mode.badge.variant}
                      className="text-xs"
                    >
                      {mode.badge.text}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {mode.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

EncodingModeSelector.propTypes = {
  value: PropTypes.oneOf(['LIVE', 'ULTERIEUR', 'ADMIN']),
  onChange: PropTypes.func,
  allowedModes: PropTypes.arrayOf(PropTypes.oneOf(['LIVE', 'ULTERIEUR', 'ADMIN'])),
  showBadgeOnly: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool
};

export default EncodingModeSelector;
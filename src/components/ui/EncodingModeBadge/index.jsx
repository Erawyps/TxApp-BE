// Import Dependencies  
import PropTypes from 'prop-types';
import { EncodingStatusBar } from 'components/ui/EncodingStatusBar';

// ----------------------------------------------------------------------

/**
 * Composant compact pour afficher le mode d'encodage actuel
 * Utilisé dans les headers, barres de navigation, etc.
 */
export function EncodingModeBadge({ 
  className, 
  onModeChange
}) {
  return (
    <EncodingStatusBar
      compact={true}
      className={className}
      onModeChange={onModeChange}
      showSettings={false}
    />
  );
}

EncodingModeBadge.propTypes = {
  className: PropTypes.string,
  onModeChange: PropTypes.func
};

export default EncodingModeBadge;
// components/SummaryItem.jsx
import PropTypes from 'prop-types';
import { BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export function SummaryItem({
  label,
  value,
  icon = 'default',
  color = 'primary',
  highlight = false,
  className = ''
}) {
  // Configuration des icônes
  const iconMap = {
    revenue: <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />,
    expense: <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />,
    default: <BanknotesIcon className="h-5 w-5 text-primary-500" />,
    custom: icon
  };

  // Configuration des couleurs
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    gray: 'text-gray-600 dark:text-gray-300'
  };

  // Sélection de l'icône
  const selectedIcon = typeof icon === 'string' ? iconMap[icon] || iconMap.default : iconMap.custom;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
      highlight 
        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800' 
        : 'hover:bg-gray-50 dark:hover:bg-dark-600'
    } ${className}`}>
      <div className="flex items-center gap-2">
        {selectedIcon && (
          <span className={`flex-shrink-0 ${
            highlight 
              ? 'text-primary-600 dark:text-primary-300' 
              : colorClasses[color].replace('text-', 'text-opacity-80 text-')
          }`}>
            {selectedIcon}
          </span>
        )}
        <span className={`${
          highlight 
            ? 'font-semibold text-gray-900 dark:text-white' 
            : 'text-gray-700 dark:text-dark-200'
        }`}>
          {label}
        </span>
      </div>
      <span className={`font-mono ${
        highlight ? 'font-bold' : 'font-medium'
      } ${colorClasses[color]}`}>
        {typeof value === 'number' ? value.toFixed(2) : value} €
      </span>
    </div>
  );
}

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
    PropTypes.oneOf(['revenue', 'expense', 'default'])
  ]),
  color: PropTypes.oneOf(['primary', 'green', 'red', 'blue', 'gray']),
  highlight: PropTypes.bool,
  className: PropTypes.string
};
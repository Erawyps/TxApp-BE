// src/components/ui/Tabs.jsx
import clsx from 'clsx';
import PropTypes from 'prop-types';

export const TabGroup = ({ children, className }) => {
  return (
    <div className={clsx('flex border-b border-gray-200 dark:border-dark-500', className)}>
      {children}
    </div>
  );
};

TabGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export const TabItem = ({ 
  active, 
  onClick, 
  children, 
  icon, 
  badge,
  disabled,
  className 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'flex items-center justify-center px-4 py-2 text-sm font-medium relative',
        'focus:outline-none',
        active 
          ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && (
        <span className="mr-2">
          {typeof icon === 'string' ? (
            <i className={`icon-${icon}`} />
          ) : (
            icon
          )}
        </span>
      )}
      {children}
      {badge !== undefined && (
        <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
          {badge}
        </span>
      )}
    </button>
  );
};

TabItem.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  badge: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export const TabPanel = ({ children, active }) => {
  return active ? <div className="py-4">{children}</div> : null;
};

TabPanel.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool
};
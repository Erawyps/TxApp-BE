// components/ui/Tabs.jsx
import React, { Fragment } from 'react';
import { Tab as HeadlessTab } from '@headlessui/react';
import clsx from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export const TabGroup = ({ children, className, vertical = false }) => {
  return (
    <HeadlessTab.Group
      as="div"
      className={clsx(
        vertical ? 'flex flex-row items-start gap-6' : 'flex flex-col',
        className
      )}
    >
      {children}
    </HeadlessTab.Group>
  );
};

export const TabList = ({ children, className, vertical = false }) => {
  return (
    <HeadlessTab.List
      className={clsx(
        'flex min-w-fit',
        vertical
          ? 'flex-col border-r border-gray-200 pr-6 dark:border-dark-500'
          : 'border-b border-gray-200 dark:border-dark-500',
        className
      )}
    >
      {children}
    </HeadlessTab.List>
  );
};

export const Tab = ({ children, icon, badge, className, vertical = false }) => {
  return (
    <HeadlessTab as={Fragment}>
      {({ selected }) => (
        <button
          className={clsx(
            'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium outline-none transition-all',
            'focus-visible:ring-2 focus-visible:ring-primary-500',
            selected
              ? vertical
                ? 'text-primary-600 border-r-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            className
          )}
        >
          {icon && <span className="h-5 w-5">{icon}</span>}
          <span>{children}</span>
          {badge !== undefined && (
            <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
              {badge}
            </span>
          )}
        </button>
      )}
    </HeadlessTab>
  );
};

export const TabPanels = ({ children, className }) => {
  return (
    <HeadlessTab.Panels className={clsx('flex-1', className)}>
      {children}
    </HeadlessTab.Panels>
  );
};

export const TabPanel = ({ children, className }) => {
  return (
    <HeadlessTab.Panel className={clsx('h-full', className)}>
      {children}
    </HeadlessTab.Panel>
  );
};

export const MobileTabSelect = ({ tabs, selectedIndex, onChange }) => {
  return (
    <div className="relative sm:hidden">
      <select
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-700"
        value={selectedIndex}
        onChange={(e) => onChange(parseInt(e.target.value))}
      >
        {tabs.map((tab, idx) => (
          <option key={idx} value={idx}>
            {tab.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
};

// Main Tabs component that accepts value and onChange
export const Tabs = ({ value, onChange, children, className }) => {
  // Find all TabNav components recursively and get their values
  const findTabNavs = (children) => {
    const tabNavs = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === Tab) {
          tabNavs.push(child);
        } else if (child.props && child.props.children) {
          tabNavs.push(...findTabNavs(child.props.children));
        }
      }
    });
    return tabNavs;
  };

  const tabNavs = findTabNavs(children);
  const selectedIndex = tabNavs.findIndex(tab => tab.props.value === value);

  return (
    <HeadlessTab.Group 
      selectedIndex={selectedIndex >= 0 ? selectedIndex : 0} 
      onChange={(index) => {
        const tabNav = tabNavs[index];
        if (tabNav && tabNav.props.value && onChange) {
          onChange(tabNav.props.value);
        }
      }}
      className={className}
    >
      {children}
    </HeadlessTab.Group>
  );
};

// Add TabNav as an alias for Tab
Tabs.TabList = TabList;
Tabs.TabNav = Tab;
Tabs.TabPanels = TabPanels;
Tabs.TabPanel = TabPanel;

// Export as a compound component for backward compatibility
const TabsObject = {
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabNav: Tab, // Alias for Tab
  MobileTabSelect
};

export default TabsObject;
export { TabsObject as TabsComponents };
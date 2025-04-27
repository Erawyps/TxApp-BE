import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
  } from "@headlessui/react";
  import {
    ArrowUpTrayIcon,
    EllipsisVerticalIcon,
    DocumentChartBarIcon,
    PrinterIcon
  } from "@heroicons/react/24/outline";
  import clsx from "clsx";
  import { Fragment } from "react";
  
  // Local Imports
  import { Button } from "components/ui";
  
  export function MenuAction() {
    return (
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          as={Button}
          variant="flat"
          className="size-8 shrink-0 rounded-full p-0"
        >
          <EllipsisVerticalIcon className="size-4.5 stroke-2" />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-soft shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                  )}
                >
                  <ArrowUpTrayIcon className="size-4.5" />
                  <span>Exporter Excel</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                  )}
                >
                  <DocumentChartBarIcon className="size-4.5" />
                  <span>Exporter PDF</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                    focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                  )}
                >
                  <PrinterIcon className="size-4.5" />
                  <span>Imprimer</span>
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    );
  }
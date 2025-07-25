// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
  ArrowUpTrayIcon,
  PrinterIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Button, GhostSpinner } from "components/ui";

// ----------------------------------------------------------------------

export function SelectedRowsActions({ table }) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const selectedRows = table.getSelectedRowModel().rows;

  const handleDeleteRows = () => {
    if (selectedRows.length > 0) {
      setDeleteLoading(true);
      setTimeout(() => {
        table.options.meta?.deleteRows(selectedRows);
        setDeleteLoading(false);
      }, 1000);
    }
  };

  const handleExportRows = () => {
    setExportLoading(true);
    // Simulate export
    setTimeout(() => {
      console.log("Exporting rows:", selectedRows);
      setExportLoading(false);
    }, 1500);
  };

  return (
    <Transition
      as={Fragment}
      show={table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()}
      enter="transition-all duration-200"
      enterFrom="opacity-0 translate-y-4"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-4"
    >
      <div className="pointer-events-none sticky inset-x-0 bottom-0 z-5 flex items-center justify-end">
        <div className="w-full max-w-xl px-2 py-4 sm:absolute sm:-translate-y-1/2 sm:px-4">
          <div className="pointer-events-auto flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 font-medium text-gray-100 dark:bg-dark-50 dark:text-dark-900 sm:px-4 sm:py-3">
            <p>
              <span>{selectedRows.length} Sélectionné(s)</span>
              <span className="max-sm:hidden">
                {" "}
                sur {table.getCoreRowModel().rows.length}
              </span>
            </p>
            <div className="flex space-x-1.5">
              <Button
                onClick={handleDeleteRows}
                className="w-7 space-x-1.5 rounded-full px-3 py-1.5 text-xs-plus sm:w-auto sm:rounded-sm"
                color="error"
                disabled={deleteLoading || selectedRows.length <= 0}
              >
                {deleteLoading ? (
                  <div className="flex size-4 items-center justify-center">
                    <GhostSpinner
                      className="size-3.5 shrink-0 border-2"
                      variant="soft"
                    />
                  </div>
                ) : (
                  <TrashIcon className="size-4 shrink-0" />
                )}
                <span className="max-sm:hidden">Supprimer</span>
              </Button>
              <Button 
                onClick={handleExportRows}
                className="w-7 space-x-1.5 rounded-full px-3 py-1.5 text-xs-plus sm:w-auto sm:rounded-sm"
                disabled={exportLoading || selectedRows.length <= 0}
              >
                {exportLoading ? (
                  <div className="flex size-4 items-center justify-center">
                    <GhostSpinner
                      className="size-3.5 shrink-0 border-2"
                      variant="soft"
                    />
                  </div>
                ) : (
                  <ArrowUpTrayIcon className="size-4 shrink-0" />
                )}
                <span className="max-sm:hidden">Exporter</span>
              </Button>
              <Button className="w-7 space-x-1.5 rounded-full px-3 py-1.5 text-xs-plus sm:w-auto sm:rounded-sm">
                <PrinterIcon className="size-4 shrink-0" />
                <span className="max-sm:hidden">Imprimer</span>
              </Button>
              <Menu as="div" className="relative inline-block text-left">
                <MenuButton
                  as={Button}
                  className="w-7 space-x-1.5 rounded-full px-3 py-1.5 text-xs-plus sm:w-auto sm:rounded-sm"
                >
                  <EllipsisHorizontalIcon className="size-4 shrink-0" />
                  <span className="max-sm:hidden"> Plus</span>
                </MenuButton>
                <Transition
                  as={MenuItems}
                  enter="transition ease-out"
                  enterFrom="opacity-0 translate-y-2"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-2"
                  className="absolute z-100 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 text-xs-plus text-gray-600 shadow-soft outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:text-dark-200 dark:shadow-none"
                  anchor={{ to: "top end", gap: 6 }}
                >
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        className={clsx(
                          "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                          focus &&
                            "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                        )}
                      >
                        <DocumentDuplicateIcon className="size-4.5" />
                        <span>Dupliquer</span>
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        className={clsx(
                          "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                          focus &&
                            "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                        )}
                      >
                        <ArrowUpTrayIcon className="size-4.5" />
                        <span>Exporter PDF</span>
                      </button>
                    )}
                  </MenuItem>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}

SelectedRowsActions.propTypes = {
  table: PropTypes.object,
};
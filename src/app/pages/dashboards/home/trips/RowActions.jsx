import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    Transition,
  } from "@headlessui/react";
  import {
    ChevronUpIcon,
    EllipsisHorizontalIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CurrencyEuroIcon,
    DocumentTextIcon
  } from "@heroicons/react/24/outline";
  import clsx from "clsx";
  import { useCallback, useState } from "react";
  import PropTypes from "prop-types";
  
  // Local Imports
  import { ConfirmModal } from "components/shared/ConfirmModal";
  import { Button } from "components/ui";
  
  // ----------------------------------------------------------------------
  
  const confirmMessages = {
    pending: {
      title: "Confirmer la suppression",
      description: "Êtes-vous sûr de vouloir supprimer cette course? Cette action est irréversible."
    },
    success: {
      title: "Course supprimée",
      description: "La course a été supprimée avec succès."
    },
    error: {
      title: "Erreur",
      description: "Une erreur est survenue lors de la suppression."
    }
  };
  
  export function RowActions({ row, table }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState(false);
  
    const closeModal = () => {
      setDeleteModalOpen(false);
    };
  
    const openModal = () => {
      setDeleteModalOpen(true);
      setDeleteError(false);
      setDeleteSuccess(false);
    };
  
    const handleDeleteRows = useCallback(() => {
      setConfirmDeleteLoading(true);
      setTimeout(() => {

          table.options.meta?.deleteRow(row);
          setDeleteSuccess(true);
          setTimeout(() => closeModal(), 1500);
        
          setDeleteError(true);
        } 
      , 1000);
    }, [row, table]);
  
    const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";
  
    return (
      <>
        <div className="flex justify-center gap-1">
          {row.getCanExpand() && (
            <Button
              isIcon
              className="size-7 rounded-full"
              variant="flat"
              onClick={row.getToggleExpandedHandler()}
            >
              <ChevronUpIcon
                className={clsx(
                  "size-4.5 transition-transform",
                  row.getIsExpanded() && "rotate-180"
                )}
              />
            </Button>
          )}
          
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton
              as={Button}
              variant="flat"
              isIcon
              className="size-7 rounded-full"
            >
              <EllipsisHorizontalIcon className="size-4.5" />
            </MenuButton>
            <Transition
              enter="transition ease-out"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none ltr:right-0 rtl:left-0">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      className={clsx(
                        "flex h-9 w-full items-center space-x-3 px-3 tracking-wide outline-hidden transition-colors",
                        focus && "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100"
                      )}
                    >
                      <EyeIcon className="size-4.5 stroke-1" />
                      <span>Détails</span>
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
                      <PencilIcon className="size-4.5 stroke-1" />
                      <span>Modifier</span>
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
                      <CurrencyEuroIcon className="size-4.5 stroke-1" />
                      <span>Marquer payé</span>
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
                      <DocumentTextIcon className="size-4.5 stroke-1" />
                      <span>Générer facture</span>
                    </button>
                  )}
                </MenuItem>
                <div className="border-t border-gray-200 dark:border-dark-500 my-1"></div>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={openModal}
                      className={clsx(
                        "flex h-9 w-full items-center space-x-3 px-3 tracking-wide text-red-600 outline-hidden transition-colors dark:text-red-400",
                        focus && "bg-red-50 dark:bg-red-500/10"
                      )}
                    >
                      <TrashIcon className="size-4.5 stroke-1" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
  
        <ConfirmModal
          show={deleteModalOpen}
          onClose={closeModal}
          messages={confirmMessages}
          onOk={handleDeleteRows}
          confirmLoading={confirmDeleteLoading}
          state={state}
          cancelText="Annuler"
          confirmText="Supprimer"
          confirmColor="danger"
        />
      </>
    );
  }
  
  RowActions.propTypes = {
    row: PropTypes.object,
    table: PropTypes.object,
  };
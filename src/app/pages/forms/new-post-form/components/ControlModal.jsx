// Import Dependencies
import { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// ----------------------------------------------------------------------

export function ControlModal({ isOpen, onClose, driver, vehicle, shiftData, courses }) {
  const companyInfo = {
    nom: "TxApp Taxi Company",
    adresse: "123 Rue de la Paix, 1000 Bruxelles",
    telephone: "+32 2 123 45 67",
    certificat: "TC-2024-001"
  };

  // Calculs pour le contrôle
  const totalTaximetre = courses.reduce((sum, course) => sum + (course.prix_taximetre || 0), 0);
  const totalFeuilleRoute = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);
  const difference = totalTaximetre - totalFeuilleRoute;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mode Contrôle - Police/SPOE
                  </DialogTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <PrinterIcon className="h-4 w-4" />
                      Imprimer
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Informations compagnie */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Informations de la Compagnie</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Nom de la compagnie</p>
                        <p className="font-medium text-gray-900 dark:text-white">{companyInfo.nom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Certificat de capacité</p>
                        <p className="font-medium text-gray-900 dark:text-white">{companyInfo.certificat}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Adresse</p>
                        <p className="font-medium text-gray-900 dark:text-white">{companyInfo.adresse}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Téléphone</p>
                        <p className="font-medium text-gray-900 dark:text-white">{companyInfo.telephone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Informations chauffeur et véhicule */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Informations du Service</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Chauffeur</p>
                        <p className="font-medium text-gray-900 dark:text-white">{driver.prenom} {driver.nom}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Badge: {driver.numero_badge}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Licence: {driver.media || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Véhicule</p>
                        <p className="font-medium text-gray-900 dark:text-white">{vehicle.plaque_immatriculation}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">N° identification: {vehicle.numero_identification}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service et compteurs */}
                  {shiftData && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Service et Compteurs</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Heure début</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shiftData.heure_debut || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Heure fin</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shiftData.heure_fin || 'En cours'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Index km début</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shiftData.index_km_debut || 'N/A'} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Index km fin</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shiftData.index_km_fin || 'En cours'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comparaison taximètre vs feuille de route */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Vérification Taximètre</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Taximètre</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {totalTaximetre.toFixed(2)} €
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Feuille de Route</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {totalFeuilleRoute.toFixed(2)} €
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Différence</p>
                        <p className={`text-2xl font-bold ${
                          Math.abs(difference) < 0.01 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {difference.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Liste des courses */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Détail des Courses</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-100 dark:bg-gray-600">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                              N° Ordre
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                              Embarquement
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                              Débarquement
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                              Taximètre
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">
                              Perçu
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                          {courses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                              <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">
                                {course.numero_ordre}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                {course.lieu_embarquement}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                {course.lieu_debarquement}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {course.prix_taximetre?.toFixed(2)} €
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                {course.sommes_percues?.toFixed(2)} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

ControlModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  driver: PropTypes.object.isRequired,
  vehicle: PropTypes.object.isRequired,
  shiftData: PropTypes.object,
  courses: PropTypes.array.isRequired
};

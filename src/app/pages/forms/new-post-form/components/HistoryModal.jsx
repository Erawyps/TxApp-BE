// Import Dependencies
import { useState } from "react";
import { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon, CalendarIcon, TruckIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input, Badge } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";

// ----------------------------------------------------------------------

// Données simulées d'historique
const mockHistory = [
  {
    id: 1,
    date: '2024-01-15',
    type: 'shift',
    data: {
      heures: '8h30',
      courses: 12,
      recettes: 180.50,
      benefice: 145.20
    }
  },
  {
    id: 2,
    date: '2024-01-14',
    type: 'shift',
    data: {
      heures: '7h45',
      courses: 9,
      recettes: 125.30,
      benefice: 98.75
    }
  },
  {
    id: 3,
    date: '2024-01-13',
    type: 'shift',
    data: {
      heures: '9h15',
      courses: 15,
      recettes: 220.80,
      benefice: 175.40
    }
  }
];

const periodOptions = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
  { value: 'custom', label: 'Période personnalisée' }
];

export function HistoryModal({ isOpen, onClose }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');

  const filteredHistory = mockHistory; // Ici vous filtrerez selon la période sélectionnée

  const totalRecettes = filteredHistory.reduce((sum, item) => sum + item.data.recettes, 0);
  const totalBenefice = filteredHistory.reduce((sum, item) => sum + item.data.benefice, 0);
  const totalCourses = filteredHistory.reduce((sum, item) => sum + item.data.courses, 0);

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
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                  <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Historique des activités
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-6">
                  {/* Filtres */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Listbox
                        data={periodOptions}
                        value={periodOptions.find(p => p.value === selectedPeriod) || periodOptions[0]}
                        onChange={(val) => setSelectedPeriod(val.value)}
                        label="Période"
                        displayField="label"
                      />
                      {selectedPeriod === 'custom' && (
                        <>
                          <Input
                            label="Du"
                            type="date"
                            value={customDateFrom}
                            onChange={(e) => setCustomDateFrom(e.target.value)}
                          />
                          <Input
                            label="Au"
                            type="date"
                            value={customDateTo}
                            onChange={(e) => setCustomDateTo(e.target.value)}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Résumé de la période */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Recettes</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {totalRecettes.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Bénéfice</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {totalBenefice.toFixed(2)} €
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalCourses}
                      </p>
                    </div>
                  </div>

                  {/* Liste de l'historique */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Aucun historique trouvé pour cette période
                        </p>
                      </div>
                    ) : (
                      filteredHistory.map((item) => (
                        <div key={item.id} className="bg-gray-50 dark:bg-dark-600/50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-800 dark:text-dark-100">
                                {new Date(item.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <Badge variant="info">{item.data.heures}</Badge>
                            </div>
                            <Badge variant="success">
                              {item.data.benefice.toFixed(2)} € net
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Courses: </span>
                              <span className="font-medium">{item.data.courses}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Recettes: </span>
                              <span className="font-medium">{item.data.recettes.toFixed(2)} €</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Moyenne/course: </span>
                              <span className="font-medium">
                                {(item.data.recettes / item.data.courses).toFixed(2)} €
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-500">
                  <Button variant="outlined" onClick={onClose}>
                    Fermer
                  </Button>
                  <Button>
                    Exporter PDF
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

HistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
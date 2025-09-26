// Import Dependencies
import { useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Modal, Button, Input, Badge, Table, THead, TBody, Tr, Th, Td } from "components/ui";
import { Listbox } from "components/shared/form/Listbox";
import { CalendarIcon, TruckIcon } from "@heroicons/react/24/outline";

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

export function HistoryModal({ isOpen, onClose }) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const periodOptions = [
    { value: 'all', label: 'Toutes les périodes' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'yesterday', label: 'Hier' },
    { value: 'current_week', label: 'Cette semaine' },
    { value: 'last_week', label: 'Semaine dernière' },
    { value: 'current_month', label: 'Ce mois' },
    { value: 'last_month', label: 'Mois dernier' }
  ];

  const filteredHistory = mockHistory.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.date.includes(searchTerm) ||
      item.data.heures.includes(searchTerm) ||
      item.data.courses.toString().includes(searchTerm);

    const matchesPeriod = periodFilter === 'all' ||
      (periodFilter === 'today' && item.date === new Date().toISOString().split('T')[0]);

    return matchesSearch && matchesPeriod;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historique des shifts"
      size="xl"
    >
      <div className="space-y-6">
        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher par date, heures, courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Listbox
            value={periodFilter}
            onChange={setPeriodFilter}
            options={periodOptions}
            placeholder="Sélectionner une période"
          />
        </div>

        {/* Tableau d'historique */}
        <div className="overflow-x-auto">
          <Table hoverable className="w-full">
            <THead>
              <Tr>
                <Th>Date</Th>
                <Th>Durée</Th>
                <Th>Courses</Th>
                <Th>Recettes</Th>
                <Th>Bénéfice</Th>
                <Th>Statut</Th>
              </Tr>
            </THead>
            <TBody>
              {filteredHistory.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun historique trouvé
                  </Td>
                </Tr>
              ) : (
                filteredHistory.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {new Date(item.date).toLocaleDateString('fr-BE')}
                      </div>
                    </Td>
                    <Td className="font-medium">{item.data.heures}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-4 h-4 text-gray-400" />
                        {item.data.courses}
                      </div>
                    </Td>
                    <Td className="font-medium text-green-600">
                      €{item.data.recettes.toFixed(2)}
                    </Td>
                    <Td className="font-medium text-blue-600">
                      €{item.data.benefice.toFixed(2)}
                    </Td>
                    <Td>
                      <Badge className="bg-green-100 text-green-800">
                        Terminé
                      </Badge>
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>
        </div>

        {/* Statistiques globales */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Statistiques globales
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total shifts</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {mockHistory.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total courses</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {mockHistory.reduce((sum, item) => sum + item.data.courses, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total recettes</p>
              <p className="text-lg font-semibold text-green-600">
                €{mockHistory.reduce((sum, item) => sum + item.data.recettes, 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total bénéfice</p>
              <p className="text-lg font-semibold text-blue-600">
                €{mockHistory.reduce((sum, item) => sum + item.data.benefice, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}

HistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
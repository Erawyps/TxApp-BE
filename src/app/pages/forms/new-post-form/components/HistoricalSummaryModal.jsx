import { Modal } from 'components/ui';
import { Button, Table } from 'components/ui';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Input } from 'components/ui';

export function HistoricalSummaryModal({ isOpen, onClose, historicalData }) {
  const demoData = historicalData || [
    {
      date: '2023-05-15',
      startTime: '08:00',
      endTime: '16:30',
      totalCourses: 12,
      totalRevenue: 215.75,
      totalExpenses: 85.20,
      driverSalary: 130.55,
      vehicle: 'TX-AA-171'
    },
    {
      date: '2023-05-14',
      startTime: '07:30',
      endTime: '17:45',
      totalCourses: 15,
      totalRevenue: 245.30,
      totalExpenses: 92.50,
      driverSalary: 152.80,
      vehicle: 'TX-AA-171'
    }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Historique des Feuilles de Route"
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outlined" 
              size="sm"
              icon={<ArrowDownTrayIcon className="h-4 w-4" />}
            >
              Exporter
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input 
              type="date" 
              placeholder="De..." 
              size="sm"
              className="w-32"
            />
            <Input 
              type="date" 
              placeholder="À..." 
              size="sm"
              className="w-32"
            />
            <Button variant="primary" size="sm">
              Filtrer
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Date</Table.Header>
                <Table.Header>Véhicule</Table.Header>
                <Table.Header>Heures</Table.Header>
                <Table.Header>Courses</Table.Header>
                <Table.Header>Recettes</Table.Header>
                <Table.Header>Charges</Table.Header>
                <Table.Header>Salaire</Table.Header>
                <Table.Header>Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {demoData.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{new Date(item.date).toLocaleDateString('fr-FR')}</Table.Cell>
                  <Table.Cell>{item.vehicle}</Table.Cell>
                  <Table.Cell>{item.startTime} - {item.endTime}</Table.Cell>
                  <Table.Cell>{item.totalCourses}</Table.Cell>
                  <Table.Cell>{item.totalRevenue.toFixed(2)} €</Table.Cell>
                  <Table.Cell>{item.totalExpenses.toFixed(2)} €</Table.Cell>
                  <Table.Cell>{item.driverSalary.toFixed(2)} €</Table.Cell>
                  <Table.Cell>
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            Affichage 1-{demoData.length} sur {demoData.length} résultats
          </div>
          <div className="flex space-x-2">
            <Button variant="outlined" size="sm" disabled>
              Précédent
            </Button>
            <Button variant="outlined" size="sm" disabled>
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
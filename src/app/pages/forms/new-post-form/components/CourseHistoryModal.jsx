import { Modal } from 'components/ui';
import { SearchInput } from 'components/ui';
import { useState } from 'react';

export function CourseHistoryModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');
  
  // Simulation de données historiques
  const history = [
    { id: 1, date: '2023-05-15', from: 'Gare du Nord', to: 'Aéroport', amount: 45.50 },
    { id: 2, date: '2023-05-14', from: 'Hôtel', to: 'Centre ville', amount: 12.80 },
    // ... autres données
  ];

  const filteredHistory = history.filter(item =>
    item.from.toLowerCase().includes(search.toLowerCase()) ||
    item.to.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historique des courses" size="lg">
      <div className="space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une course..."
        />

        <div className="border rounded-lg overflow-hidden">
          {filteredHistory.length > 0 ? (
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Trajet</th>
                  <th className="px-4 py-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredHistory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{item.date}</td>
                    <td className="px-4 py-2">{item.from} → {item.to}</td>
                    <td className="px-4 py-2 text-right">{item.amount} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Aucune course trouvée
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
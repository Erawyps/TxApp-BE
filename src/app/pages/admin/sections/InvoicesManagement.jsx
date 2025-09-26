import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Select, Badge } from 'components/ui';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CurrencyEuroIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function InvoicesManagement() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    numero_facture: '',
    date_emission: '',
    date_echeance: '',
    montant_ht: '',
    montant_tva: '',
    montant_ttc: '',
    statut: 'en_attente',
    client_id: '',
    societe_id: 1
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/gestion-factures');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      // Mock data for development
      setInvoices([
        {
          gestion_facture_id: 1,
          numero_facture: 'F2024001',
          date_emission: '2024-01-15',
          date_echeance: '2024-02-15',
          montant_ht: 1500.00,
          montant_tva: 315.00,
          montant_ttc: 1815.00,
          statut: 'payee',
          created_at: '2024-01-15T10:00:00Z',
          client: {
            nom: 'Dupont',
            prenom: 'Jean',
            entreprise: 'ABC Corp'
          },
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            course: 25
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setFormData({
      numero_facture: '',
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: '',
      montant_ht: '',
      montant_tva: '',
      montant_ttc: '',
      statut: 'en_attente',
      client_id: '',
      societe_id: 1
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setFormData({
      numero_facture: invoice.numero_facture,
      date_emission: invoice.date_emission,
      date_echeance: invoice.date_echeance || '',
      montant_ht: invoice.montant_ht.toString(),
      montant_tva: invoice.montant_tva.toString(),
      montant_ttc: invoice.montant_ttc.toString(),
      statut: invoice.statut,
      client_id: invoice.client_id?.toString() || '',
      societe_id: invoice.societe_id
    });
    setSelectedInvoice(invoice);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/gestion-factures/${invoiceId}`, { method: 'DELETE' });
      await loadInvoices();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la facture');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/gestion-factures' : `/api/gestion-factures/${selectedInvoice.gestion_facture_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const submitData = {
        ...formData,
        montant_ht: parseFloat(formData.montant_ht),
        montant_tva: parseFloat(formData.montant_tva),
        montant_ttc: parseFloat(formData.montant_ttc),
        client_id: parseInt(formData.client_id)
      };

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await loadInvoices();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la facture');
    }
  };

  const calculateTVA = (ht) => {
    const htValue = parseFloat(ht) || 0;
    return (htValue * 0.21).toFixed(2); // 21% TVA
  };

  const calculateTTC = (ht, tva) => {
    const htValue = parseFloat(ht) || 0;
    const tvaValue = parseFloat(tva) || 0;
    return (htValue + tvaValue).toFixed(2);
  };

  const handleHTChange = (value) => {
    const tva = calculateTVA(value);
    const ttc = calculateTTC(value, tva);
    setFormData({
      ...formData,
      montant_ht: value,
      montant_tva: tva,
      montant_ttc: ttc
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      en_attente: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      payee: { color: 'bg-green-100 text-green-800', label: 'Payée' },
      annulee: { color: 'bg-red-100 text-red-800', label: 'Annulée' },
      en_retard: { color: 'bg-orange-100 text-orange-800', label: 'En retard' }
    };
    const config = statusConfig[status] || statusConfig.en_attente;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.client?.entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6" />
            Gestion des factures
          </h2>
          <p className="text-gray-600 mt-1">Administrer les factures clients</p>
        </div>
        <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, client, entreprise ou statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>N° Facture</Th>
              <Th>Client</Th>
              <Th>Date d&apos;émission</Th>
              <Th>Échéance</Th>
              <Th>Montant TTC</Th>
              <Th>Statut</Th>
              <Th>Courses</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <Tr>
                <Td colSpan={8} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </Td>
              </Tr>
            ) : filteredInvoices.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-8 text-gray-500">
                  Aucune facture trouvée
                </Td>
              </Tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <Tr key={invoice.gestion_facture_id}>
                  <Td className="font-medium font-mono">
                    {invoice.numero_facture}
                  </Td>
                  <Td>
                    <div>
                      <div className="font-medium">
                        {invoice.client?.nom} {invoice.client?.prenom}
                      </div>
                      {invoice.client?.entreprise && (
                        <div className="text-sm text-gray-500">
                          {invoice.client.entreprise}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      {new Date(invoice.date_emission).toLocaleDateString('fr-BE')}
                    </div>
                  </Td>
                  <Td>
                    {invoice.date_echeance && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        {new Date(invoice.date_echeance).toLocaleDateString('fr-BE')}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1 font-medium">
                      <CurrencyEuroIcon className="w-4 h-4 text-gray-400" />
                      {invoice.montant_ttc.toFixed(2)}
                    </div>
                  </Td>
                  <Td>{getStatusBadge(invoice.statut)}</Td>
                  <Td>{invoice._count?.course || 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteInvoice(invoice.gestion_facture_id)}
                        className="p-1 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </Card>

      {/* Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails de la facture' :
          modalMode === 'create' ? 'Nouvelle facture' :
          'Modifier la facture'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">N° Facture</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedInvoice?.numero_facture}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedInvoice?.statut)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d&apos;émission</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedInvoice?.date_emission).toLocaleDateString('fr-BE')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d&apos;échéance</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedInvoice?.date_echeance ? new Date(selectedInvoice.date_echeance).toLocaleDateString('fr-BE') : '-'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedInvoice?.client?.nom} {selectedInvoice?.client?.prenom}
                {selectedInvoice?.client?.entreprise && ` (${selectedInvoice.client.entreprise})`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant HT</label>
                <p className="mt-1 text-sm font-medium text-gray-900">€{selectedInvoice?.montant_ht.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">TVA (21%)</label>
                <p className="mt-1 text-sm font-medium text-gray-900">€{selectedInvoice?.montant_tva.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant TTC</label>
                <p className="mt-1 text-sm font-bold text-gray-900">€{selectedInvoice?.montant_ttc.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de courses</label>
              <p className="mt-1 text-sm text-gray-900">{selectedInvoice?._count?.course || 0}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Numéro de facture"
                value={formData.numero_facture}
                onChange={(e) => setFormData({...formData, numero_facture: e.target.value})}
                required
                placeholder="F2024001"
              />
              <Select
                label="Statut"
                value={formData.statut}
                onChange={(value) => setFormData({...formData, statut: value})}
                options={[
                  { value: 'en_attente', label: 'En attente' },
                  { value: 'payee', label: 'Payée' },
                  { value: 'annulee', label: 'Annulée' },
                  { value: 'en_retard', label: 'En retard' }
                ]}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date d'émission"
                type="date"
                value={formData.date_emission}
                onChange={(e) => setFormData({...formData, date_emission: e.target.value})}
                required
              />
              <Input
                label="Date d'échéance"
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({...formData, date_echeance: e.target.value})}
              />
            </div>
            <Input
              label="ID Client"
              type="number"
              value={formData.client_id}
              onChange={(e) => setFormData({...formData, client_id: e.target.value})}
              required
              placeholder="ID du client"
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Montant HT (€)"
                type="number"
                step="0.01"
                value={formData.montant_ht}
                onChange={(e) => handleHTChange(e.target.value)}
                required
                placeholder="0.00"
              />
              <Input
                label="TVA (€)"
                type="number"
                step="0.01"
                value={formData.montant_tva}
                onChange={(e) => setFormData({...formData, montant_tva: e.target.value})}
                required
                placeholder="0.00"
              />
              <Input
                label="Montant TTC (€)"
                type="number"
                step="0.01"
                value={formData.montant_ttc}
                onChange={(e) => setFormData({...formData, montant_ttc: e.target.value})}
                required
                placeholder="0.00"
              />
            </div>
            <Input
              label="ID Société"
              type="number"
              value={formData.societe_id}
              onChange={(e) => setFormData({...formData, societe_id: parseInt(e.target.value)})}
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {modalMode === 'create' ? 'Créer' : 'Modifier'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
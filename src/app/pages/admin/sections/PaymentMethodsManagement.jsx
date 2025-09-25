import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Form, Input, Select, Badge } from 'components/ui';
import {
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function PaymentMethodsManagement() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    type: 'Cash',
    est_actif: true
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/modes-paiement');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Erreur lors du chargement des modes de paiement:', error);
      // Mock data for development
      setPaymentMethods([
        {
          mode_id: 1,
          code: 'ESP',
          libelle: 'Espèces',
          type: 'Cash',
          est_actif: true,
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            course: 150,
            charge: 25,
            gestion_facture: 5
          }
        },
        {
          mode_id: 2,
          code: 'BAN',
          libelle: 'Bancontact',
          type: 'Bancontact',
          est_actif: true,
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            course: 89,
            charge: 12,
            gestion_facture: 8
          }
        },
        {
          mode_id: 3,
          code: 'VIR',
          libelle: 'Virement',
          type: 'Virement',
          est_actif: true,
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            course: 45,
            charge: 8,
            gestion_facture: 15
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMethod = () => {
    setFormData({
      code: '',
      libelle: '',
      type: 'Cash',
      est_actif: true
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditMethod = (method) => {
    setFormData({
      code: method.code,
      libelle: method.libelle,
      type: method.type,
      est_actif: method.est_actif
    });
    setSelectedMethod(method);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewMethod = (method) => {
    setSelectedMethod(method);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteMethod = async (methodId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce mode de paiement ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/modes-paiement/${methodId}`, { method: 'DELETE' });
      await loadPaymentMethods();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du mode de paiement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/modes-paiement' : `/api/modes-paiement/${selectedMethod.mode_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadPaymentMethods();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du mode de paiement');
    }
  };

  const filteredMethods = paymentMethods.filter(method =>
    method.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'Bancontact': return 'bg-blue-100 text-blue-800';
      case 'Virement': return 'bg-purple-100 text-purple-800';
      case 'Facture': return 'bg-orange-100 text-orange-800';
      case 'Avance': return 'bg-yellow-100 text-yellow-800';
      case 'Demande': return 'bg-indigo-100 text-indigo-800';
      case 'Cheque': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6" />
            Modes de paiement
          </h2>
          <p className="text-gray-600 mt-1">Gérer les différents modes de paiement acceptés</p>
        </div>
        <Button onClick={handleCreateMethod} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouveau mode
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par libellé, code ou type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Methods Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Code</Th>
              <Th>Libellé</Th>
              <Th>Type</Th>
              <Th>Statut</Th>
              <Th>Courses</Th>
              <Th>Charges</Th>
              <Th>Factures</Th>
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
            ) : filteredMethods.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-8 text-gray-500">
                  Aucun mode de paiement trouvé
                </Td>
              </Tr>
            ) : (
              filteredMethods.map((method) => (
                <Tr key={method.mode_id}>
                  <Td className="font-mono font-medium">
                    {method.code}
                  </Td>
                  <Td className="font-medium">
                    {method.libelle}
                  </Td>
                  <Td>
                    <Badge className={getTypeBadgeColor(method.type)}>
                      {method.type}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge className={method.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {method.est_actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Td>
                  <Td>{method._count?.course || 0}</Td>
                  <Td>{method._count?.charge || 0}</Td>
                  <Td>{method._count?.gestion_facture || 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewMethod(method)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMethod(method)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMethod(method.mode_id)}
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

      {/* Payment Method Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails du mode de paiement' :
          modalMode === 'create' ? 'Nouveau mode de paiement' :
          'Modifier le mode de paiement'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedMethod?.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Libellé</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMethod?.libelle}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMethod?.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMethod?.est_actif ? 'Actif' : 'Inactif'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Courses</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMethod?._count?.course || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Charges</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMethod?._count?.charge || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Factures</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMethod?._count?.gestion_facture || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                maxLength={20}
                required
              />
              <Input
                label="Libellé"
                value={formData.libelle}
                onChange={(e) => setFormData({...formData, libelle: e.target.value})}
                maxLength={100}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                value={formData.type}
                onChange={(value) => setFormData({...formData, type: value})}
                options={[
                  { value: 'Cash', label: 'Espèces' },
                  { value: 'Bancontact', label: 'Bancontact' },
                  { value: 'Virement', label: 'Virement' },
                  { value: 'Facture', label: 'Facture' },
                  { value: 'Avance', label: 'Avance' },
                  { value: 'Demande', label: 'Demande' },
                  { value: 'Cheque', label: 'Chèque' }
                ]}
                required
              />
              <Select
                label="Statut"
                value={formData.est_actif ? 'true' : 'false'}
                onChange={(value) => setFormData({...formData, est_actif: value === 'true'})}
                options={[
                  { value: 'true', label: 'Actif' },
                  { value: 'false', label: 'Inactif' }
                ]}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {modalMode === 'create' ? 'Créer' : 'Modifier'}
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
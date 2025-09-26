import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Badge } from 'components/ui';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function BillingRulesManagement() {
  const [billingRules, setBillingRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    nom: 'Simple',
    description: ''
  });

  useEffect(() => {
    loadBillingRules();
  }, []);

  const loadBillingRules = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/regles-facturation');
      const data = await response.json();
      setBillingRules(data);
    } catch (error) {
      console.error('Erreur lors du chargement des règles de facturation:', error);
      // Mock data for development
      setBillingRules([
        {
          regle_facturation_id: 1,
          nom: 'Simple',
          description: 'Facturation simple sans détails',
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            client: 8
          }
        },
        {
          regle_facturation_id: 2,
          nom: 'Justifie',
          description: 'Facturation justifiée avec détails des courses',
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            client: 5
          }
        },
        {
          regle_facturation_id: 3,
          nom: 'Complet',
          description: 'Facturation complète avec tous les détails',
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            client: 3
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = () => {
    setFormData({
      nom: 'Simple',
      description: ''
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditRule = (rule) => {
    setFormData({
      nom: rule.nom,
      description: rule.description || ''
    });
    setSelectedRule(rule);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewRule = (rule) => {
    setSelectedRule(rule);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle de facturation ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/regles-facturation/${ruleId}`, { method: 'DELETE' });
      await loadBillingRules();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la règle de facturation');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/regles-facturation' : `/api/regles-facturation/${selectedRule.regle_facturation_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadBillingRules();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la règle de facturation');
    }
  };

  const filteredRules = billingRules.filter(rule =>
    rule.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-6 h-6" />
            Règles de facturation
          </h2>
          <p className="text-gray-600 mt-1">Gérer les règles de facturation pour les clients</p>
        </div>
        <Button onClick={handleCreateRule} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouvelle règle
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Billing Rules Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Nom de la règle</Th>
              <Th>Description</Th>
              <Th>Clients</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <Tr>
                <Td colSpan={4} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </Td>
              </Tr>
            ) : filteredRules.length === 0 ? (
              <Tr>
                <Td colSpan={4} className="text-center py-8 text-gray-500">
                  Aucune règle de facturation trouvée
                </Td>
              </Tr>
            ) : (
              filteredRules.map((rule) => (
                <Tr key={rule.regle_facturation_id}>
                  <Td className="font-medium">
                    <Badge className="bg-blue-100 text-blue-800">
                      {rule.nom}
                    </Badge>
                  </Td>
                  <Td>{rule.description || 'Aucune description'}</Td>
                  <Td>{rule._count?.client || 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewRule(rule)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditRule(rule)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRule(rule.regle_facturation_id)}
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

      {/* Billing Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails de la règle de facturation' :
          modalMode === 'create' ? 'Nouvelle règle de facturation' :
          'Modifier la règle de facturation'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de la règle</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRule?.nom}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRule?.description || 'Aucune description'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de clients</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRule?._count?.client || 0}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom de la règle"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de la règle de facturation"
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
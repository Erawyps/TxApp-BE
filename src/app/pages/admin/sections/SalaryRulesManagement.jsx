import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Select, Badge } from 'components/ui';
import {
  CurrencyEuroIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function SalaryRulesManagement() {
  const [salaryRules, setSalaryRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    nom_regle: '',
    est_variable: true,
    seuil_recette: '',
    pourcentage_base: '',
    pourcentage_au_dela: '',
    description: ''
  });

  useEffect(() => {
    loadSalaryRules();
  }, []);

  const loadSalaryRules = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/regles-salaire');
      const data = await response.json();
      setSalaryRules(data);
    } catch (error) {
      console.error('Erreur lors du chargement des règles de salaire:', error);
      // Mock data for development
      setSalaryRules([
        {
          regle_id: 1,
          nom_regle: 'Règle Standard',
          est_variable: true,
          seuil_recette: 500.00,
          pourcentage_base: 10.00,
          pourcentage_au_dela: 15.00,
          description: 'Règle de salaire standard avec bonus progressif',
          created_at: '2024-01-01T00:00:00Z',
          _count: {
            chauffeur: 5
          }
        },
        {
          regle_id: 2,
          nom_regle: 'Règle Fixe',
          est_variable: false,
          seuil_recette: null,
          pourcentage_base: 12.00,
          pourcentage_au_dela: null,
          description: 'Salaire fixe sans bonus',
          created_at: '2024-01-15T00:00:00Z',
          _count: {
            chauffeur: 3
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = () => {
    setFormData({
      nom_regle: '',
      est_variable: true,
      seuil_recette: '',
      pourcentage_base: '',
      pourcentage_au_dela: '',
      description: ''
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditRule = (rule) => {
    setFormData({
      nom_regle: rule.nom_regle,
      est_variable: rule.est_variable,
      seuil_recette: rule.seuil_recette || '',
      pourcentage_base: rule.pourcentage_base || '',
      pourcentage_au_dela: rule.pourcentage_au_dela || '',
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle de salaire ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/regles-salaire/${ruleId}`, { method: 'DELETE' });
      await loadSalaryRules();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la règle de salaire');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/regles-salaire' : `/api/regles-salaire/${selectedRule.regle_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const submitData = {
        ...formData,
        seuil_recette: formData.seuil_recette ? parseFloat(formData.seuil_recette) : null,
        pourcentage_base: formData.pourcentage_base ? parseFloat(formData.pourcentage_base) : null,
        pourcentage_au_dela: formData.pourcentage_au_dela ? parseFloat(formData.pourcentage_au_dela) : null
      };

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await loadSalaryRules();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la règle de salaire');
    }
  };

  const filteredRules = salaryRules.filter(rule =>
    rule.nom_regle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CurrencyEuroIcon className="w-6 h-6" />
            Règles de salaire
          </h2>
          <p className="text-gray-600 mt-1">Gérer les règles de calcul des salaires des chauffeurs</p>
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

      {/* Salary Rules Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Nom de la règle</Th>
              <Th>Type</Th>
              <Th>Seuil (€)</Th>
              <Th>Base (%)</Th>
              <Th>Au-delà (%)</Th>
              <Th>Chauffeurs</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <Tr>
                <Td colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </Td>
              </Tr>
            ) : filteredRules.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-8 text-gray-500">
                  Aucune règle de salaire trouvée
                </Td>
              </Tr>
            ) : (
              filteredRules.map((rule) => (
                <Tr key={rule.regle_id}>
                  <Td className="font-medium">
                    {rule.nom_regle}
                  </Td>
                  <Td>
                    <Badge className={rule.est_variable ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                      {rule.est_variable ? 'Variable' : 'Fixe'}
                    </Badge>
                  </Td>
                  <Td>
                    {rule.seuil_recette ? `${Number(rule.seuil_recette).toFixed(2)} €` : '-'}
                  </Td>
                  <Td>
                    {rule.pourcentage_base ? `${Number(rule.pourcentage_base).toFixed(2)}%` : '-'}
                  </Td>
                  <Td>
                    {rule.pourcentage_au_dela ? `${Number(rule.pourcentage_au_dela).toFixed(2)}%` : '-'}
                  </Td>
                  <Td>{rule._count?.chauffeur || 0}</Td>
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
                        onClick={() => handleDeleteRule(rule.regle_id)}
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

      {/* Salary Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails de la règle de salaire' :
          modalMode === 'create' ? 'Nouvelle règle de salaire' :
          'Modifier la règle de salaire'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom de la règle</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRule?.nom_regle}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRule?.est_variable ? 'Variable' : 'Fixe'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Seuil de recette</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRule?.seuil_recette ? `${Number(selectedRule.seuil_recette).toFixed(2)} €` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pourcentage de base</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRule?.pourcentage_base ? `${Number(selectedRule.pourcentage_base).toFixed(2)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pourcentage au-delà</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRule?.pourcentage_au_dela ? `${Number(selectedRule.pourcentage_au_dela).toFixed(2)}%` : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRule?.description || 'Aucune description'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de chauffeurs</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRule?._count?.chauffeur || 0}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom de la règle"
              value={formData.nom_regle}
              onChange={(e) => setFormData({...formData, nom_regle: e.target.value})}
              required
            />
            <Select
              label="Type de règle"
              value={formData.est_variable ? 'true' : 'false'}
              onChange={(value) => setFormData({...formData, est_variable: value === 'true'})}
              options={[
                { value: 'true', label: 'Variable (avec bonus)' },
                { value: 'false', label: 'Fixe (sans bonus)' }
              ]}
              required
            />
            {formData.est_variable && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Seuil de recette (€)"
                  type="number"
                  step="0.01"
                  value={formData.seuil_recette}
                  onChange={(e) => setFormData({...formData, seuil_recette: e.target.value})}
                  placeholder="500.00"
                />
                <Input
                  label="Pourcentage au-delà (%)"
                  type="number"
                  step="0.01"
                  value={formData.pourcentage_au_dela}
                  onChange={(e) => setFormData({...formData, pourcentage_au_dela: e.target.value})}
                  placeholder="15.00"
                />
              </div>
            )}
            <Input
              label="Pourcentage de base (%)"
              type="number"
              step="0.01"
              value={formData.pourcentage_base}
              onChange={(e) => setFormData({...formData, pourcentage_base: e.target.value})}
              placeholder="10.00"
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de la règle de salaire"
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
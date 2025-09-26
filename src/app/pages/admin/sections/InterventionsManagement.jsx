import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Select, Badge, Textarea } from 'components/ui';
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function InterventionsManagement() {
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    chauffeur_id: '',
    date_intervention: '',
    type_intervention: 'maintenance',
    description: '',
    cout_estime: '',
    cout_reel: '',
    statut: 'planifiee',
    technicien: '',
    notes: '',
    societe_id: 1
  });

  useEffect(() => {
    loadInterventions();
  }, []);

  const loadInterventions = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/interventions');
      const data = await response.json();
      setInterventions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des interventions:', error);
      // Mock data for development
      setInterventions([
        {
          intervention_id: 1,
          date_intervention: '2024-01-20',
          type_intervention: 'maintenance',
          description: 'Révision complète du véhicule',
          cout_estime: 250.00,
          cout_reel: 275.00,
          statut: 'terminee',
          technicien: 'Garage Central',
          notes: 'Freins changés, vidange effectuée',
          created_at: '2024-01-15T10:00:00Z',
          chauffeur: {
            utilisateur: {
              nom: 'Dubois',
              prenom: 'Pierre'
            },
            vehicule: {
              immatriculation: 'ABC-123'
            }
          },
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIntervention = () => {
    setFormData({
      chauffeur_id: '',
      date_intervention: new Date().toISOString().split('T')[0],
      type_intervention: 'maintenance',
      description: '',
      cout_estime: '',
      cout_reel: '',
      statut: 'planifiee',
      technicien: '',
      notes: '',
      societe_id: 1
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditIntervention = (intervention) => {
    setFormData({
      chauffeur_id: intervention.chauffeur_id?.toString() || '',
      date_intervention: intervention.date_intervention,
      type_intervention: intervention.type_intervention,
      description: intervention.description,
      cout_estime: intervention.cout_estime?.toString() || '',
      cout_reel: intervention.cout_reel?.toString() || '',
      statut: intervention.statut,
      technicien: intervention.technicien || '',
      notes: intervention.notes || '',
      societe_id: intervention.societe_id
    });
    setSelectedIntervention(intervention);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewIntervention = (intervention) => {
    setSelectedIntervention(intervention);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteIntervention = async (interventionId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/interventions/${interventionId}`, { method: 'DELETE' });
      await loadInterventions();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'intervention');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/interventions' : `/api/interventions/${selectedIntervention.intervention_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const submitData = {
        ...formData,
        chauffeur_id: parseInt(formData.chauffeur_id),
        cout_estime: formData.cout_estime ? parseFloat(formData.cout_estime) : null,
        cout_reel: formData.cout_reel ? parseFloat(formData.cout_reel) : null
      };

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await loadInterventions();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'intervention');
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      maintenance: { color: 'bg-blue-100 text-blue-800', label: 'Maintenance' },
      reparation: { color: 'bg-orange-100 text-orange-800', label: 'Réparation' },
      accident: { color: 'bg-red-100 text-red-800', label: 'Accident' },
      controle: { color: 'bg-green-100 text-green-800', label: 'Contrôle' }
    };
    const config = typeConfig[type] || typeConfig.maintenance;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      planifiee: { color: 'bg-yellow-100 text-yellow-800', label: 'Planifiée' },
      en_cours: { color: 'bg-blue-100 text-blue-800', label: 'En cours' },
      terminee: { color: 'bg-green-100 text-green-800', label: 'Terminée' },
      annulee: { color: 'bg-gray-100 text-gray-800', label: 'Annulée' }
    };
    const config = statusConfig[status] || statusConfig.planifiee;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredInterventions = interventions.filter(intervention =>
    intervention.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervention.chauffeur?.utilisateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervention.chauffeur?.utilisateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervention.chauffeur?.vehicule?.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervention.technicien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervention.type_intervention.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intervention.statut.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-6 h-6" />
            Gestion des interventions
          </h2>
          <p className="text-gray-600 mt-1">Administrer les interventions sur les véhicules</p>
        </div>
        <Button onClick={handleCreateIntervention} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouvelle intervention
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par chauffeur, véhicule, technicien, type ou statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Interventions Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Chauffeur</Th>
              <Th>Véhicule</Th>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th>Coût estimé</Th>
              <Th>Statut</Th>
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
            ) : filteredInterventions.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-8 text-gray-500">
                  Aucune intervention trouvée
                </Td>
              </Tr>
            ) : (
              filteredInterventions.map((intervention) => (
                <Tr key={intervention.intervention_id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {intervention.chauffeur?.utilisateur?.nom} {intervention.chauffeur?.utilisateur?.prenom}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td className="font-mono">
                    {intervention.chauffeur?.vehicule?.immatriculation || '-'}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      {new Date(intervention.date_intervention).toLocaleDateString('fr-BE')}
                    </div>
                  </Td>
                  <Td>{getTypeBadge(intervention.type_intervention)}</Td>
                  <Td>
                    <div className="max-w-xs truncate" title={intervention.description}>
                      {intervention.description}
                    </div>
                  </Td>
                  <Td>
                    {intervention.cout_estime && (
                      <span className="font-medium">€{intervention.cout_estime.toFixed(2)}</span>
                    )}
                  </Td>
                  <Td>{getStatusBadge(intervention.statut)}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewIntervention(intervention)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditIntervention(intervention)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteIntervention(intervention.intervention_id)}
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

      {/* Intervention Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails de l\'intervention' :
          modalMode === 'create' ? 'Nouvelle intervention' :
          'Modifier l\'intervention'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chauffeur</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedIntervention?.chauffeur?.utilisateur?.nom} {selectedIntervention?.chauffeur?.utilisateur?.prenom}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Véhicule</label>
                <p className="mt-1 text-sm font-mono text-gray-900">
                  {selectedIntervention?.chauffeur?.vehicule?.immatriculation || '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d&apos;intervention</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedIntervention?.date_intervention).toLocaleDateString('fr-BE')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <div className="mt-1">{getTypeBadge(selectedIntervention?.type_intervention)}</div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedIntervention?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Coût estimé</label>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedIntervention?.cout_estime ? `€${selectedIntervention.cout_estime.toFixed(2)}` : '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Coût réel</label>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedIntervention?.cout_reel ? `€${selectedIntervention.cout_reel.toFixed(2)}` : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Technicien</label>
                <p className="mt-1 text-sm text-gray-900">{selectedIntervention?.technicien || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <div className="mt-1">{getStatusBadge(selectedIntervention?.statut)}</div>
              </div>
            </div>
            {selectedIntervention?.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedIntervention.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="ID Chauffeur"
                type="number"
                value={formData.chauffeur_id}
                onChange={(e) => setFormData({...formData, chauffeur_id: e.target.value})}
                required
                placeholder="ID du chauffeur"
              />
              <Input
                label="Date d&apos;intervention"
                type="date"
                value={formData.date_intervention}
                onChange={(e) => setFormData({...formData, date_intervention: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type d&apos;intervention"
                value={formData.type_intervention}
                onChange={(value) => setFormData({...formData, type_intervention: value})}
                options={[
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'reparation', label: 'Réparation' },
                  { value: 'accident', label: 'Accident' },
                  { value: 'controle', label: 'Contrôle' }
                ]}
                required
              />
              <Select
                label="Statut"
                value={formData.statut}
                onChange={(value) => setFormData({...formData, statut: value})}
                options={[
                  { value: 'planifiee', label: 'Planifiée' },
                  { value: 'en_cours', label: 'En cours' },
                  { value: 'terminee', label: 'Terminée' },
                  { value: 'annulee', label: 'Annulée' }
                ]}
                required
              />
            </div>
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              placeholder="Description de l'intervention"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Coût estimé (€)"
                type="number"
                step="0.01"
                value={formData.cout_estime}
                onChange={(e) => setFormData({...formData, cout_estime: e.target.value})}
                placeholder="0.00"
              />
              <Input
                label="Coût réel (€)"
                type="number"
                step="0.01"
                value={formData.cout_reel}
                onChange={(e) => setFormData({...formData, cout_reel: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <Input
              label="Technicien"
              value={formData.technicien}
              onChange={(e) => setFormData({...formData, technicien: e.target.value})}
              placeholder="Nom du technicien ou garage"
            />
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
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
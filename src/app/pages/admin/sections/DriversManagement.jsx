import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Select, Badge } from 'components/ui';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function DriversManagement() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    chauffeur_id: '',
    societe_id: 1,
    statut: 'Actif',
    regle_salaire_defaut_id: null,
    utilisateur: {
      email: '',
      nom: '',
      prenom: '',
      role: 'Driver'
    }
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/chauffeurs');
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des chauffeurs:', error);
      // Mock data for development
      setDrivers([
        {
          chauffeur_id: 1,
          statut: 'Actif',
          created_at: '2024-01-15T10:00:00Z',
          utilisateur: {
            user_id: 1,
            email: 'driver1@txapp.be',
            nom: 'Dupont',
            prenom: 'Jean',
            role: 'Driver'
          },
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            feuilles_route: 15,
            intervention: 2
          }
        },
        {
          chauffeur_id: 2,
          statut: 'Actif',
          created_at: '2024-02-01T09:00:00Z',
          utilisateur: {
            user_id: 2,
            email: 'driver2@txapp.be',
            nom: 'Martin',
            prenom: 'Pierre',
            role: 'Driver'
          },
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            feuilles_route: 8,
            intervention: 0
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDriver = () => {
    setFormData({
      chauffeur_id: '',
      societe_id: 1,
      statut: 'Actif',
      regle_salaire_defaut_id: null,
      utilisateur: {
        email: '',
        nom: '',
        prenom: '',
        role: 'Driver'
      }
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setFormData({
      chauffeur_id: driver.chauffeur_id,
      societe_id: driver.societe_id,
      statut: driver.statut,
      regle_salaire_defaut_id: driver.regle_salaire_defaut_id,
      utilisateur: {
        email: driver.utilisateur.email,
        nom: driver.utilisateur.nom,
        prenom: driver.utilisateur.prenom,
        role: driver.utilisateur.role
      }
    });
    setSelectedDriver(driver);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteDriver = async (driverId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/chauffeurs/${driverId}`, { method: 'DELETE' });
      await loadDrivers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du chauffeur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/chauffeurs' : `/api/chauffeurs/${selectedDriver.chauffeur_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadDrivers();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du chauffeur');
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (statut) => {
    switch (statut) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'Non Actif': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserIcon className="w-6 h-6" />
            Gestion des chauffeurs
          </h2>
          <p className="text-gray-600 mt-1">Administrer les chauffeurs de la société</p>
        </div>
        <Button onClick={handleCreateDriver} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouveau chauffeur
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Drivers Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Chauffeur</Th>
              <Th>Email</Th>
              <Th>Statut</Th>
              <Th>Feuilles de route</Th>
              <Th>Interventions</Th>
              <Th>Date d&apos;inscription</Th>
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
            ) : filteredDrivers.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-8 text-gray-500">
                  Aucun chauffeur trouvé
                </Td>
              </Tr>
            ) : (
              filteredDrivers.map((driver) => (
                <Tr key={driver.chauffeur_id}>
                  <Td className="font-medium">
                    {driver.utilisateur.prenom} {driver.utilisateur.nom}
                  </Td>
                  <Td>{driver.utilisateur.email}</Td>
                  <Td>
                    <Badge className={getStatusBadgeColor(driver.statut)}>
                      {driver.statut}
                    </Badge>
                  </Td>
                  <Td>{driver._count?.feuilles_route || 0}</Td>
                  <Td>{driver._count?.intervention || 0}</Td>
                  <Td>
                    {new Date(driver.created_at).toLocaleDateString('fr-FR')}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDriver(driver)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditDriver(driver)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDriver(driver.chauffeur_id)}
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

      {/* Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails du chauffeur' :
          modalMode === 'create' ? 'Nouveau chauffeur' :
          'Modifier le chauffeur'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDriver?.utilisateur.prenom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDriver?.utilisateur.nom}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedDriver?.utilisateur.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDriver?.statut}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Société</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDriver?.societe_taxi.nom_exploitant}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Feuilles de route</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDriver?._count?.feuilles_route || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Interventions</label>
                <p className="mt-1 text-sm text-gray-900">{selectedDriver?._count?.intervention || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d&apos;inscription</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedDriver ? new Date(selectedDriver.created_at).toLocaleDateString('fr-FR') : ''}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.utilisateur.prenom}
                onChange={(e) => setFormData({
                  ...formData,
                  utilisateur: {...formData.utilisateur, prenom: e.target.value}
                })}
                required
              />
              <Input
                label="Nom"
                value={formData.utilisateur.nom}
                onChange={(e) => setFormData({
                  ...formData,
                  utilisateur: {...formData.utilisateur, nom: e.target.value}
                })}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.utilisateur.email}
              onChange={(e) => setFormData({
                ...formData,
                utilisateur: {...formData.utilisateur, email: e.target.value}
              })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Statut"
                value={formData.statut}
                onChange={(value) => setFormData({...formData, statut: value})}
                options={[
                  { value: 'Actif', label: 'Actif' },
                  { value: 'Non Actif', label: 'Non Actif' }
                ]}
                required
              />
              <Input
                label="ID Société"
                type="number"
                value={formData.societe_id}
                onChange={(e) => setFormData({...formData, societe_id: parseInt(e.target.value)})}
                required
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
          </form>
        )}
      </Modal>
    </div>
  );
}
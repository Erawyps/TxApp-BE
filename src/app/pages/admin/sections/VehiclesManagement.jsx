import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Select, Badge } from 'components/ui';
import {
  TruckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function VehiclesManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    plaque_immatriculation: '',
    num_identification: '',
    marque: '',
    modele: '',
    annee: '',
    est_actif: true,
    societe_id: 1
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/vehicules');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
      // Mock data for development
      setVehicles([
        {
          vehicule_id: 1,
          plaque_immatriculation: 'ABC-123',
          num_identification: 'VIN123456789',
          marque: 'Mercedes',
          modele: 'Classe V',
          annee: 2020,
          est_actif: true,
          created_at: '2024-01-15T10:00:00Z',
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            feuilles_route: 25,
            charge: 8
          }
        },
        {
          vehicule_id: 2,
          plaque_immatriculation: 'DEF-456',
          num_identification: 'VIN987654321',
          marque: 'Volkswagen',
          modele: 'Crafter',
          annee: 2019,
          est_actif: true,
          created_at: '2024-02-01T09:00:00Z',
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            feuilles_route: 18,
            charge: 5
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    setFormData({
      plaque_immatriculation: '',
      num_identification: '',
      marque: '',
      modele: '',
      annee: '',
      est_actif: true,
      societe_id: 1
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setFormData({
      plaque_immatriculation: vehicle.plaque_immatriculation,
      num_identification: vehicle.num_identification,
      marque: vehicle.marque || '',
      modele: vehicle.modele || '',
      annee: vehicle.annee || '',
      est_actif: vehicle.est_actif,
      societe_id: vehicle.societe_id
    });
    setSelectedVehicle(vehicle);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/vehicules/${vehicleId}`, { method: 'DELETE' });
      await loadVehicles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du véhicule');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/vehicules' : `/api/vehicules/${selectedVehicle.vehicule_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadVehicles();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du véhicule');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plaque_immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.marque?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.num_identification.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TruckIcon className="w-6 h-6" />
            Gestion des véhicules
          </h2>
          <p className="text-gray-600 mt-1">Administrer la flotte de véhicules</p>
        </div>
        <Button onClick={handleCreateVehicle} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouveau véhicule
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par plaque, marque, modèle ou numéro d'identification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicles Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Plaque</Th>
              <Th>Marque / Modèle</Th>
              <Th>Année</Th>
              <Th>Statut</Th>
              <Th>Feuilles de route</Th>
              <Th>Charges</Th>
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
            ) : filteredVehicles.length === 0 ? (
              <Tr>
                <Td colSpan={7} className="text-center py-8 text-gray-500">
                  Aucun véhicule trouvé
                </Td>
              </Tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <Tr key={vehicle.vehicule_id}>
                  <Td className="font-medium font-mono">
                    {vehicle.plaque_immatriculation}
                  </Td>
                  <Td>
                    {vehicle.marque} {vehicle.modele}
                  </Td>
                  <Td>{vehicle.annee}</Td>
                  <Td>
                    <Badge className={vehicle.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {vehicle.est_actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Td>
                  <Td>{vehicle._count?.feuilles_route || 0}</Td>
                  <Td>{vehicle._count?.charge || 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewVehicle(vehicle)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditVehicle(vehicle)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteVehicle(vehicle.vehicule_id)}
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

      {/* Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails du véhicule' :
          modalMode === 'create' ? 'Nouveau véhicule' :
          'Modifier le véhicule'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plaque d&apos;immatriculation</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedVehicle?.plaque_immatriculation}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro d&apos;identification</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedVehicle?.num_identification}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Marque</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.marque}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Modèle</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.modele}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Année</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.annee}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.est_actif ? 'Actif' : 'Inactif'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Société</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?.societe_taxi.nom_exploitant}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Feuilles de route</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?._count?.feuilles_route || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Charges</label>
                <p className="mt-1 text-sm text-gray-900">{selectedVehicle?._count?.charge || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Plaque d'immatriculation"
                value={formData.plaque_immatriculation}
                onChange={(e) => setFormData({...formData, plaque_immatriculation: e.target.value.toUpperCase()})}
                required
              />
              <Input
                label="Numéro d'identification"
                value={formData.num_identification}
                onChange={(e) => setFormData({...formData, num_identification: e.target.value.toUpperCase()})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Marque"
                value={formData.marque}
                onChange={(e) => setFormData({...formData, marque: e.target.value})}
              />
              <Input
                label="Modèle"
                value={formData.modele}
                onChange={(e) => setFormData({...formData, modele: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Année"
                type="number"
                value={formData.annee}
                onChange={(e) => setFormData({...formData, annee: e.target.value})}
                min="1900"
                max={new Date().getFullYear() + 1}
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
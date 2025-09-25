import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Form, Input, Select, Badge } from 'components/ui';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function ClientsManagement() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    nom_societe: '',
    num_tva: '',
    adresse: '',
    telephone: '',
    email: '',
    regle_facturation_id: 1,
    est_actif: true,
    societe_id: 1
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      // Mock data for development
      setClients([
        {
          client_id: 1,
          nom_societe: 'Entreprise ABC',
          num_tva: 'BE0123456789',
          adresse: 'Rue de la Paix 123, 1000 Bruxelles',
          telephone: '+32 2 123 45 67',
          email: 'contact@entrepriseabc.be',
          est_actif: true,
          created_at: '2024-01-15T10:00:00Z',
          regle_facturation: {
            nom: 'Simple'
          },
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            course: 45,
            gestion_facture: 12
          }
        },
        {
          client_id: 2,
          nom_societe: 'Société XYZ',
          num_tva: 'BE0987654321',
          adresse: 'Avenue Louise 456, 1050 Ixelles',
          telephone: '+32 2 987 65 43',
          email: 'info@societexyz.be',
          est_actif: true,
          created_at: '2024-02-01T09:00:00Z',
          regle_facturation: {
            nom: 'Complet'
          },
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            course: 28,
            gestion_facture: 8
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = () => {
    setFormData({
      nom_societe: '',
      num_tva: '',
      adresse: '',
      telephone: '',
      email: '',
      regle_facturation_id: 1,
      est_actif: true,
      societe_id: 1
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditClient = (client) => {
    setFormData({
      nom_societe: client.nom_societe,
      num_tva: client.num_tva || '',
      adresse: client.adresse || '',
      telephone: client.telephone || '',
      email: client.email || '',
      regle_facturation_id: client.regle_facturation_id,
      est_actif: client.est_actif,
      societe_id: client.societe_id
    });
    setSelectedClient(client);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      await loadClients();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du client');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/clients' : `/api/clients/${selectedClient.client_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadClients();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du client');
    }
  };

  const filteredClients = clients.filter(client =>
    client.nom_societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm) ||
    client.num_tva?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6" />
            Gestion des clients
          </h2>
          <p className="text-gray-600 mt-1">Administrer les clients de la société</p>
        </div>
        <Button onClick={handleCreateClient} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouveau client
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par société, email, téléphone ou TVA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Société</Th>
              <Th>Contact</Th>
              <Th>N° TVA</Th>
              <Th>Règle facturation</Th>
              <Th>Statut</Th>
              <Th>Courses</Th>
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
            ) : filteredClients.length === 0 ? (
              <Tr>
                <Td colSpan={8} className="text-center py-8 text-gray-500">
                  Aucun client trouvé
                </Td>
              </Tr>
            ) : (
              filteredClients.map((client) => (
                <Tr key={client.client_id}>
                  <Td className="font-medium">
                    {client.nom_societe}
                  </Td>
                  <Td>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <EnvelopeIcon className="w-3 h-3" />
                          {client.email}
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center gap-1 text-sm">
                          <PhoneIcon className="w-3 h-3" />
                          {client.telephone}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td className="font-mono text-sm">
                    {client.num_tva || '-'}
                  </Td>
                  <Td>
                    <Badge className="bg-blue-100 text-blue-800">
                      {client.regle_facturation.nom}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge className={client.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {client.est_actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Td>
                  <Td>{client._count?.course || 0}</Td>
                  <Td>{client._count?.gestion_facture || 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewClient(client)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClient(client)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClient(client.client_id)}
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

      {/* Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails du client' :
          modalMode === 'create' ? 'Nouveau client' :
          'Modifier le client'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Société</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient?.nom_societe}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro TVA</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedClient?.num_tva || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient?.telephone || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient?.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient?.adresse || '-'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Règle de facturation</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient?.regle_facturation.nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient?.est_actif ? 'Actif' : 'Inactif'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Société</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient?.societe_taxi.nom_exploitant}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de courses</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient?._count?.course || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de factures</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient?._count?.gestion_facture || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom de la société"
              value={formData.nom_societe}
              onChange={(e) => setFormData({...formData, nom_societe: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Numéro TVA"
                value={formData.num_tva}
                onChange={(e) => setFormData({...formData, num_tva: e.target.value})}
                placeholder="BE0123456789"
              />
              <Input
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                placeholder="+32 2 123 45 67"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input
              label="Adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({...formData, adresse: e.target.value})}
            />
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Règle de facturation"
                value={formData.regle_facturation_id.toString()}
                onChange={(value) => setFormData({...formData, regle_facturation_id: parseInt(value)})}
                options={[
                  { value: '1', label: 'Simple' },
                  { value: '2', label: 'Justifie' },
                  { value: '3', label: 'Complet' },
                  { value: '4', label: 'Facture Bon InfoCourse' }
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
          </Form>
        )}
      </Modal>
    </div>
  );
}
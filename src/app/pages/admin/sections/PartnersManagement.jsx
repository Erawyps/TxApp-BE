import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Input, Select, Badge } from 'components/ui';
import {
  BuildingStorefrontIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function PartnersManagement() {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    nom_societe: '',
    adresse: '',
    telephone: '',
    email: '',
    num_tva: '',
    est_actif: true,
    societe_id: 1
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/partenaires');
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error);
      // Mock data for development
      setPartners([
        {
          partenaire_id: 1,
          nom_societe: 'Partenaire SA',
          adresse: 'Avenue des Partenaires 123, 1000 Bruxelles',
          telephone: '+32 2 123 45 67',
          email: 'contact@partenairesa.be',
          num_tva: 'BE0123456789',
          est_actif: true,
          created_at: '2024-01-15T10:00:00Z',
          societe_taxi: {
            nom_exploitant: 'Taxi Plus'
          },
          _count: {
            liaison_partenaire: 12
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePartner = () => {
    setFormData({
      nom_societe: '',
      adresse: '',
      telephone: '',
      email: '',
      num_tva: '',
      est_actif: true,
      societe_id: 1
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditPartner = (partner) => {
    setFormData({
      nom_societe: partner.nom_societe,
      adresse: partner.adresse || '',
      telephone: partner.telephone || '',
      email: partner.email || '',
      num_tva: partner.num_tva || '',
      est_actif: partner.est_actif,
      societe_id: partner.societe_id
    });
    setSelectedPartner(partner);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeletePartner = async (partnerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/partenaires/${partnerId}`, { method: 'DELETE' });
      await loadPartners();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du partenaire');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/partenaires' : `/api/partenaires/${selectedPartner.partenaire_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadPartners();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du partenaire');
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.nom_societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.telephone?.includes(searchTerm) ||
    partner.num_tva?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-6 h-6" />
            Gestion des partenaires
          </h2>
          <p className="text-gray-600 mt-1">Administrer les partenaires de la société</p>
        </div>
        <Button onClick={handleCreatePartner} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouveau partenaire
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

      {/* Partners Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Société</Th>
              <Th>Contact</Th>
              <Th>N° TVA</Th>
              <Th>Statut</Th>
              <Th>Transactions</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <Tr>
                <Td colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </Td>
              </Tr>
            ) : filteredPartners.length === 0 ? (
              <Tr>
                <Td colSpan={6} className="text-center py-8 text-gray-500">
                  Aucun partenaire trouvé
                </Td>
              </Tr>
            ) : (
              filteredPartners.map((partner) => (
                <Tr key={partner.partenaire_id}>
                  <Td className="font-medium">
                    {partner.nom_societe}
                  </Td>
                  <Td>
                    <div className="space-y-1">
                      {partner.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <EnvelopeIcon className="w-3 h-3" />
                          {partner.email}
                        </div>
                      )}
                      {partner.telephone && (
                        <div className="flex items-center gap-1 text-sm">
                          <PhoneIcon className="w-3 h-3" />
                          {partner.telephone}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td className="font-mono text-sm">
                    {partner.num_tva || '-'}
                  </Td>
                  <Td>
                    <Badge className={partner.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {partner.est_actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Td>
                  <Td>{partner._count?.liaison_partenaire || 0}</Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewPartner(partner)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditPartner(partner)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePartner(partner.partenaire_id)}
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

      {/* Partner Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails du partenaire' :
          modalMode === 'create' ? 'Nouveau partenaire' :
          'Modifier le partenaire'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Société</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPartner?.nom_societe}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro TVA</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedPartner?.num_tva || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner?.telephone || '-'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPartner?.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPartner?.adresse || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner?.est_actif ? 'Actif' : 'Inactif'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transactions</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPartner?._count?.liaison_partenaire || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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
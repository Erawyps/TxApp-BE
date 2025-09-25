import { useState, useEffect } from 'react';
import { Card, Button, Table, THead, TBody, Tr, Th, Td, Modal, Form, Input, Select } from 'components/ui';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useAuth } from 'hooks/useAuth';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    role: 'Driver',
    mot_de_passe: '',
    societe_id: 1
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Mock data for development
      setUsers([
        {
          user_id: 1,
          email: 'admin@txapp.be',
          nom: 'Dupont',
          prenom: 'Jean',
          role: 'Admin',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          user_id: 2,
          email: 'driver1@txapp.be',
          nom: 'Martin',
          prenom: 'Pierre',
          role: 'Driver',
          created_at: '2024-02-01T09:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setFormData({
      email: '',
      nom: '',
      prenom: '',
      role: 'Driver',
      mot_de_passe: '',
      societe_id: 1
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setFormData({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      mot_de_passe: '',
      societe_id: user.societe_id
    });
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/utilisateurs/${userId}`, { method: 'DELETE' });
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = modalMode === 'create' ? '/api/utilisateurs' : `/api/utilisateurs/${selectedUser.user_id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      // TODO: Replace with actual API call
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadUsers();
        setIsModalOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Controleur': return 'bg-blue-100 text-blue-800';
      case 'Driver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6" />
            Gestion des utilisateurs
          </h2>
          <p className="text-gray-600 mt-1">Administrer les comptes utilisateurs du système</p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Nouveau utilisateur
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

      {/* Users Table */}
      <Card className="overflow-hidden">
        <Table hoverable className="w-full">
          <THead>
            <Tr>
              <Th>Nom complet</Th>
              <Th>Email</Th>
              <Th>Rôle</Th>
              <Th>Date de création</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <Tr>
                <Td colSpan={5} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </Td>
              </Tr>
            ) : filteredUsers.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé
                </Td>
              </Tr>
            ) : (
              filteredUsers.map((user) => (
                <Tr key={user.user_id}>
                  <Td className="font-medium">
                    {user.prenom} {user.nom}
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </Td>
                  <Td>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewUser(user)}
                        className="p-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditUser(user)}
                        className="p-1"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      {user.user_id !== currentUser?.user_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'view' ? 'Détails de l\'utilisateur' :
          modalMode === 'create' ? 'Nouveau utilisateur' :
          'Modifier l\'utilisateur'
        }
      >
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.prenom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 text-sm text-gray-900">{selectedUser?.nom}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <p className="mt-1 text-sm text-gray-900">{selectedUser?.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de création</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedUser ? new Date(selectedUser.created_at).toLocaleDateString('fr-FR') : ''}
              </p>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                required
              />
              <Input
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Select
              label="Rôle"
              value={formData.role}
              onChange={(value) => setFormData({...formData, role: value})}
              options={[
                { value: 'Admin', label: 'Administrateur' },
                { value: 'Controleur', label: 'Contrôleur' },
                { value: 'Driver', label: 'Chauffeur' }
              ]}
              required
            />
            {modalMode === 'create' && (
              <Input
                label="Mot de passe"
                type="password"
                value={formData.mot_de_passe}
                onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})}
                required
              />
            )}
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
import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Badge } from 'components/ui';
import {
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

export default function CompanySettings() {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom_exploitant: '',
    adresse_siege: '',
    telephone: '',
    email: '',
    num_tva: '',
    num_licence: '',
    description: '',
    est_actif: true
  });

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/societe-taxi/1'); // Assuming company ID 1
      const data = await response.json();
      setCompany(data);
      setFormData({
        nom_exploitant: data.nom_exploitant || '',
        adresse_siege: data.adresse_siege || '',
        telephone: data.telephone || '',
        email: data.email || '',
        num_tva: data.num_tva || '',
        num_licence: data.num_licence || '',
        description: data.description || '',
        est_actif: data.est_actif
      });
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres société:', error);
      // Mock data for development
      const mockData = {
        societe_id: 1,
        nom_exploitant: 'Taxi Plus Brussels',
        adresse_siege: 'Avenue Louise 123, 1050 Bruxelles, Belgique',
        telephone: '+32 2 123 45 67',
        email: 'contact@taxibrussels.be',
        num_tva: 'BE0123456789',
        num_licence: 'LIC-2024-001',
        description: 'Service de taxi professionnel offrant des courses 24/7 dans la région bruxelloise.',
        est_actif: true,
        created_at: '2024-01-01T00:00:00Z',
        _count: {
          chauffeur: 25,
          vehicule: 15,
          client: 1500,
          course: 12500
        }
      };
      setCompany(mockData);
      setFormData({
        nom_exploitant: mockData.nom_exploitant,
        adresse_siege: mockData.adresse_siege,
        telephone: mockData.telephone,
        email: mockData.email,
        num_tva: mockData.num_tva,
        num_licence: mockData.num_licence,
        description: mockData.description,
        est_actif: mockData.est_actif
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      nom_exploitant: company.nom_exploitant || '',
      adresse_siege: company.adresse_siege || '',
      telephone: company.telephone || '',
      email: company.email || '',
      num_tva: company.num_tva || '',
      num_licence: company.num_licence || '',
      description: company.description || '',
      est_actif: company.est_actif
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/societe-taxi/${company.societe_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadCompanySettings();
        setIsEditing(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres société');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6" />
            Paramètres société
          </h2>
          <p className="text-gray-600 mt-1">Configuration générale de la société de taxi</p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
            Modifier
          </Button>
        )}
      </div>

      {/* Company Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Chauffeurs</p>
              <p className="text-2xl font-bold text-gray-900">{company?._count?.chauffeur || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Véhicules</p>
              <p className="text-2xl font-bold text-gray-900">{company?._count?.vehicule || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Clients</p>
              <p className="text-2xl font-bold text-gray-900">{company?._count?.client || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900">{company?._count?.course || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Company Information Form */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Informations société</h3>
          <Badge className={company?.est_actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {company?.est_actif ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nom de l'exploitant"
                value={formData.nom_exploitant}
                onChange={(e) => setFormData({...formData, nom_exploitant: e.target.value})}
                required
              />
              <Input
                label="Numéro TVA"
                value={formData.num_tva}
                onChange={(e) => setFormData({...formData, num_tva: e.target.value})}
                placeholder="BE0123456789"
              />
            </div>

            <Input
              label="Adresse du siège"
              value={formData.adresse_siege}
              onChange={(e) => setFormData({...formData, adresse_siege: e.target.value})}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                placeholder="+32 2 123 45 67"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Numéro de licence"
                value={formData.num_licence}
                onChange={(e) => setFormData({...formData, num_licence: e.target.value})}
                placeholder="LIC-2024-001"
              />
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="est_actif"
                  checked={formData.est_actif}
                  onChange={(e) => setFormData({...formData, est_actif: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="est_actif" className="text-sm font-medium text-gray-700">
                  Société active
                </label>
              </div>
            </div>

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description de la société..."
              rows={4}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={handleCancel} className="flex items-center gap-2">
                <XMarkIcon className="w-4 h-4" />
                Annuler
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4" />
                Sauvegarder
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de l&apos;exploitant</label>
                <p className="mt-1 text-sm text-gray-900">{company?.nom_exploitant || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro TVA</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{company?.num_tva || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                Adresse du siège
              </label>
              <p className="mt-1 text-sm text-gray-900">{company?.adresse_siege || '-'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Téléphone
                </label>
                <p className="mt-1 text-sm text-gray-900">{company?.telephone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">{company?.email || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Numéro de licence</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{company?.num_licence || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de création</label>
                <p className="mt-1 text-sm text-gray-900">
                  {company?.created_at ? new Date(company.created_at).toLocaleDateString('fr-BE') : '-'}
                </p>
              </div>
            </div>

            {company?.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{company.description}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
import { useState } from 'react';
import { useProfile, useAuth } from 'hooks/useAuth';
import { Button } from 'components/ui/Button';
import { Input } from 'components/ui/Input';
import { Select } from 'components/ui/Select';
import { Card } from 'components/ui/Card';
import { toast } from 'react-hot-toast';

/**
 * Composant de gestion du profil utilisateur
 */
export function UserProfile() {
  const { user } = useAuth();
  const { updateProfile, isLoading, error } = useProfile();
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    telephone: user?.telephone || '',
    adresse: user?.adresse || '',
    ville: user?.ville || '',
    code_postal: user?.code_postal || '',
    pays: user?.pays || 'Belgique'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        toast.success('Profil mis à jour avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
        <p className="text-gray-600">Gérez vos informations personnelles</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <Input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <Input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Téléphone *
          </label>
          <Input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            required
            className="w-full"
          />
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse
          </label>
          <Input
            type="text"
            name="adresse"
            value={formData.adresse}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ville
            </label>
            <Input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code postal
            </label>
            <Input
              type="text"
              name="code_postal"
              value={formData.code_postal}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <Select
              name="pays"
              value={formData.pays}
              onChange={handleInputChange}
              className="w-full"
            >
              <option value="Belgique">Belgique</option>
              <option value="France">France</option>
              <option value="Luxembourg">Luxembourg</option>
              <option value="Pays-Bas">Pays-Bas</option>
            </Select>
          </div>
        </div>

        {/* Informations en lecture seule */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations du compte
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d&apos;utilisateur
              </label>
              <Input
                type="text"
                value={user.type_utilisateur}
                disabled
                className="w-full bg-gray-50 capitalize"
              />
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFormData({
              nom: user?.nom || '',
              prenom: user?.prenom || '',
              telephone: user?.telephone || '',
              adresse: user?.adresse || '',
              ville: user?.ville || '',
              code_postal: user?.code_postal || '',
              pays: user?.pays || 'Belgique'
            })}
          >
            Annuler
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default UserProfile;

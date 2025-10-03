import { useState, useEffect } from 'react';
import {
  ClockIcon,
  TruckIcon,
  IdentificationIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { supabase } from 'utils/supabase';

export function ShiftInfo({ shift, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingVehicle, setIsChangingVehicle] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(shift?.vehicule_id || '');
  const [isUpdatingVehicle, setIsUpdatingVehicle] = useState(false);
  const [editData, setEditData] = useState({
    notes: shift?.notes || ''
  });

  useEffect(() => {
    if (shift?.vehicule_id) {
      setSelectedVehicleId(shift.vehicule_id);
    }
  }, [shift?.vehicule_id]);

  const fetchAvailableVehicles = async () => {
    try {
      // D'abord récupérer tous les véhicules actifs
      const { data: allVehicles, error: vehiclesError } = await supabase
        .from('vehicule')
        .select('id, plaque_immatriculation, marque, modele')
        .eq('actif', true)
        .order('plaque_immatriculation');

      if (vehiclesError) throw vehiclesError;

      // Ensuite récupérer les véhicules déjà utilisés par des shifts actifs (sauf le shift actuel)
      const { data: usedVehicles, error: usedError } = await supabase
        .from('feuille_route')
        .select('vehicule_id')
        .eq('statut', 'En cours')
        .neq('feuille_id', shift.feuille_id);

      if (usedError) throw usedError;

      // Créer un set des IDs de véhicules utilisés
      const usedVehicleIds = new Set(usedVehicles.map(uv => uv.vehicule_id));

      // Filtrer les véhicules disponibles
      const availableVehicles = allVehicles.filter(vehicle => !usedVehicleIds.has(vehicle.id));

      setAvailableVehicles(availableVehicles || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleVehicleChange = async () => {
    if (!selectedVehicleId || selectedVehicleId === shift.vehicule_id) {
      setIsChangingVehicle(false);
      return;
    }

    try {
      setIsUpdatingVehicle(true);

      // Vérifier que le véhicule n'est pas déjà utilisé par un autre shift actif
      const isVehicleAvailable = await checkVehicleAvailability(selectedVehicleId);
      if (!isVehicleAvailable) {
        alert('Ce véhicule est déjà utilisé par un autre chauffeur actif.');
        return;
      }

      // Utiliser la fonction onUpdate passée en prop pour mettre à jour le shift
      const result = await onUpdate({ vehicule_id: parseInt(selectedVehicleId) });

      if (result.success) {
        // Notifier l'admin du changement
        await notifyAdminOfVehicleChange(shift, selectedVehicleId);
        setIsChangingVehicle(false);
      } else {
        throw new Error(result.error || 'Erreur lors de la mise à jour du véhicule');
      }
    } catch (err) {
      console.error('Error updating vehicle:', err);
      alert('Erreur lors du changement de véhicule: ' + err.message);
    } finally {
      setIsUpdatingVehicle(false);
    }
  };

  const checkVehicleAvailability = async (vehicleId) => {
    try {
      const { data, error } = await supabase
        .from('feuille_route')
        .select('feuille_id, chauffeur_id')
        .eq('vehicule_id', vehicleId)
        .eq('statut', 'En cours')
        .neq('feuille_id', shift.feuille_id); // Exclure le shift actuel

      if (error) throw error;
      
      return data.length === 0; // Le véhicule est disponible si aucun autre shift actif ne l'utilise
    } catch (err) {
      console.error('Error checking vehicle availability:', err);
      return false;
    }
  };

  const notifyAdminOfVehicleChange = async (currentShift, newVehicleId) => {
    try {
      const newVehicle = availableVehicles.find(v => v.id === parseInt(newVehicleId));
      const oldVehicle = currentShift.vehicule;
      
      // Créer une notification pour les admins
      const notificationData = {
        type: 'vehicle_change',
        title: 'Changement de véhicule',
        message: `Le chauffeur ${currentShift.chauffeur?.prenom} ${currentShift.chauffeur?.nom} a changé de véhicule: ${oldVehicle?.plaque_immatriculation} → ${newVehicle?.plaque_immatriculation}`,
        data: {
          chauffeur_id: currentShift.chauffeur_id,
          ancien_vehicule_id: currentShift.vehicule_id,
          nouveau_vehicule_id: parseInt(newVehicleId),
          feuille_id: currentShift.feuille_id,
          date_changement: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      };

      // Pour l'instant, on stocke dans le localStorage (à remplacer par une vraie API de notifications)
      const existingNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      existingNotifications.unshift(notificationData);
      localStorage.setItem('admin_notifications', JSON.stringify(existingNotifications.slice(0, 50))); // Garder les 50 dernières

      console.log('Notification admin créée:', notificationData);
    } catch (err) {
      console.error('Error notifying admin:', err);
    }
  };

  const handleSave = async () => {
    try {
      await onUpdate(editData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating shift:', err);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = () => {
    if (!shift?.heure_debut) return '-';

    const now = new Date();
    const startTime = new Date(`${shift.date}T${shift.heure_debut}`);
    const diffMs = now - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (!shift) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <IdentificationIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Feuille de route active</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            En cours
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Modifier les notes"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Driver Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Chauffeur</h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium text-gray-900">
              {shift.chauffeur?.prenom} {shift.chauffeur?.nom}
            </p>
            <p className="text-gray-600">
              Badge: {shift.chauffeur?.numero_badge}
            </p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800 flex items-center">
              <TruckIcon className="h-4 w-4 mr-1" />
              Véhicule
            </h3>
            {!isChangingVehicle && (
              <button
                onClick={() => {
                  setIsChangingVehicle(true);
                  fetchAvailableVehicles();
                }}
                className="text-green-600 hover:text-green-800 text-xs font-medium"
                title="Changer de véhicule"
              >
                Changer
              </button>
            )}
          </div>
          
          {isChangingVehicle ? (
            <div className="space-y-2">
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isUpdatingVehicle}
              >
                {availableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plaque_immatriculation} - {vehicle.marque} {vehicle.modele}
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleVehicleChange}
                  disabled={isUpdatingVehicle || selectedVehicleId === shift.vehicule_id}
                  className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  {isUpdatingVehicle ? 'Mise à jour...' : 'Valider'}
                </button>
                <button
                  onClick={() => {
                    setIsChangingVehicle(false);
                    setSelectedVehicleId(shift.vehicule_id);
                  }}
                  disabled={isUpdatingVehicle}
                  className="flex items-center px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XMarkIcon className="h-3 w-3 mr-1" />
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">
                {shift.vehicule?.plaque_immatriculation}
              </p>
              <p className="text-gray-600">
                {shift.vehicule?.marque} {shift.vehicule?.modele}
              </p>
            </div>
          )}
        </div>

        {/* Time Info */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            Horaires
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Début:</span>
              <span className="font-medium">{formatTime(shift.heure_debut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Fin prévue:</span>
              <span className="font-medium">{formatTime(shift.heure_fin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Durée:</span>
              <span className="font-medium text-purple-700">{calculateDuration()}</span>
            </div>
          </div>
        </div>

        {/* Kilometer Info */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-orange-800 mb-2">Kilométrage</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Début:</span>
              <span className="font-medium">{shift.km_debut?.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actuel:</span>
              <span className="font-medium">
                {shift.km_fin ? `${shift.km_fin.toLocaleString()} km` : 'En cours'}
              </span>
            </div>
            {shift.km_fin && (
              <div className="flex justify-between">
                <span className="text-gray-600">Parcourus:</span>
                <span className="font-medium text-orange-700">
                  {(shift.km_fin - shift.km_debut).toLocaleString()} km
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date and interruptions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Date de service</h4>
          <p className="text-lg font-medium text-gray-900">{formatDate(shift.date)}</p>
        </div>

        {shift.interruptions && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Interruptions prévues</h4>
            <p className="text-lg font-medium text-gray-900">
              {shift.interruptions}
            </p>
          </div>
        )}
      </div>

      {/* Notes section */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Notes de service</h4>
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              placeholder="Notes sur cette feuille de route (ex: remplacement de dernière minute, négociation rémunération...)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-700 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            {shift.notes ? (
              <p className="bg-gray-50 p-3 rounded border">{shift.notes}</p>
            ) : (
              <p className="text-gray-400 italic">Aucune note pour cette feuille de route</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

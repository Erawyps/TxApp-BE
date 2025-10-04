import { useState, useEffect, useCallback } from 'react';
import { supabase } from 'utils/supabase';
import axios from 'axios';

export function useDriverShift(chauffeurId) {
  const [currentShift, setCurrentShift] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la feuille de route active du chauffeur
  const fetchCurrentShift = useCallback(async () => {
    if (!chauffeurId) {
      setCurrentShift(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('feuille_route')
        .select(`
          feuille_id,
          chauffeur_id,
          vehicule_id,
          date_service,
          mode_encodage,
          heure_debut,
          heure_fin,
          interruptions,
          index_km_debut_tdb,
          index_km_fin_tdb,
          montant_salaire_cash_declare,
          est_validee,
          date_validation,
          validated_by,
          created_at,
          vehicule:vehicule_id (
            vehicule_id,
            plaque_immatriculation,
            marque,
            modele,
            est_actif
          )
        `)
        .eq('chauffeur_id', chauffeurId)
        .eq('est_validee', false)
        .order('date_service', { ascending: false })
        .limit(1)
        .maybeSingle(); // Utiliser maybeSingle pour éviter les erreurs si aucun résultat

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de la feuille de route:', error);
        throw error;
      }

      setCurrentShift(data || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching current shift:', err);
      setError(err.message);
      setCurrentShift(null);
    } finally {
      setIsLoading(false);
    }
  }, [chauffeurId]);

  // Créer une nouvelle feuille de route
  const createShift = async (shiftData) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feuille_route')
        .insert({
          chauffeur_id: chauffeurId,
          vehicule_id: shiftData.vehicule_id,
          date_service: shiftData.date_service || new Date().toISOString().split('T')[0],
          mode_encodage: shiftData.mode_encodage || 'LIVE',
          heure_debut: shiftData.heure_debut,
          index_km_debut_tdb: shiftData.index_km_debut_tdb,
          interruptions: shiftData.interruptions || '',
          montant_salaire_cash_declare: shiftData.montant_salaire_cash_declare || 0
        })
        .select(`
          feuille_id,
          chauffeur_id,
          vehicule_id,
          date_service,
          mode_encodage,
          heure_debut,
          heure_fin,
          interruptions,
          index_km_debut_tdb,
          index_km_fin_tdb,
          montant_salaire_cash_declare,
          est_validee,
          created_at,
          vehicule:vehicule_id (
            vehicule_id,
            plaque_immatriculation,
            marque,
            modele,
            est_actif
          )
        `)
        .single();

      if (error) throw error;

      setCurrentShift(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating shift:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Terminer la feuille de route actuelle
  const endShift = async (endData) => {
    if (!currentShift) return { success: false, error: 'Aucune feuille de route active' };

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('feuille_route')
        .update({
          heure_fin: endData.heure_fin,
          index_km_fin_tdb: endData.km_fin,
          interruptions: endData.notes || '',
          est_validee: false // Le shift est terminé mais pas encore validé administrativement
        })
        .eq('feuille_id', currentShift.feuille_id);

      if (error) throw error;

      setCurrentShift(null);
      return { success: true };
    } catch (err) {
      console.error('Error ending shift:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour la feuille de route
  const updateShift = async (updateData) => {
    if (!currentShift) return { success: false, error: 'Aucune feuille de route active' };

    try {
      const { data, error } = await supabase
        .from('feuille_route')
        .update({
          vehicule_id: updateData.vehicule_id,
          mode_encodage: updateData.mode_encodage,
          heure_debut: updateData.heure_debut,
          heure_fin: updateData.heure_fin,
          interruptions: updateData.interruptions,
          index_km_debut_tdb: updateData.index_km_debut_tdb,
          index_km_fin_tdb: updateData.index_km_fin_tdb,
          montant_salaire_cash_declare: updateData.montant_salaire_cash_declare
        })
        .eq('feuille_id', currentShift.feuille_id)
        .select(`
          feuille_id,
          chauffeur_id,
          vehicule_id,
          date_service,
          mode_encodage,
          heure_debut,
          heure_fin,
          interruptions,
          index_km_debut_tdb,
          index_km_fin_tdb,
          montant_salaire_cash_declare,
          est_validee,
          created_at,
          vehicule:vehicule_id (
            vehicule_id,
            plaque_immatriculation,
            marque,
            modele,
            est_actif
          )
        `)
        .single();

      if (error) throw error;

      setCurrentShift(data);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating shift:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Charger la feuille de route au montage du composant
  useEffect(() => {
    fetchCurrentShift();
  }, [chauffeurId, fetchCurrentShift]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!chauffeurId) return;

    const subscription = supabase
      .channel('shift_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feuille_route',
          filter: `chauffeur_id=eq.${chauffeurId}`
        },
        () => {
          fetchCurrentShift();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chauffeurId, fetchCurrentShift]);

  // Changer de véhicule pour la feuille de route actuelle
  const changeVehicle = useCallback(async (newVehiculeId) => {
    if (!currentShift) return { success: false, error: 'Aucune feuille de route active' };

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await axios.patch(
        `http://localhost:3001/api/feuilles-route/${currentShift.feuille_id}/change-vehicle`,
        {
          newVehiculeId: newVehiculeId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Mettre à jour le shift local avec les nouvelles données
        setCurrentShift(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        throw new Error('Erreur lors du changement de véhicule');
      }
    } catch (err) {
      console.error('Error changing vehicle:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du changement de véhicule';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentShift]);

  return {
    currentShift,
    isLoading,
    error,
    createShift,
    endShift,
    updateShift,
    changeVehicle,
    refreshShift: fetchCurrentShift
  };
}

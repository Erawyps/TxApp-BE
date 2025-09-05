import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export function useDriverShift(chauffeurId) {
  const [currentShift, setCurrentShift] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger la feuille de route active du chauffeur
  const fetchCurrentShift = async () => {
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
          *,
          vehicule:vehicule_id (
            id,
            plaque_immatriculation,
            marque,
            modele,
            actif
          )
        `)
        .eq('chauffeur_id', chauffeurId)
        .eq('statut', 'En cours')
        .order('date', { ascending: false })
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
  };

  // Créer une nouvelle feuille de route
  const createShift = async (shiftData) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feuille_route')
        .insert({
          ...shiftData,
          chauffeur_id: chauffeurId,
          statut: 'En cours',
          date: shiftData.date || new Date().toISOString().split('T')[0]
        })
        .select(`
          *,
          chauffeur:chauffeur_id (
            id,
            nom,
            prenom,
            numero_badge,
            telephone
          ),
          vehicule:vehicule_id (
            id,
            plaque_immatriculation,
            marque,
            modele,
            actif
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
          ...endData,
          statut: 'Terminée',
          heure_fin: endData.heure_fin || new Date().toISOString()
        })
        .eq('id', currentShift.id);

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
        .update(updateData)
        .eq('id', currentShift.id)
        .select(`
          *,
          chauffeur:chauffeur_id (
            id,
            nom,
            prenom,
            numero_badge,
            telephone
          ),
          vehicule:vehicule_id (
            id,
            plaque_immatriculation,
            marque,
            modele,
            actif
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
  }, [chauffeurId]);

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
  }, [chauffeurId]);

  return {
    currentShift,
    isLoading,
    error,
    createShift,
    endShift,
    updateShift,
    refreshShift: fetchCurrentShift
  };
}

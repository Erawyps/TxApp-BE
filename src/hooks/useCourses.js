import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export function useCourses(feuilleRouteId) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (feuilleRouteId) {
      fetchCourses();

      // Set up real-time subscription for live updates
      const subscription = supabase
        .channel(`courses_${feuilleRouteId}`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'course',
            filter: `feuille_route_id=eq.${feuilleRouteId}`
          },
          (payload) => {
            handleRealtimeUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [feuilleRouteId]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('course')
        .select(`
          *,
          client:client_id(nom, prenom),
          mode_paiement:mode_paiement_id(libelle, code)
        `)
        .eq('feuille_route_id', feuilleRouteId)
        .order('numero_ordre', { ascending: false });

      if (error) throw error;

      setCourses(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setCourses(prevCourses => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prevCourses];
        case 'UPDATE':
          return prevCourses.map(course =>
            course.id === newRecord.id ? { ...course, ...newRecord } : course
          );
        case 'DELETE':
          return prevCourses.filter(course => course.id !== oldRecord.id);
        default:
          return prevCourses;
      }
    });
  };

  const createCourse = async (courseData) => {
    try {
      // Auto-save logic: save immediately when field loses focus
      const courseRecord = {
        feuille_route_id: feuilleRouteId,
        numero_ordre: courseData.numero_ordre || (courses.length + 1),
        index_depart: courseData.index_depart,
        lieu_embarquement: courseData.lieu_embarquement,
        heure_embarquement: courseData.heure_embarquement,
        index_arrivee: courseData.index_arrivee,
        lieu_debarquement: courseData.lieu_debarquement,
        heure_debarquement: courseData.heure_debarquement,
        prix_taximetre: courseData.prix_taximetre,
        somme_percue: courseData.somme_percue,
        mode_paiement_id: courseData.mode_paiement_id,
        client_id: courseData.client_id,
        notes: courseData.notes,
        hors_creneau: courseData.hors_creneau || false
      };

      // Validation: somme_percue cannot exceed prix_taximetre (except for tips)
      if (courseRecord.somme_percue > courseRecord.prix_taximetre) {
        throw new Error('Le montant perçu ne peut pas dépasser le prix du taximètre');
      }

      // Validation: index_arrivee must be greater than index_depart
      if (courseRecord.index_arrivee <= courseRecord.index_depart) {
        throw new Error('L\'index d\'arrivée doit être supérieur à l\'index de départ');
      }

      const { data, error } = await supabase
        .from('course')
        .insert([courseRecord])
        .select(`
          *,
          client:client_id(nom, prenom),
          mode_paiement:mode_paiement_id(libelle, code)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCourse = async (courseId, updates) => {
    try {
      // Real-time auto-save when field loses focus
      const { data, error } = await supabase
        .from('course')
        .update(updates)
        .eq('id', courseId)
        .select(`
          *,
          client:client_id(nom, prenom),
          mode_paiement:mode_paiement_id(libelle, code)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      const { error } = await supabase
        .from('course')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const cancelCourse = async (courseId) => {
    try {
      const updates = {
        heure_debarquement: null,
        somme_percue: 0,
        mode_paiement_id: null,
        notes: 'Course annulée'
      };

      return await updateCourse(courseId, updates);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Auto-save function for real-time field updates
  const autoSaveField = async (courseId, fieldName, value) => {
    try {
      await supabase
        .from('course')
        .update({ [fieldName]: value })
        .eq('id', courseId);
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  };

  return {
    courses,
    isLoading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    cancelCourse,
    autoSaveField,
    refreshCourses: fetchCourses
  };
}

import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export function useShiftHistory(chauffeurId, options = {}) {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: options.pageSize || 10,
    totalPages: 0,
    totalItems: 0
  });

  const fetchShifts = async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('feuille_route')
        .select(`
          *,
          chauffeur:chauffeur_id(nom, prenom, numero_badge),
          vehicule:vehicule_id(plaque_immatriculation, marque, modele),
          courses:course(count),
          total_revenue:course(somme_percue.sum()),
          total_expenses:charge(montant.sum())
        `, { count: 'exact' })
        .eq('chauffeur_id', chauffeurId)
        .order('date', { ascending: false });

      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      if (filters.status) {
        query = query.eq('statut', filters.status);
      }

      // Apply pagination
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setShifts(data || []);
      setPagination(prev => ({
        ...prev,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / prev.pageSize)
      }));

    } catch (err) {
      setError(err.message);
      console.error('Error fetching shift history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getShiftDetails = async (shiftId) => {
    try {
      const { data, error } = await supabase
        .from('feuille_route')
        .select(`
          *,
          chauffeur:chauffeur_id(nom, prenom, numero_badge),
          vehicule:vehicule_id(plaque_immatriculation, marque, modele),
          courses:course(*),
          expenses:charge(*)
        `)
        .eq('id', shiftId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching shift details:', err);
      throw err;
    }
  };

  const exportShiftData = async (shiftIds = [], format = 'csv') => {
    try {
      const { data, error } = await supabase
        .from('feuille_route')
        .select(`
          *,
          chauffeur:chauffeur_id(nom, prenom, numero_badge),
          vehicule:vehicule_id(plaque_immatriculation, marque, modele),
          courses:course(*),
          expenses:charge(*)
        `)
        .in('id', shiftIds.length > 0 ? shiftIds : shifts.map(s => s.id));

      if (error) throw error;

      if (format === 'csv') {
        return convertToCSV(data);
      }
      return data;
    } catch (err) {
      console.error('Error exporting shift data:', err);
      throw err;
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      'Date',
      'Chauffeur',
      'Véhicule',
      'Début',
      'Fin',
      'Statut',
      'Km Début',
      'Km Fin',
      'Km Parcourus',
      'Nb Courses',
      'Recettes',
      'Charges'
    ];

    const rows = data.map(shift => [
      shift.date,
      `${shift.chauffeur?.prenom} ${shift.chauffeur?.nom}`,
      shift.vehicule?.plaque_immatriculation,
      shift.heure_debut,
      shift.heure_fin || '-',
      shift.statut,
      shift.km_debut,
      shift.km_fin || '-',
      shift.km_parcourus || '-',
      shift.courses?.length || 0,
      shift.courses?.reduce((sum, c) => sum + (parseFloat(c.somme_percue) || 0), 0).toFixed(2),
      shift.expenses?.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0).toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  };

  useEffect(() => {
    if (chauffeurId) {
      fetchShifts();
    }
  }, [chauffeurId, pagination.page]);

  return {
    shifts,
    isLoading,
    error,
    pagination,
    fetchShifts,
    getShiftDetails,
    exportShiftData,
    setPagination
  };
}

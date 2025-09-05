import { useState, useEffect } from 'react';
import { supabase } from 'utils/supabase';

export function useExpenses(feuilleRouteId) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (feuilleRouteId) {
      fetchExpenses();

      // Set up real-time subscription for live updates
      const subscription = supabase
        .channel(`expenses_${feuilleRouteId}`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'charge',
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

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('charge')
        .select(`
          *,
          mode_paiement:mode_paiement_id(libelle, code)
        `)
        .eq('feuille_route_id', feuilleRouteId)
        .order('date', { ascending: false });

      if (error) throw error;

      setExpenses(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealtimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setExpenses(prevExpenses => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...prevExpenses];
        case 'UPDATE':
          return prevExpenses.map(expense =>
            expense.id === newRecord.id ? { ...expense, ...newRecord } : expense
          );
        case 'DELETE':
          return prevExpenses.filter(expense => expense.id !== oldRecord.id);
        default:
          return prevExpenses;
      }
    });
  };

  const createExpense = async (expenseData) => {
    try {
      const expenseRecord = {
        feuille_route_id: feuilleRouteId,
        type_charge: expenseData.type_charge,
        description: expenseData.description,
        montant: expenseData.montant,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        mode_paiement_id: expenseData.mode_paiement_id,
        justificatif: expenseData.justificatif,
        notes: expenseData.notes
      };

      const { data, error } = await supabase
        .from('charge')
        .insert([expenseRecord])
        .select(`
          *,
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

  const updateExpense = async (expenseId, updates) => {
    try {
      const { data, error } = await supabase
        .from('charge')
        .update(updates)
        .eq('id', expenseId)
        .select(`
          *,
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

  const deleteExpense = async (expenseId) => {
    try {
      const { error } = await supabase
        .from('charge')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    expenses,
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses: fetchExpenses
  };
}

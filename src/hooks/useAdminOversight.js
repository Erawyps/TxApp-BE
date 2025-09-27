import { useState, useEffect, useCallback } from 'react';
import { supabase } from 'utils/supabase';

export function useAdminOversight() {
  const [activeShifts, setActiveShifts] = useState([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feuille_route')
        .select(`
          *,
          chauffeur!inner(
            chauffeur_id,
            statut,
            utilisateur!chauffeur_id(
              user_id,
              nom,
              prenom
            )
          ),
          vehicule(plaque_immatriculation, marque, modele),
          courses:course!feuille_id(
            course_id, 
            heure_embarquement, 
            heure_debarquement, 
            lieu_embarquement, 
            lieu_debarquement,
            sommes_percues,
            prix_taximetre,
            index_depart,
            index_debarquement
          ),
          expenses:charge!feuille_id(charge_id, montant, description)
        `)
        .eq('chauffeur.statut', 'Actif')
        .order('date_service', { ascending: false });

      if (error) throw error;

      // Calculate real-time statistics for each shift
      const enrichedShifts = (data || []).map(shift => {
        const activeCourses = shift.courses?.filter(c => !c.heure_debarquement) || [];
        const completedCourses = shift.courses?.filter(c => c.heure_debarquement) || [];
        const totalRevenue = completedCourses.reduce((sum, c) => sum + (parseFloat(c.sommes_percues) || 0), 0);
        const totalExpenses = shift.expenses?.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0) || 0;

        // Calculate shift duration
        const startTime = new Date(`${shift.date_service}T${shift.heure_debut}`);
        const currentTime = new Date();
        const durationHours = (currentTime - startTime) / (1000 * 60 * 60);

        return {
          ...shift,
          stats: {
            activeCourses: activeCourses.length,
            completedCourses: completedCourses.length,
            totalRevenue,
            totalExpenses,
            netRevenue: totalRevenue - totalExpenses,
            durationHours: durationHours.toFixed(1),
            lastActivity: getLastActivity(shift.courses)
          }
        };
      });

      setActiveShifts(enrichedShifts);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching active shifts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleShiftUpdate = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setRealtimeUpdates(prev => [{
      id: Date.now(),
      type: 'shift',
      event: eventType,
      data: newRecord || oldRecord,
      timestamp: new Date()
    }, ...prev.slice(0, 49)]); // Keep last 50 updates

    // Refresh active shifts when there's an update
    fetchActiveShifts();
  }, [fetchActiveShifts]);

  const handleCourseUpdate = useCallback((payload) => {
    const { eventType, new: newRecord } = payload;

    setRealtimeUpdates(prev => [{
      id: Date.now(),
      type: 'course',
      event: eventType,
      data: newRecord,
      timestamp: new Date()
    }, ...prev.slice(0, 49)]);

    // Check for potential alerts
    if (newRecord && eventType === 'INSERT') {
      // checkCourseAlerts(newRecord); // Commented out - alerte table doesn't exist
    }

    // Refresh active shifts
    fetchActiveShifts();
  }, [fetchActiveShifts]);

  const handleExpenseUpdate = useCallback((payload) => {
    const { eventType, new: newRecord } = payload;

    setRealtimeUpdates(prev => [{
      id: Date.now(),
      type: 'expense',
      event: eventType,
      data: newRecord,
      timestamp: new Date()
    }, ...prev.slice(0, 49)]);

    // Check for expense alerts
    if (newRecord && eventType === 'INSERT') {
      // checkExpenseAlerts(newRecord); // Commented out - alerte table doesn't exist
    }

    // Refresh active shifts
    fetchActiveShifts();
  }, [fetchActiveShifts]);

  useEffect(() => {
    fetchActiveShifts();
    // fetchAlerts(); // Commented out - alerte table doesn't exist

    // Set up real-time subscriptions for live monitoring
    const shiftsSubscription = supabase
      .channel('admin_shifts_monitor')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feuille_route',
          filter: 'statut=eq.En cours'
        },
        (payload) => {
          handleShiftUpdate(payload);
        }
      )
      .subscribe();

    const coursesSubscription = supabase
      .channel('admin_courses_monitor')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course'
        },
        (payload) => {
          handleCourseUpdate(payload);
        }
      )
      .subscribe();

    const expensesSubscription = supabase
      .channel('admin_expenses_monitor')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'charge'
        },
        (payload) => {
          handleExpenseUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      shiftsSubscription.unsubscribe();
      coursesSubscription.unsubscribe();
      expensesSubscription.unsubscribe();
    };
  }, [fetchActiveShifts, handleShiftUpdate, handleCourseUpdate, handleExpenseUpdate]);

  // Commented out - alerte table doesn't exist in schema
  /*
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerte')
        .select(`
          *,
          feuille_route:feuille_route_id(
            id,
            date,
            chauffeur:chauffeur_id(nom, prenom)
          ),
          course:course_id(
            id,
            lieu_embarquement,
            lieu_debarquement
          )
        `)
        .eq('resolu', false)
        .order('date_alerte', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };
  */

  const getLastActivity = (courses) => {
    if (!courses || courses.length === 0) return null;

    const lastCourse = courses
      .filter(c => c.heure_embarquement)
      .sort((a, b) => new Date(b.heure_embarquement) - new Date(a.heure_embarquement))[0];

    return lastCourse ? new Date(lastCourse.heure_embarquement) : null;
  };

  // Commented out - alerte table doesn't exist in schema
  /*
  const checkCourseAlerts = async (course) => {
    const alerts = [];

    // Alert for high amounts
    if (parseFloat(course.somme_percue) > 100) {
      alerts.push({
        type_alerte: 'montant_eleve',
        severite: 'medium',
        message: `Montant élevé détecté: €${course.somme_percue}`,
        course_id: course.id,
        feuille_route_id: course.feuille_route_id
      });
    }

    // Alert for amount > taximeter
    if (parseFloat(course.somme_percue) > parseFloat(course.prix_taximetre)) {
      alerts.push({
        type_alerte: 'montant_superieur_taximetre',
        severite: 'high',
        message: `Montant perçu (€${course.somme_percue}) > Prix taximètre (€${course.prix_taximetre})`,
        course_id: course.id,
        feuille_route_id: course.feuille_route_id
      });
    }

    // Alert for long distance courses
    if (course.index_arrivee && course.index_depart) {
      const distance = course.index_arrivee - course.index_depart;
      if (distance > 50) {
        alerts.push({
          type_alerte: 'course_longue_distance',
          severite: 'low',
          message: `Course longue distance: ${distance} km`,
          course_id: course.id,
          feuille_route_id: course.feuille_route_id
        });
      }
    }

    // Create alerts in database
    if (alerts.length > 0) {
      try {
        await supabase.from('alerte').insert(alerts);
        // fetchAlerts(); // Refresh alerts
      } catch (err) {
        console.error('Error creating course alerts:', err);
      }
    }
  };
  */

  // Commented out - alerte table doesn't exist in schema
  /*
  const checkExpenseAlerts = async (expense) => {
    try {
      // Alert for high expenses
      if (parseFloat(expense.montant) > 50) {
        const alert = {
          type_alerte: 'charge_elevee',
          severite: 'medium',
          message: `Charge élevée: €${expense.montant} (${expense.type_charge || expense.description})`,
          feuille_route_id: expense.feuille_route_id
        };

        await supabase.from('alerte').insert([alert]);
        // fetchAlerts();
      }

      // Alert for suspicious expense patterns
      if (expense.type_charge === 'carburant' && parseFloat(expense.montant) > 100) {
        const alert = {
          type_alerte: 'carburant_suspect',
          severite: 'high',
          message: `Charge carburant très élevée: €${expense.montant}`,
          feuille_route_id: expense.feuille_route_id
        };

        await supabase.from('alerte').insert([alert]);
        // fetchAlerts();
      }
    } catch (err) {
      console.error('Error creating expense alerts:', err);
    }
  };
  */

  // Commented out - alerte table doesn't exist in schema
  /*
  const resolveAlert = async (alertId, resolvedBy) => {
    try {
      await supabase
        .from('alerte')
        .update({
          resolu: true,
          date_resolution: new Date().toISOString(),
          resolu_par: resolvedBy
        })
        .eq('id', alertId);

      // fetchAlerts(); // Refresh alerts
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  };
  */

  const getShiftPerformanceMetrics = () => {
    const totalRevenue = activeShifts.reduce((sum, s) => sum + s.stats.totalRevenue, 0);
    const totalExpenses = activeShifts.reduce((sum, s) => sum + s.stats.totalExpenses, 0);
    const totalCourses = activeShifts.reduce((sum, s) => sum + s.stats.completedCourses, 0);
    const averageRevenuePerShift = activeShifts.length > 0 ? totalRevenue / activeShifts.length : 0;
    const averageCoursesPerShift = activeShifts.length > 0 ? totalCourses / activeShifts.length : 0;

    return {
      activeShiftsCount: activeShifts.length,
      totalRevenue,
      totalExpenses,
      netRevenue: totalRevenue - totalExpenses,
      totalCourses,
      averageRevenuePerShift,
      averageCoursesPerShift,
      alertsCount: 0 // alerts disabled - table doesn't exist
    };
  };

  const exportLiveData = async (format = 'csv') => {
    try {
      const data = activeShifts.map(shift => ({
        date: shift.date,
        chauffeur: `${shift.chauffeur?.utilisateur?.prenom || ''} ${shift.chauffeur?.utilisateur?.nom || ''}`,
        vehicule: shift.vehicule?.plaque_immatriculation || '',
        heure_debut: shift.heure_debut,
        duree_heures: shift.stats.durationHours,
        courses_terminees: shift.stats.completedCourses,
        courses_actives: shift.stats.activeCourses,
        recettes: shift.stats.totalRevenue.toFixed(2),
        charges: shift.stats.totalExpenses.toFixed(2),
        net: shift.stats.netRevenue.toFixed(2),
        derniere_activite: shift.stats.lastActivity ? shift.stats.lastActivity.toISOString() : ''
      }));

      if (format === 'csv') {
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        return csvContent;
      }

      return data;
    } catch (err) {
      console.error('Error exporting live data:', err);
      throw err;
    }
  };

  const getDriverPerformance = (driverId) => {
    const driverShifts = activeShifts.filter(s => s.chauffeur_id === driverId);
    if (driverShifts.length === 0) return null;

    const totalRevenue = driverShifts.reduce((sum, s) => sum + s.stats.totalRevenue, 0);
    const totalCourses = driverShifts.reduce((sum, s) => sum + s.stats.completedCourses, 0);
    const totalHours = driverShifts.reduce((sum, s) => sum + parseFloat(s.stats.durationHours), 0);

    return {
      totalRevenue,
      totalCourses,
      totalHours,
      revenuePerHour: totalHours > 0 ? totalRevenue / totalHours : 0,
      coursesPerHour: totalHours > 0 ? totalCourses / totalHours : 0
    };
  };

  const refreshData = () => {
    fetchActiveShifts();
    // fetchAlerts(); // Commented out - alerte table doesn't exist
  };

  return {
    activeShifts,
    realtimeUpdates,
    isLoading,
    error,
    fetchActiveShifts,
    // resolveAlert, // Commented out - alerte table doesn't exist
    getShiftPerformanceMetrics,
    exportLiveData,
    getDriverPerformance,
    refreshData
  };
}

// Vue Chauffeur Corrigée - Respect du modèle Prisma
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from 'hooks/useAuth';
import { Page } from 'components/shared/Page';
import { Button } from 'components/ui';
import { toast } from 'sonner';
import {
  ChartBarIcon,
  TruckIcon,
  PlayIcon,
  StopIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Services respectant le modèle Prisma
import { 
  createFeuilleRoute, 
  updateFeuilleRoute, 
  getActiveFeuilleRoute 
} from 'services/feuillesRoute';
import { 
  createCourse, 
  getCoursesByFeuille 
} from 'services/courses';
import { getVehicules } from 'services/vehicules';
import { getClients } from 'services/clients';
import { getModesPaiement } from 'services/modesPaiement';

// Components
import ShiftDashboard from './components/ShiftDashboard';
import NewShiftForm from './components/NewShiftForm';
import LiveCourseForm from './components/LiveCourseForm';
import DriverCoursesList from './components/DriverCoursesList';
import EndShiftForm from './components/EndShiftForm';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { key: 'shift', label: 'Nouveau Shift', icon: PlayIcon },
  { key: 'courses', label: 'Courses', icon: TruckIcon },
  { key: 'end', label: 'Fin de Shift', icon: StopIcon }
];

export default function DriverView() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // État principal du shift selon le modèle Prisma
  const [currentShift, setCurrentShift] = useState(null); // feuille_route
  const [courses, setCourses] = useState([]); // course[]
  const [isShiftActive, setIsShiftActive] = useState(false);

  // Données de référence
  const [vehicules, setVehicules] = useState([]);
  const [clients, setClients] = useState([]);
  const [modesPaiement, setModesPaiement] = useState([]);

  // État des modales
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Validation de l'authentification selon le modèle Prisma
  const chauffeurId = useMemo(() => {
    if (!user || !isAuthenticated) return null;
    
    // Selon le modèle Prisma: chauffeur.chauffeur_id = utilisateur.user_id
    return user.chauffeur_id || user.user_id || user.id;
  }, [user, isAuthenticated]);

  // Fonctions de chargement des données
  const loadShiftCourses = useCallback(async (feuilleId) => {
    try {
      const coursesData = await getCoursesByFeuille(feuilleId);
      setCourses(coursesData || []);
      
      console.log('📋 Courses chargées:', coursesData?.length || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des courses:', error);
    }
  }, []);

  const checkActiveShift = useCallback(async () => {
    try {
      // Chercher une feuille_route active selon le modèle Prisma
      const activeShift = await getActiveFeuilleRoute(chauffeurId);
      
      if (activeShift && !activeShift.est_validee) {
        setCurrentShift(activeShift);
        setIsShiftActive(true);
        
        // Charger les courses de cette feuille_route
        if (activeShift.feuille_id) {
          await loadShiftCourses(activeShift.feuille_id);
        }
        
        console.log('✅ Shift actif trouvé:', {
          feuille_id: activeShift.feuille_id,
          chauffeur_id: activeShift.chauffeur_id,
          vehicule_id: activeShift.vehicule_id,
          mode_encodage: activeShift.mode_encodage,
          date_service: activeShift.date_service
        });
      } else {
        setCurrentShift(null);
        setIsShiftActive(false);
        setCourses([]);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du shift actif:', error);
    }
  }, [chauffeurId, loadShiftCourses]);

  // Chargement initial des données
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      // Charger les données de référence en parallèle
      const [vehiculesData, clientsData, modesData] = await Promise.all([
        getVehicules(),
        getClients(),
        getModesPaiement()
      ]);

      setVehicules(vehiculesData || []);
      setClients(clientsData || []);
      setModesPaiement(modesData || []);

      // Vérifier s'il y a un shift actif selon le modèle Prisma
      await checkActiveShift();

    } catch (error) {
      console.error('Erreur lors du chargement initial:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [checkActiveShift]);

  useEffect(() => {
    if (!chauffeurId) {
      setLoading(false);
      return;
    }

    loadInitialData();
  }, [chauffeurId, loadInitialData]);

  // Démarrer un nouveau shift selon le modèle Prisma
  const handleStartShift = async (shiftData) => {
    try {
      setLoading(true);

      // Terminer automatiquement le shift précédent s'il existe
      if (currentShift && !currentShift.est_validee) {
        await handleEndShift({
          heure_fin: new Date().toTimeString().slice(0, 5),
          km_fin: shiftData.index_km_debut_tdb,
          auto_end: true
        });
      }

      // Créer nouvelle feuille_route selon le modèle Prisma
      const newShiftData = {
        chauffeur_id: chauffeurId,
        vehicule_id: parseInt(shiftData.vehicule_id),
        date_service: shiftData.date_service || new Date().toISOString().split('T')[0],
        mode_encodage: shiftData.mode_encodage || 'LIVE',
        heure_debut: shiftData.heure_debut,
        heure_fin: null, // Sera rempli à la fin du shift
        interruptions: shiftData.interruptions || '',
        index_km_debut_tdb: parseInt(shiftData.index_km_debut_tdb),
        index_km_fin_tdb: null, // Sera rempli à la fin du shift
        montant_salaire_cash_declare: 0, // Sera calculé pendant le shift
        est_validee: false
      };

      const createdShift = await createFeuilleRoute(newShiftData);
      
      if (createdShift) {
        setCurrentShift(createdShift);
        setIsShiftActive(true);
        setCourses([]);
        
        toast.success('Shift démarré avec succès !');
        setActiveTab('courses'); // Basculer automatiquement vers les courses
        
        console.log('✅ Nouveau shift créé:', {
          feuille_id: createdShift.feuille_id,
          mode_encodage: createdShift.mode_encodage,
          vehicule_id: createdShift.vehicule_id
        });
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du shift:', error);
      toast.error('Erreur lors du démarrage du shift');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une course selon le modèle Prisma
  const handleAddCourse = async (courseData) => {
    if (!currentShift) {
      toast.error('Aucun shift actif');
      return;
    }

    try {
      // Calculer le numéro d'ordre automatiquement
      const nextOrdre = Math.max(0, ...courses.map(c => c.num_ordre || 0)) + 1;
      
      const newCourseData = {
        feuille_id: currentShift.feuille_id,
        num_ordre: nextOrdre,
        index_depart: courseData.index_depart || null,
        index_embarquement: parseInt(courseData.index_embarquement),
        lieu_embarquement: courseData.lieu_embarquement,
        heure_embarquement: courseData.heure_embarquement ? 
          `1970-01-01T${courseData.heure_embarquement}:00` : null,
        index_debarquement: parseInt(courseData.index_debarquement),
        lieu_debarquement: courseData.lieu_debarquement,
        heure_debarquement: courseData.heure_debarquement ? 
          `1970-01-01T${courseData.heure_debarquement}:00` : null,
        prix_taximetre: parseFloat(courseData.prix_taximetre) || null,
        sommes_percues: parseFloat(courseData.sommes_percues),
        mode_paiement_id: parseInt(courseData.mode_paiement_id),
        client_id: courseData.client_id ? parseInt(courseData.client_id) : null,
        est_hors_heures: courseData.est_hors_heures || false
      };

      const createdCourse = await createCourse(newCourseData);
      
      if (createdCourse) {
        // Recharger les courses depuis la base
        await loadShiftCourses(currentShift.feuille_id);
        
        // En mode LIVE, auto-sauvegarder les courses
        if (currentShift.mode_encodage === 'LIVE') {
          toast.success('Course enregistrée automatiquement en mode LIVE');
        } else {
          toast.success('Course ajoutée avec succès');
        }
        
        setShowCourseModal(false);
        setEditingCourse(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la course:', error);
      toast.error('Erreur lors de l\'ajout de la course');
    }
  };

  // Terminer le shift selon le modèle Prisma
  const handleEndShift = async (endData) => {
    if (!currentShift) {
      toast.error('Aucun shift actif');
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        heure_fin: endData.heure_fin, // Laisser le service gérer le formatage
        index_km_fin_tdb: parseInt(endData.km_fin),
        interruptions: endData.notes || currentShift.interruptions,
        montant_salaire_cash_declare: parseFloat(endData.montant_declare) || 0,
        signature_chauffeur: endData.signature || null,
        est_validee: true // Marquer comme terminé ET validé
      };

      const updatedShift = await updateFeuilleRoute(currentShift.feuille_id, updateData);
      
      if (updatedShift) {
        // Réinitialiser l'état pour permettre un nouveau shift
        setCurrentShift(null);
        setIsShiftActive(false);
        setCourses([]);
        
        toast.success('Shift terminé avec succès ! En attente de validation.');
        setActiveTab('dashboard');
        
        console.log('✅ Shift terminé:', {
          feuille_id: currentShift.feuille_id,
          courses_count: courses.length,
          heure_fin: endData.heure_fin
        });
      }
    } catch (error) {
      console.error('Erreur lors de la fin du shift:', error);
      toast.error('Erreur lors de la fin du shift');
    } finally {
      setLoading(false);
    }
  };

  // Validation des changements d'onglet
  const handleTabChange = (newTab) => {
    // Courses et End nécessitent un shift actif
    if ((newTab === 'courses' || newTab === 'end') && !isShiftActive) {
      toast.error('Vous devez d\'abord démarrer un shift');
      return;
    }

    // End nécessite au moins une course (sauf en mode test)
    if (newTab === 'end' && courses.length === 0) {
      toast.warning('Aucune course enregistrée dans ce shift');
    }

    setActiveTab(newTab);
  };

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <Page title="Vue Chauffeur">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Page>
    );
  }

  // Vérification d'authentification
  if (!isAuthenticated || !chauffeurId) {
    return (
      <Page title="Vue Chauffeur">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Accès non autorisé
          </h2>
          <p className="text-gray-600">
            Veuillez vous connecter en tant que chauffeur.
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Vue Chauffeur">
      <div className="space-y-6">
        {/* En-tête avec informations du shift */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Vue Chauffeur - {user.prenom} {user.nom}
              </h1>
              {isShiftActive && currentShift && (
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Shift Actif
                  </span>
                  <span>Mode: {currentShift.mode_encodage}</span>
                  <span>Véhicule: {currentShift.vehicule?.plaque_immatriculation}</span>
                  <span>Courses: {courses.length}</span>
                </div>
              )}
            </div>
            
            {isShiftActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('end')}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <StopIcon className="w-4 h-4 mr-2" />
                Terminer Shift
              </Button>
            )}
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const isDisabled = (tab.key === 'courses' || tab.key === 'end') && !isShiftActive;
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    disabled={isDisabled}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : isDisabled
                        ? 'border-transparent text-gray-400 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <ShiftDashboard
                currentShift={currentShift}
                courses={courses}
                isShiftActive={isShiftActive}
                onStartNewShift={() => setActiveTab('shift')}
              />
            )}

            {activeTab === 'shift' && (
              <NewShiftForm
                vehicules={vehicules}
                currentShift={currentShift}
                onStartShift={handleStartShift}
                loading={loading}
              />
            )}

            {activeTab === 'courses' && isShiftActive && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Courses du Shift - Mode {currentShift?.mode_encodage}
                  </h3>
                  <Button
                    onClick={() => setShowCourseModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Ajouter Course
                  </Button>
                </div>
                
                <DriverCoursesList
                  courses={courses}
                  onEditCourse={(course) => {
                    setEditingCourse(course);
                    setShowCourseModal(true);
                  }}
                  modeEncodage={currentShift?.mode_encodage}
                />
              </div>
            )}

            {activeTab === 'end' && isShiftActive && (
              <EndShiftForm
                currentShift={currentShift}
                courses={courses}
                onEndShift={handleEndShift}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Modal pour les courses */}
        {showCourseModal && (
          <LiveCourseForm
            isOpen={showCourseModal}
            onClose={() => {
              setShowCourseModal(false);
              setEditingCourse(null);
            }}
            onSubmit={handleAddCourse}
            editingCourse={editingCourse}
            clients={clients}
            modesPaiement={modesPaiement}
            modeEncodage={currentShift?.mode_encodage}
            lastIndex={courses.length > 0 ? Math.max(...courses.map(c => c.index_debarquement || 0)) : 0}
          />
        )}
      </div>
    </Page>
  );
}
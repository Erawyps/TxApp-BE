// Import Dependencies
import { useState, useMemo, useEffect } from "react";
import { 
  ChartBarIcon, 
  ClockIcon, 
  TruckIcon, 
  CheckIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { generateAndDownloadReport } from "./utils/printUtils";

// Local Imports
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { Dashboard } from "./components/Dashboard";
import { ShiftForm } from "./components/ShiftForm";
import { CoursesList } from "./components/CoursesList";
import { CourseForm } from "./components/CourseForm";
import { EndShiftForm } from "./components/EndShiftForm";
import { VehicleModal } from "./components/VehicleModal";
import { FinancialSummary } from "./components/FinancialSummary";
import { ExpenseForm } from "./components/ExpenseForm";
import { ExternalCourseForm } from "./components/ExternalCourseForm";
import { HistoryModal } from "./components/HistoryModal";
import { ControlModal } from "./components/ControlModal";

// Services
import { upsertCourse, deleteCourse as removeCourse } from "services/courses";
import { createFeuilleRoute, endFeuilleRoute, getActiveFeuilleRoute } from "services/feuillesRoute";
import { getChauffeurs } from "services/chauffeurs";
import { getVehicules } from "services/vehicules";
import { getClients } from "services/clients";
import { getModesPaiement } from "services/modesPaiement";
import { getCharges, createCharge } from "services/charges";
import { getReglesSalaireForDropdown } from "services/reglesSalaire";

// ----------------------------------------------------------------------

const tabs = [
  { key: 'dashboard', label: 'Tableau de bord', icon: ChartBarIcon },
  { key: 'shift', label: 'Nouvelle feuille', icon: ClockIcon },
  { key: 'courses', label: 'Courses', icon: TruckIcon },
  { key: 'end', label: 'Fin de feuille', icon: CheckIcon }
];

export default function TxApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [externalCourses, setExternalCourses] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [currentFeuilleRoute, setCurrentFeuilleRoute] = useState(null);

  // Données de référence
  const [vehicules, setVehicules] = useState([]);
  const [currentChauffeur, setCurrentChauffeur] = useState(null);
  const [reglesSalaire, setReglesSalaire] = useState([]);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showExternalCourseModal, setShowExternalCourseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Vérifier s'il y a un shift actif
  const hasActiveShift = Boolean(currentFeuilleRoute && currentFeuilleRoute.statut === 'En cours');

  // Debug: Log des courses
  useEffect(() => {
    console.log('Courses state updated:', courses.length, 'courses');
    if (courses.length > 0) {
      console.log('Sample course:', courses[0]);
    }
  }, [courses]);

  // Chargement initial des données
  useEffect(() => {
    console.log('🚀 loadInitialData - Démarrage du chargement des données');

    const loadInitialData = async () => {
      try {
        console.log('🔄 loadInitialData - Début du chargement');
        setLoading(true);

        // Charger les données de référence avec gestion d'erreur améliorée
        console.log('🔄 Chargement des données initiales...');

        let chauffeursList = [];
        let vehiculesList = [];
        let clientsList = [];
        let modesList = [];
        let reglesSalaireList = [];

        try {
          console.log('📡 Tentative de récupération des chauffeurs...');
          const chauffeursResponse = await getChauffeurs().catch(err => {
            console.error('❌ Erreur API chauffeurs:', err);
            console.error('Détails de l\'erreur:', {
              message: err.message,
              status: err.status,
              stack: err.stack
            });
            return { data: [] };
          });

          chauffeursList = chauffeursResponse?.data || [];
          console.log('✅ Chauffeurs récupérés:', chauffeursList.length);

        } catch (apiError) {
          console.error('💥 Erreur critique API chauffeurs:', apiError);
          chauffeursList = [];
        }

        // Charger les autres données même si les chauffeurs échouent
        try {
          const [vehiculesRes, clientsRes, modesRes, reglesRes] = await Promise.all([
            getVehicules().catch(err => {
              console.error('❌ Erreur véhicules:', err);
              return [];
            }),
            getClients().catch(err => {
              console.error('❌ Erreur clients:', err);
              return [];
            }),
            getModesPaiement().catch(err => {
              console.error('❌ Erreur modes paiement:', err);
              return [];
            }),
            getReglesSalaireForDropdown().catch(err => {
              console.error('❌ Erreur règles salaire:', err);
              return [];
            })
          ]);

          vehiculesList = vehiculesRes || [];
          clientsList = clientsRes || [];
          modesList = modesRes || [];
          reglesSalaireList = reglesRes || [];

        } catch (otherError) {
          console.error('💥 Erreur chargement autres données:', otherError);
        }

        console.log('📊 Données chargées:', {
          chauffeurs: chauffeursList.length,
          vehicules: vehiculesList.length,
          clients: clientsList.length,
          modes: modesList.length
        });

        // Vérification finale des données
        if (chauffeursList.length === 0) {
          console.warn('⚠️ Aucune donnée chauffeur reçue de l\'API');
          console.log('Tentative de récupération directe depuis l\'API...');

          // Tentative de récupération directe pour diagnostiquer
          try {
            const directResponse = await fetch('http://localhost:3001/api/chauffeurs', {
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            });

            if (directResponse.ok) {
              const directData = await directResponse.json();
              console.log('✅ Récupération directe réussie:', directData.data?.length || 0, 'chauffeurs');
              if (directData.data && directData.data.length > 0) {
                chauffeursList = directData.data;
                console.log('🔄 Utilisation des données de récupération directe');
              }
            } else {
              console.error('❌ Échec récupération directe:', directResponse.status);
            }
          } catch (directError) {
            console.error('💥 Erreur récupération directe:', directError);
          }
        }

        setVehicules(vehiculesList);
        setReglesSalaire(reglesSalaireList);

        // Vérifier si on a des chauffeurs et les données utilisateur
        console.log('🔍 Vérification finale des chauffeurs...');
        console.log('Liste brute des chauffeurs:', chauffeursList);

        // Filtrer les chauffeurs valides (avec données utilisateur)
        const validChauffeurs = chauffeursList.filter(ch =>
          ch && ch.utilisateur && ch.utilisateur.nom && ch.utilisateur.prenom
        );

        console.log(`✅ Chauffeurs valides: ${validChauffeurs.length}/${chauffeursList.length}`);

        if (validChauffeurs.length > 0) {
          console.log('✅ Chauffeurs trouvés:', validChauffeurs.length);

          // Afficher tous les chauffeurs valides disponibles
          validChauffeurs.forEach((ch, index) => {
            console.log(`Chauffeur ${index + 1}:`, {
              id: ch.id,
              nom: ch.utilisateur?.nom,
              prenom: ch.utilisateur?.prenom,
              actif: ch.actif,
              courses: ch.metrics?.courses?.length || 0
            });
          });

          // Chercher spécifiquement François-José Dubois
          let chauffeur = validChauffeurs.find(ch =>
            ch.utilisateur.prenom === 'François-José' &&
            ch.utilisateur.nom === 'Dubois'
          );

          console.log('Recherche Dubois par nom complet:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');

          // Si pas trouvé, chercher par prénom seulement
          if (!chauffeur) {
            chauffeur = validChauffeurs.find(ch =>
              ch.utilisateur.prenom === 'François-José'
            );
            console.log('Recherche Dubois par prénom seulement:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
          }

          // Si toujours pas trouvé, prendre le premier chauffeur actif
          if (!chauffeur) {
            chauffeur = validChauffeurs.find(ch => ch.actif);
            console.log('Recherche premier chauffeur actif:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
          }

          // Si toujours pas trouvé, prendre le premier de la liste
          if (!chauffeur) {
            chauffeur = validChauffeurs[0];
            console.log('Prendre le premier chauffeur:', chauffeur ? '✅ Trouvé' : '❌ Non trouvé');
          }

          console.log('Chauffeurs disponibles:', chauffeursList.map(c => ({
            id: c.id,
            nom: c.utilisateur?.nom,
            prenom: c.utilisateur?.prenom,
            actif: c.actif
          })));
          console.log('Chauffeur sélectionné:', chauffeur?.utilisateur?.prenom, chauffeur?.utilisateur?.nom);
          console.log('Métriques du chauffeur:', chauffeur?.metrics);

          // Vérifier que le chauffeur a des données utilisateur valides
          if (chauffeur && chauffeur.utilisateur) {
            console.log('🎯 Chauffeur sélectionné:', {
              id: chauffeur.id,
              nom: chauffeur.utilisateur?.nom,
              prenom: chauffeur.utilisateur?.prenom,
              actif: chauffeur.actif,
              courses_count: chauffeur.metrics?.courses?.length || 0
            });

            setCurrentChauffeur(chauffeur);

            // Charger les courses depuis les métriques du chauffeur (toutes ses courses)
            if (chauffeur.metrics && chauffeur.metrics.courses) {
              console.log('📋 Chargement des courses depuis métriques...');

              // Transformer les courses des métriques pour correspondre au format attendu
              const chauffeurCourses = chauffeur.metrics.courses.map((course, index) => ({
                id: course.id,
                numero_ordre: index + 1, // Numéro séquentiel basé sur l'index
                index_embarquement: course.index_depart || 0,
                index_debarquement: course.index_arrivee || 0,
                lieu_embarquement: course.depart || 'Point de départ non spécifié',
                lieu_debarquement: course.arrivee || 'Point d\'arrivée non spécifié',
                heure_embarquement: course.date ? new Date(course.date).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '00:00',
                heure_debarquement: course.date ? new Date(course.date).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '00:00',
                prix_taximetre: parseFloat(course.prix_taximetre) || 0,
                sommes_percues: parseFloat(course.somme_percue) || 0,
                mode_paiement: course.mode_paiement || 'CASH',
                client: course.client || '',
                distance_km: parseInt(course.distance_km) || 0,
                ratio_euro_km: parseFloat(course.ratio_euro_km) || 0,
                status: 'completed',
                notes: `Course du ${new Date(course.date).toLocaleDateString('fr-FR')} - ${course.depart} → ${course.arrivee}`
              }));
              setCourses(chauffeurCourses);
              console.log('✅ Courses transformées:', chauffeurCourses.length);
              console.log('📋 Détails des courses:', chauffeurCourses.map(c => ({
                id: c.id,
                numero: c.numero_ordre,
                trajet: `${c.lieu_embarquement} → ${c.lieu_debarquement}`,
                index: `${c.index_embarquement} → ${c.index_debarquement}`,
                montant: `${c.prix_taximetre}€ (${c.sommes_percues}€ perçus)`,
                distance: `${c.distance_km} km`
              })));

              // Vérifier que les courses ont des données valides
              const validCourses = chauffeurCourses.filter(c =>
                c.index_embarquement !== undefined &&
                c.index_debarquement !== undefined &&
                c.lieu_embarquement &&
                c.lieu_debarquement
              );
              console.log('Courses valides:', validCourses.length, 'sur', chauffeurCourses.length);

              // Mettre à jour filteredCourses immédiatement
              setSearchTerm('');
            }

            // Vérifier s'il y a une feuille de route active
            try {
              const activeSheet = await getActiveFeuilleRoute(chauffeur.id);
              if (activeSheet) {
                console.log('Feuille de route active trouvée:', activeSheet.id);
                setCurrentFeuilleRoute(activeSheet);
                setShiftData({
                  id: activeSheet.id,
                  chauffeur_id: activeSheet.chauffeur_id,
                  vehicule_id: activeSheet.vehicule_id,
                  date: activeSheet.date,
                  heure_debut: activeSheet.heure_debut,
                  heure_fin: activeSheet.heure_fin,
                  km_debut: activeSheet.km_debut,
                  km_fin: activeSheet.km_fin,
                  prise_en_charge_debut: activeSheet.prise_en_charge_debut,
                  prise_en_charge_fin: activeSheet.prise_en_charge_fin,
                  chutes_debut: activeSheet.chutes_debut,
                  chutes_fin: activeSheet.chutes_fin,
                  statut: activeSheet.statut,
                  notes: activeSheet.notes
                });

                // Charger les charges/dépenses de la feuille active
                const chargesList = await getCharges(activeSheet.id);
                setExpenses(chargesList);
              }
            } catch (sheetError) {
              console.error('Erreur lors du chargement de la feuille de route:', sheetError);
              // Continuer même si la feuille de route ne peut pas être chargée
            }
          } else {
            console.error('Données utilisateur manquantes pour le chauffeur');
            toast.error('Données utilisateur incomplètes');
          }
        } else {
          console.error('❌ ERREUR: Aucun chauffeur valide trouvé');
          console.error('Détails du problème:', {
            chauffeurs_bruts: chauffeursList.length,
            chauffeurs_valides: validChauffeurs.length,
            chauffeurs_list: chauffeursList.map(ch => ({
              id: ch?.id,
              utilisateur: ch?.utilisateur,
              actif: ch?.actif
            }))
          });
          toast.error('Aucun chauffeur avec données complètes trouvé - Vérifiez la connexion API');
        }
      } catch (error) {
        console.error('Erreur lors du chargement initial:', error);
        toast.error('Erreur lors du chargement des données');

        // Si c'est une erreur d'authentification, rediriger vers la connexion
        if (error.message.includes('Non authentifié')) {
          // La redirection est déjà gérée dans le service API
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleDownloadReport = () => {
    try {
      if (!currentFeuilleRoute) {
        toast.error('Aucune feuille de route active');
        return;
      }

      if (!currentChauffeur || !currentChauffeur.utilisateur) {
        toast.error('Données du chauffeur indisponibles');
        return;
      }

      // Vérifier que les données utilisateur existent
      const driverData = {
        nom: currentChauffeur.utilisateur?.nom || 'Non défini',
        prenom: currentChauffeur.utilisateur?.prenom || 'Non défini',
        numero_badge: currentChauffeur.numero_badge || 'N/A'
      };

      const fileName = generateAndDownloadReport(
        shiftData,
        courses,
        driverData,
        currentFeuilleRoute.vehicule
      );
      toast.success(`Feuille de route téléchargée : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de la feuille de route');
    }
  };

  // Calculs des totaux - Ajout du calcul des km et ratio €/km
  const totals = useMemo(() => {
    const recettes = courses.reduce((sum, course) => sum + (course.sommes_percues || 0), 0);
    const coursesCount = courses.length;

    // Calcul des km parcourus basé sur les index de départ/arrivée
    const totalKm = courses.reduce((sum, course) => {
      const kmCourse = (course.index_debarquement || 0) - (course.index_embarquement || 0);
      return sum + Math.max(0, kmCourse); // S'assurer que les km sont positifs
    }, 0);

    return {
      recettes,
      coursesCount,
      totalKm,
      averagePerCourse: coursesCount > 0 ? recettes / coursesCount : 0,
      ratioEuroKm: totalKm > 0 ? recettes / totalKm : 0
    };
  }, [courses]);

  // Filtrage des courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.lieu_embarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.lieu_debarquement.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.numero_ordre.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  useEffect(() => {
    console.log('FilteredCourses updated:', filteredCourses.length, 'filtered courses');
  }, [filteredCourses]);

  // Handlers
  const handleNewCourse = () => {
    if (!hasActiveShift) {
      // Si pas de shift actif, rediriger vers la création de feuille
      setActiveTab('shift');
      toast.info("Veuillez d'abord créer une nouvelle feuille de route");
      return;
    }
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await removeCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      toast.success("Course supprimée");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSubmitCourse = async (courseData) => {
    try {
      if (!currentFeuilleRoute) {
        toast.error("Aucune feuille de route active");
        return;
      }

      // Ajouter l'ID de la feuille de route et le numéro d'ordre
      const courseWithMeta = {
        ...courseData,
        feuille_route_id: currentFeuilleRoute.id,
        numero_ordre: editingCourse ? editingCourse.numero_ordre : courses.length + 1,
        id: editingCourse?.id
      };

      const saved = await upsertCourse(courseWithMeta);

      if (editingCourse) {
        setCourses(courses.map(c => c.id === editingCourse.id ? saved : c));
        toast.success("Course modifiée avec succès");
      } else {
        setCourses([...courses, saved]);
        toast.success("Course ajoutée avec succès");
      }

      setShowCourseModal(false);
      setEditingCourse(null);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'enregistrement de la course");
    }
  };

  const handleStartShift = async (shiftFormData) => {
    try {
      if (!currentChauffeur) {
        toast.error("Aucun chauffeur sélectionné");
        return;
      }

      // Créer une nouvelle feuille de route
      const feuilleRouteData = {
        chauffeur_id: currentChauffeur.id,
        vehicule_id: shiftFormData.vehicule_id,
        date: shiftFormData.date,
        heure_debut: shiftFormData.heure_debut,
        km_debut: shiftFormData.km_debut,
        prise_en_charge_debut: shiftFormData.prise_en_charge_debut,
        chutes_debut: shiftFormData.chutes_debut,
        notes: shiftFormData.notes
      };

      const newFeuilleRoute = await createFeuilleRoute(feuilleRouteData);

      setCurrentFeuilleRoute(newFeuilleRoute);
      setShiftData({
        id: newFeuilleRoute.id,
        chauffeur_id: newFeuilleRoute.chauffeur_id,
        vehicule_id: newFeuilleRoute.vehicule_id,
        date: newFeuilleRoute.date,
        heure_debut: newFeuilleRoute.heure_debut,
        km_debut: newFeuilleRoute.km_debut,
        prise_en_charge_debut: newFeuilleRoute.prise_en_charge_debut,
        chutes_debut: newFeuilleRoute.chutes_debut,
        statut: newFeuilleRoute.statut,
        notes: newFeuilleRoute.notes
      });

      // Réinitialiser les courses pour la nouvelle feuille
      setCourses([]);
      setExpenses([]);

      setActiveTab('courses');
      toast.success("Nouvelle feuille de route créée");
    } catch (error) {
      console.error('Erreur lors de la création de la feuille de route:', error);
      toast.error("Erreur lors de la création de la feuille de route");
    }
  };

  const handleEndShift = async (endData) => {
    try {
      if (!currentFeuilleRoute) {
        toast.error("Aucune feuille de route active");
        return;
      }

      // Finaliser la feuille de route
      const updatedFeuilleRoute = await endFeuilleRoute(currentFeuilleRoute.id, {
        heure_fin: endData.heure_fin,
        km_fin: endData.km_fin,
        prise_en_charge_fin: endData.prise_en_charge_fin,
        chutes_fin: endData.chutes_fin,
        notes: endData.notes
      });

      setCurrentFeuilleRoute(updatedFeuilleRoute);
      setShiftData({
        ...shiftData,
        heure_fin: updatedFeuilleRoute.heure_fin,
        km_fin: updatedFeuilleRoute.km_fin,
        prise_en_charge_fin: updatedFeuilleRoute.prise_en_charge_fin,
        chutes_fin: updatedFeuilleRoute.chutes_fin,
        statut: updatedFeuilleRoute.statut,
        notes: updatedFeuilleRoute.notes
      });

      toast.success("Feuille de route terminée");
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Erreur lors de la finalisation de la feuille de route:', error);
      toast.error("Erreur lors de la finalisation de la feuille de route");
    }
  };

  const handleSubmitExpense = async (expenseData) => {
    try {
      if (!currentFeuilleRoute) {
        toast.error("Aucune feuille de route active");
        return;
      }

      const chargeData = {
        feuille_route_id: currentFeuilleRoute.id,
        type_charge: expenseData.type_charge || 'Autre',
        description: expenseData.description,
        montant: expenseData.montant,
        date: expenseData.date || new Date(),
        mode_paiement_id: expenseData.mode_paiement_id,
        notes: expenseData.notes
      };

      const newCharge = await createCharge(chargeData);
      setExpenses([...expenses, newCharge]);
      setShowExpenseModal(false);
      toast.success("Dépense ajoutée avec succès");
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      toast.error("Erreur lors de l'ajout de la dépense");
    }
  };

  const handleCancelCourse = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleShowControl = () => {
    setShowControlModal(true);
  };

  const handleSubmitExternalCourse = (externalCourseData) => {
    setExternalCourses([...externalCourses, externalCourseData]);
    setShowExternalCourseModal(false);
    toast.success("Course externe ajoutée");
  };

  if (loading) {
    return (
      <Page title="TxApp - Gestion Taxi">
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="TxApp - Gestion Taxi">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200 dark:border-dark-500">
              <nav className="flex justify-center">
                <div className="flex space-x-8 md:space-x-16">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-content">
            {activeTab === 'dashboard' && (
              <Dashboard
                driver={currentChauffeur ? {
                  nom: currentChauffeur.utilisateur?.nom,
                  prenom: currentChauffeur.utilisateur?.prenom,
                  numero_badge: currentChauffeur.numero_badge
                } : null}
                vehicle={currentFeuilleRoute?.vehicule || null}
                totals={totals}
                onNewCourse={handleNewCourse}
                onShowHistory={() => setShowHistoryModal(true)}
                onPrintReport={handleDownloadReport}
                onShowControl={handleShowControl}
                hasActiveShift={hasActiveShift}
              />
            )}

            {activeTab === 'shift' && (
              <ShiftForm
                key={`shift-form-${vehicules?.length || 0}`}
                vehicles={vehicules}
                chauffeur={currentChauffeur}
                onStartShift={handleStartShift}
                onShowVehicleInfo={() => setShowVehicleModal(true)}
                reglesSalaire={reglesSalaire}
              />
            )}

            {console.log('Parent - Passing to ShiftForm:', { vehicules: vehicules?.length || 0, reglesSalaire: reglesSalaire?.length || 0 })}

            {activeTab === 'courses' && (
              <CoursesList
                courses={courses}
                filteredCourses={filteredCourses}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onNewCourse={handleNewCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onShowFinancialSummary={() => setShowFinancialModal(true)}
                onShowHistory={() => setShowHistoryModal(true)}
                onShowExpenseForm={() => setShowExpenseModal(true)}
                onShowExternalCourseForm={() => setShowExternalCourseModal(true)}
              />
            )}

            {activeTab === 'end' && (
              <EndShiftForm 
                onEndShift={handleEndShift}
                shiftData={shiftData}
                driver={currentChauffeur ? {
                  nom: currentChauffeur.utilisateur?.nom,
                  prenom: currentChauffeur.utilisateur?.prenom,
                  numero_badge: currentChauffeur.numero_badge
                } : null}
                vehicle={currentFeuilleRoute?.vehicule || null}
                onPrintReport={handleDownloadReport}
              />
            )}
          </div>
        </div>

        {/* Course Modal */}
        <Transition show={showCourseModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCancelCourse}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        {editingCourse ? "Modifier la course" : "Nouvelle course"}
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={handleCancelCourse}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <CourseForm
                        editingCourse={editingCourse}
                        coursesCount={courses.length}
                        onSubmit={handleSubmitCourse}
                        onCancel={handleCancelCourse}
                        reglesSalaire={reglesSalaire}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {console.log('Parent - Passing to CourseForm:', { reglesSalaire: reglesSalaire?.length || 0 })}

        {/* Financial Summary Modal */}
        <Transition show={showFinancialModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowFinancialModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        Résumé Financier
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowFinancialModal(false)}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                      <FinancialSummary
                        courses={courses}
                        expenses={expenses}
                        externalCourses={externalCourses}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Expense Modal */}
        <Transition show={showExpenseModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowExpenseModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        Ajouter une dépense
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowExpenseModal(false)}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <ExpenseForm
                        onSubmit={handleSubmitExpense}
                        onCancel={() => setShowExpenseModal(false)}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* External Course Modal */}
        <Transition show={showExternalCourseModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowExternalCourseModal(false)}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </TransitionChild>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-dark-700 shadow-xl transition-all">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-500">
                      <DialogTitle className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                        Course externe
                      </DialogTitle>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowExternalCourseModal(false)}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-6">
                      <ExternalCourseForm
                        onSubmit={handleSubmitExternalCourse}
                        onCancel={() => setShowExternalCourseModal(false)}
                      />
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* History Modal */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />

        {/* Vehicle Modal */}
        <VehicleModal
          isOpen={showVehicleModal}
          onClose={() => setShowVehicleModal(false)}
          vehicle={currentFeuilleRoute?.vehicule || null}
        />

        {/* Control Modal */}
        <ControlModal
          isOpen={showControlModal}
          onClose={() => setShowControlModal(false)}
          driver={currentChauffeur ? {
            nom: currentChauffeur.utilisateur?.nom,
            prenom: currentChauffeur.utilisateur?.prenom,
            numero_badge: currentChauffeur.numero_badge
          } : null}
          vehicle={currentFeuilleRoute?.vehicule || null}
          shiftData={shiftData}
          courses={courses}
        />

        {/* Mobile Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-dark-700 border-t border-gray-200 dark:border-dark-500 md:hidden">
          <Button
            onClick={handleDownloadReport}
            className="w-full space-x-2"
            variant="outlined"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>Imprimer feuille de route</span>
          </Button>
        </div>
      </div>
    </Page>
  );
}

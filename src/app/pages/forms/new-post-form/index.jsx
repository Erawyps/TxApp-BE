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
import { createVehicleChangeNotification } from "services/notifications";

// Hooks
import { useAuth } from "hooks/useAuth";

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

  // Authentification
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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
  const hasActiveShift = Boolean(currentFeuilleRoute && !currentFeuilleRoute.est_validee);

  // Fonction de validation des changements d'onglet
  const handleTabChange = (newTab) => {
    // Validation pour l'onglet "courses" - nécessite un shift actif
    if (newTab === 'courses' && !hasActiveShift) {
      toast.error('Vous devez d\'abord démarrer un shift avant de pouvoir gérer les courses');
      return;
    }

    // Validation pour l'onglet "end" - nécessite un shift actif et au moins une course
    if (newTab === 'end' && !hasActiveShift) {
      toast.error('Vous devez avoir un shift actif pour pouvoir le terminer');
      return;
    }

    if (newTab === 'end' && courses.length === 0) {
      toast.warning('Attention: Vous n\'avez enregistré aucune course. Souhaitez-vous vraiment terminer le shift ?');
      // On permet quand même le changement mais avec un avertissement
    }

    // Validation pour l'onglet "shift" - avertir si shift déjà actif
    if (newTab === 'shift' && hasActiveShift) {
      toast.info('Vous avez déjà un shift actif. Démarrer un nouveau shift terminera automatiquement l\'actuel.');
    }

    setActiveTab(newTab);
  };

  // Vérification d'authentification et permissions
  useEffect(() => {
    console.log('🔍 Auth state check:', { authLoading, isAuthenticated, user: user ? 'present' : 'null' });

    if (!authLoading && !isAuthenticated) {
      console.warn('❌ Utilisateur non authentifié - redirection vers login');
      // Forcer le nettoyage complet
      localStorage.removeItem('authToken');
      window.location.href = '/login'; // Redirection forcée
      return;
    }

    if (!authLoading && isAuthenticated && user) {
      // Vérifier que l'utilisateur a des données valides
      if (!user.nom || !user.prenom || !user.user_id) {
        console.warn('❌ Données utilisateur incomplètes:', {
          nom: user.nom,
          prenom: user.prenom,
          user_id: user.user_id,
          id: user.id
        });
        // Nettoyer et rediriger
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }

      console.log('✅ Utilisateur connecté avec données valides:', {
        id: user?.chauffeur?.chauffeur_id || user?.user_id,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      });

      // Vérifier que l'utilisateur est un chauffeur
      if (user.role !== 'Chauffeur' && user.role !== 'Driver') {
        console.warn('❌ Accès refusé: L\'utilisateur connecté n\'est pas un chauffeur');
        console.log('Rôle utilisateur:', user.role);
        console.log('Rôles autorisés: Chauffeur, Driver');

        // Afficher un message d'erreur et empêcher l'accès
        toast.error('Accès refusé: Cette interface est réservée aux chauffeurs');
        // TODO: Rediriger vers une page d'erreur ou le dashboard approprié
        return;
      }

      console.log('✅ Permissions validées: Utilisateur chauffeur autorisé');
    }
  }, [user, isAuthenticated, authLoading]);

  // Synchronisation des données en temps réel avec l'utilisateur connecté
  useEffect(() => {
    if (isAuthenticated && user && currentChauffeur) {
      // Vérifier que le chauffeur actuel correspond bien à l'utilisateur connecté
      if (currentChauffeur.chauffeur_id !== (user?.user_id || user?.id)) {
        console.log('🔄 Synchronisation: Rechargement des données pour le nouvel utilisateur');

        // Recharger les données pour le bon utilisateur
        const loadUserSpecificData = async () => {
          try {
            console.log('🔄 Rechargement des données utilisateur...');

            // Recharger les chauffeurs pour s'assurer d'avoir les données à jour
            const chauffeursResponse = await getChauffeurs();
            const chauffeursList = chauffeursResponse || [];
            const validChauffeurs = chauffeursList.filter(ch =>
              ch && ch.utilisateur && ch.utilisateur.nom && ch.utilisateur.prenom
            );

            // Trouver le chauffeur correspondant à l'utilisateur connecté
            // Selon le schéma Prisma: chauffeur.chauffeur_id = utilisateur.user_id
            const userChauffeur = validChauffeurs.find(ch => ch.chauffeur_id === (user?.user_id || user?.id));

            if (userChauffeur) {
              console.log('✅ Chauffeur synchronisé pour l\'utilisateur connecté');
              setCurrentChauffeur(userChauffeur);

              // Recharger les courses du chauffeur depuis feuille_route
              if (userChauffeur.feuille_route && userChauffeur.feuille_route.length > 0) {
                const chauffeurCourses = userChauffeur.feuille_route.flatMap(feuille =>
                  (feuille.courses || feuille.course || []).map((course) => ({
                    id: course.course_id,
                    numero_ordre: course.num_ordre,
                    index_embarquement: course.index_embarquement || 0,
                    index_debarquement: course.index_debarquement || 0,
                    lieu_embarquement: course.lieu_embarquement || 'Point de départ non spécifié',
                    lieu_debarquement: course.lieu_debarquement || 'Point d\'arrivée non spécifié',
                    heure_embarquement: course.heure_embarquement ? new Date(course.heure_embarquement).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '00:00',
                    heure_debarquement: course.heure_debarquement ? new Date(course.heure_debarquement).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '00:00',
                    prix_taximetre: parseFloat(course.prix_taximetre) || 0,
                    sommes_percues: parseFloat(course.sommes_percues) || 0,
                    mode_paiement: course.mode_paiement?.libelle || 'CASH',
                    client: course.client?.nom_societe || '',
                    distance_km: 0, // Calculé plus tard si nécessaire
                    ratio_euro_km: 0, // Calculé plus tard si nécessaire
                    status: 'completed',
                    notes: `Course ${course.num_ordre} - ${course.lieu_embarquement || 'Départ'} → ${course.lieu_debarquement || 'Arrivée'}`,
                    chauffeur_id: userChauffeur.chauffeur_id,
                    utilisateur_id: userChauffeur.chauffeur_id // chauffeur_id corresponds to user_id in Prisma
                  }))
                );

                setCourses(chauffeurCourses);
                console.log('✅ Courses synchronisées pour l\'utilisateur connecté:', chauffeurCourses.length);
              }
            } else {
              console.warn('❌ Aucun chauffeur trouvé pour l\'utilisateur connecté');
              // Réinitialiser les données
              setCurrentChauffeur(null);
              setCourses([]);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la synchronisation des données:', error);
          }
        };

        loadUserSpecificData();
      }
    }
  }, [user, isAuthenticated, currentChauffeur]);

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
            return [];
          });

          chauffeursList = chauffeursResponse || [];
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
              console.log('✅ Récupération directe réussie:', directData?.length || 0, 'chauffeurs');
              if (directData && directData.length > 0) {
                chauffeursList = directData;
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
              id: ch.chauffeur_id,
              nom: ch.utilisateur?.nom,
              prenom: ch.utilisateur?.prenom,
              actif: ch.statut === 'Actif',
              courses: ch.feuille_route?.reduce((total, feuille) => total + ((feuille.courses || feuille.course)?.length || 0), 0) || 0
            });
          });

          let chauffeur = null;

          // Si l'utilisateur est connecté, chercher le chauffeur correspondant
          if (isAuthenticated && user) {
            console.log('🔍 Recherche du chauffeur pour l\'utilisateur connecté:', {
              userId: user?.user_id || user?.id,
              userNom: user.nom,
              userPrenom: user.prenom
            });

            // Chercher par ID utilisateur d'abord
            chauffeur = validChauffeurs.find(ch => ch.chauffeur_id === (user?.user_id || user?.id));

            if (chauffeur) {
              console.log('✅ Chauffeur trouvé par ID utilisateur');
            } else {
              // Chercher par nom/prénom si pas trouvé par ID
              chauffeur = validChauffeurs.find(ch =>
                ch.utilisateur.nom === user.nom &&
                ch.utilisateur.prenom === user.prenom
              );

              if (chauffeur) {
                console.log('✅ Chauffeur trouvé par nom/prénom');
              } else {
                console.log('❌ Aucun chauffeur trouvé pour l\'utilisateur connecté');
                console.log('Utilisateurs connecté:', { id: user?.user_id || user?.id, nom: user.nom, prenom: user.prenom });
                console.log('Chauffeurs disponibles:', validChauffeurs.map(c => ({
                  chauffeur_id: c.chauffeur_id,
                  utilisateur_id: c.chauffeur_id, // chauffeur_id corresponds to user_id in Prisma
                  nom: c.utilisateur?.nom,
                  prenom: c.utilisateur?.prenom
                })));
              }
            }
          } else {
            console.log('⚠️ Utilisateur non connecté, utilisation du mode dégradé');

            // Mode dégradé: chercher François-José Dubois (logique existante)
            chauffeur = validChauffeurs.find(ch =>
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
          }

          console.log('Chauffeurs disponibles:', chauffeursList.map(c => ({
            id: c.chauffeur_id,
            nom: c.utilisateur?.nom,
            prenom: c.utilisateur?.prenom,
            actif: c.statut === 'Actif'
          })));
          console.log('Chauffeur sélectionné:', chauffeur?.utilisateur?.prenom, chauffeur?.utilisateur?.nom);
          console.log('Données du chauffeur:', {
            chauffeur_id: chauffeur?.chauffeur_id,
            courses_count: chauffeur?.feuille_route?.reduce((total, feuille) => total + ((feuille.courses || feuille.course)?.length || 0), 0) || 0
          });

          // Vérifier que le chauffeur a des données utilisateur valides
          if (chauffeur && chauffeur.utilisateur) {
            console.log('🎯 Chauffeur sélectionné:', {
              id: chauffeur.chauffeur_id,
              nom: chauffeur.utilisateur?.nom,
              prenom: chauffeur.utilisateur?.prenom,
              actif: chauffeur.statut === 'Actif',
              courses_count: chauffeur.feuille_route?.reduce((total, feuille) => total + ((feuille.courses || feuille.course)?.length || 0), 0) || 0,
              utilisateur_id: chauffeur.chauffeur_id, // chauffeur_id corresponds to user_id in Prisma
              user_connecte_id: user?.user_id || user?.id
            });

            // Vérifier la cohérence entre l'utilisateur connecté et le chauffeur
            // Selon le schéma Prisma: chauffeur.chauffeur_id doit correspondre à user.user_id
            if (isAuthenticated && user && chauffeur.chauffeur_id !== (user?.user_id || user?.id)) {
              console.warn('⚠️ Incohérence détectée: Le chauffeur sélectionné ne correspond pas à l\'utilisateur connecté');
              console.log('Utilisateur connecté:', { id: user?.user_id || user?.id, nom: user.nom, prenom: user.prenom });
              console.log('Chauffeur sélectionné:', { chauffeur_id: chauffeur.chauffeur_id, nom: chauffeur.utilisateur.nom, prenom: chauffeur.utilisateur.prenom });

              // En mode production, on pourrait empêcher l'accès ou afficher un message d'erreur
              // Pour l'instant, on continue mais on log l'incohérence
            }

            setCurrentChauffeur(chauffeur);

            // Charger les courses depuis les feuilles de route du chauffeur (uniquement celles du chauffeur connecté)
            if (chauffeur.feuille_route && chauffeur.feuille_route.length > 0) {
              console.log('📋 Chargement des courses depuis feuilles de route du chauffeur connecté...');

              // Transformer les courses des feuilles de route pour correspondre au format attendu
              const chauffeurCourses = chauffeur.feuille_route.flatMap(feuille =>
                (feuille.courses || feuille.course || []).map((course) => ({
                  id: course.course_id,
                  numero_ordre: course.num_ordre,
                  index_embarquement: course.index_embarquement || 0,
                  index_debarquement: course.index_debarquement || 0,
                  lieu_embarquement: course.lieu_embarquement || 'Point de départ non spécifié',
                  lieu_debarquement: course.lieu_debarquement || 'Point d\'arrivée non spécifié',
                  heure_embarquement: course.heure_embarquement ? new Date(course.heure_embarquement).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '00:00',
                  heure_debarquement: course.heure_debarquement ? new Date(course.heure_debarquement).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '00:00',
                  prix_taximetre: parseFloat(course.prix_taximetre) || 0,
                  sommes_percues: parseFloat(course.sommes_percues) || 0,
                  mode_paiement: course.mode_paiement?.libelle || 'CASH',
                  client: course.client?.nom_societe || '',
                  distance_km: 0, // Calculé plus tard si nécessaire
                  ratio_euro_km: 0, // Calculé plus tard si nécessaire
                  status: 'completed',
                  notes: `Course ${course.num_ordre} - ${course.lieu_embarquement || 'Départ'} → ${course.lieu_debarquement || 'Arrivée'}`,
                  // Marquer que ces données appartiennent au chauffeur connecté
                  chauffeur_id: chauffeur.chauffeur_id,
                  utilisateur_id: chauffeur.chauffeur_id // chauffeur_id corresponds to user_id in Prisma
                }))
              );

              setCourses(chauffeurCourses);
              console.log('✅ Courses du chauffeur connecté chargées:', chauffeurCourses.length);
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
              const activeSheet = await getActiveFeuilleRoute(chauffeur.chauffeur_id);
              if (activeSheet) {
                console.log('Feuille de route active trouvée:', activeSheet.id);
                setCurrentFeuilleRoute(activeSheet);
                setShiftData({
                  id: activeSheet.id,
                  chauffeur_id: activeSheet.chauffeur_id,
                  vehicule_id: activeSheet.vehicule_id,
                  date: activeSheet.date_service,
                  heure_debut: activeSheet.heure_debut ? new Date(activeSheet.heure_debut).toTimeString().slice(0, 5) : null,
                  heure_fin: activeSheet.heure_fin ? new Date(activeSheet.heure_fin).toTimeString().slice(0, 5) : null,
                  interruptions: activeSheet.interruptions,
                  km_debut: activeSheet.index_km_debut_tdb,
                  km_fin: activeSheet.index_km_fin_tdb,
                  prise_en_charge_debut: activeSheet.taximetre_prise_charge_debut,
                  prise_en_charge_fin: activeSheet.taximetre_prise_charge_fin,
                  chutes_debut: activeSheet.taximetre_chutes_debut,
                  chutes_fin: activeSheet.taximetre_chutes_fin,
                  statut: activeSheet.est_validee ? 'validée' : 'en cours',
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
  }, [isAuthenticated, user]);

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
      // Vérification stricte que le chauffeur est chargé
      if (!currentChauffeur) {
        toast.error("Erreur: Données du chauffeur non chargées. Veuillez rafraîchir la page et réessayer.");
        console.error('handleStartShift: currentChauffeur est null ou undefined');
        return;
      }

      if (!currentChauffeur.chauffeur_id) {
        toast.error("Erreur: ID du chauffeur manquant. Veuillez contacter l'administrateur.");
        console.error('handleStartShift: currentChauffeur.chauffeur_id est manquant', currentChauffeur);
        return;
      }

      // Créer une nouvelle feuille de route avec le mapping correct des champs
      const feuilleRouteData = {
        chauffeur_id: currentChauffeur.chauffeur_id,
        vehicule_id: parseInt(shiftFormData.vehicule_id), // S'assurer que c'est un entier
        date_service: shiftFormData.date,
        mode_encodage: 'LIVE', // Utiliser LIVE au lieu de MANUEL
        heure_debut: shiftFormData.heure_debut,
        interruptions: shiftFormData.interruptions || '00:00',
        index_km_debut_tdb: shiftFormData.km_tableau_bord_debut || 0,
        montant_salaire_cash_declare: 0, // Sera calculé plus tard selon la règle de salaire
        // Les champs taximètre seront gérés séparément si nécessaire
        taximetre_prise_charge_debut: shiftFormData.taximetre_prise_charge_debut || 0,
        taximetre_index_km_debut: shiftFormData.taximetre_index_km_debut || 0,
        taximetre_km_charge_debut: shiftFormData.taximetre_km_charge_debut || 0,
        taximetre_chutes_debut: shiftFormData.taximetre_chutes_debut || 0
      };

      console.log('Données envoyées à l\'API:', feuilleRouteData);
      console.log('Règle de salaire sélectionnée:', shiftFormData.type_remuneration);

      // Vérifier si le chauffeur change de véhicule (notification admin)
      const lastShift = currentChauffeur.feuille_route && currentChauffeur.feuille_route.length > 0
        ? currentChauffeur.feuille_route.sort((a, b) => new Date(b.date_service) - new Date(a.date_service))[0]
        : null;

      const isVehicleChange = lastShift && lastShift.vehicule_id !== parseInt(shiftFormData.vehicule_id);

      if (isVehicleChange) {
        console.log('🔄 Changement de véhicule détecté - Notification admin requise');
        console.log('Véhicule précédent:', lastShift.vehicule_id, 'Nouveau véhicule:', shiftFormData.vehicule_id);

        // Créer une notification détaillée pour l'admin
        const oldVehicle = lastShift.vehicule;

        const notification = await createVehicleChangeNotification(
          currentChauffeur.chauffeur_id,
          oldVehicle?.vehicule_id,
          parseInt(shiftFormData.vehicule_id),
          shiftFormData.date,
          shiftFormData.heure_debut
        );

        // TODO: Envoyer la notification à l'admin (email, webhook, interface admin)
        console.log('NOTIFICATION CRÉÉE:', notification);

        // Afficher une notification au chauffeur
        toast.warning(`Changement de véhicule détecté. L'administration a été notifiée.`, {
          duration: 6000
        });
      }

      const newFeuilleRoute = await createFeuilleRoute(feuilleRouteData);

      setCurrentFeuilleRoute(newFeuilleRoute);
      setShiftData({
        id: newFeuilleRoute.feuille_id,
        chauffeur_id: newFeuilleRoute.chauffeur_id,
        vehicule_id: newFeuilleRoute.vehicule_id,
        date: newFeuilleRoute.date_service,
        heure_debut: newFeuilleRoute.heure_debut ? new Date(newFeuilleRoute.heure_debut).toTimeString().slice(0, 5) : null,
        heure_fin_estimee: shiftFormData.heure_fin_estimee,
        interruptions: shiftFormData.interruptions,
        km_debut: newFeuilleRoute.index_km_debut_tdb,
        statut: !newFeuilleRoute.est_validee ? 'En cours' : 'Terminé',
        type_remuneration: shiftFormData.type_remuneration,
        // Conserver les données taximètre
        taximetre_prise_charge_debut: shiftFormData.taximetre_prise_charge_debut || 0,
        taximetre_index_km_debut: shiftFormData.taximetre_index_km_debut || 0,
        taximetre_km_charge_debut: shiftFormData.taximetre_km_charge_debut || 0,
        taximetre_chutes_debut: shiftFormData.taximetre_chutes_debut || 0
      });

      // Réinitialiser les courses pour la nouvelle feuille
      setCourses([]);
      setExpenses([]);

      setActiveTab('courses');
      toast.success("Nouvelle feuille de route créée avec succès");
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
        heure_fin: updatedFeuilleRoute.heure_fin ? new Date(updatedFeuilleRoute.heure_fin).toTimeString().slice(0, 5) : null,
        km_fin: updatedFeuilleRoute.index_km_fin_tdb,
        prise_en_charge_fin: updatedFeuilleRoute.taximetre_prise_charge_fin,
        chutes_fin: updatedFeuilleRoute.taximetre_chutes_fin,
        statut: updatedFeuilleRoute.est_validee ? 'Validée' : 'Terminée',
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
                        onClick={() => handleTabChange(tab.key)}
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
                currentShift={currentFeuilleRoute}
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
                driver={currentChauffeur}
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

import PropTypes from "prop-types";
import { useReducer } from "react";
import { FeuilleRouteContextProvider } from "./FeuilleRouteContext";

const initialState = {
  formData: {
    // Informations de base
    date: new Date().toISOString().split('T')[0],
    chauffeur_id: null,
    vehicule_id: null,
    
    // Horaires et kilométrage
    heure_debut: "",
    heure_fin: "",
    interruptions: "",
    km_debut: null,
    km_fin: null,
    
    // Taximètre
    prise_en_charge_debut: null,
    prise_en_charge_fin: null,
    chutes_debut: null,
    chutes_fin: null,
    
    // Cours et charges
    courses: [],
    charges: [],
    
    // Métadonnées
    statut: "En cours",
    saisie_mode: "chauffeur",
    notes: ""
  },
  stepStatus: {
    identiteChauffeur: { isDone: false },
    infoVehicule: { isDone: false },
    listeCourses: { isDone: false },
    charges: { isDone: false },
    recapitulatif: { isDone: false },
  },
};

const reducer = (state, action) => {
  // Déclarer les variables en dehors du switch
  let coursesTotal, chargesTotal;
  
  switch (action.type) {
    case "SET_FORM_DATA":
      return { ...state, formData: { ...state.formData, ...action.payload } };
      
    case "SET_STEP_STATUS":
      return { ...state, stepStatus: { ...state.stepStatus, ...action.payload } };
      
    case "ADD_COURSE":
      return {
        ...state,
        formData: {
          ...state.formData,
          courses: [...state.formData.courses, {
            ...action.payload,
            client_id: action.payload.modePaiement === 'facture' ? action.payload.client_id : null,
            numero_ordre: state.formData.courses.length + 1
          }]
        }
      };

    case "UPDATE_COURSE":
      return {
        ...state,
        formData: {
          ...state.formData,
          courses: state.formData.courses.map((course) =>
            course.id === action.payload.id ? action.payload : course
          ),
        },
      };

    case "REMOVE_COURSE":
      return {
        ...state,
        formData: {
          ...state.formData,
          courses: state.formData.courses.filter(
            (course) => course.id !== action.payload
          ),
        },
      };

    case "ADD_CHARGE":
      return {
        ...state,
        formData: {
          ...state.formData,
          charges: [...state.formData.charges, action.payload],
        },
      };

    case "REMOVE_CHARGE":
      return {
        ...state,
        formData: {
          ...state.formData,
          charges: state.formData.charges.filter(
            (charge) => charge.id !== action.payload
          ),
        },
      };

    case "CALCULATE_TOTALS":
      coursesTotal = state.formData.courses.reduce((sum, course) => sum + (course.sommePercue || 0), 0);
      chargesTotal = state.formData.charges.reduce((sum, charge) => sum + (charge.montant || 0), 0);
      
      return {
        ...state,
        formData: {
          ...state.formData,
          vehicule: {
            ...state.formData.vehicule,
            recettes: coursesTotal,
          },
          totals: {
            courses: coursesTotal,
            charges: chargesTotal,
          }
        }
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

export function FeuilleRouteProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  
  return (
    <FeuilleRouteContextProvider value={value}>
      {children}
    </FeuilleRouteContextProvider>
  );
}

FeuilleRouteProvider.propTypes = {
  children: PropTypes.node,
};
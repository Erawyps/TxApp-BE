import PropTypes from "prop-types";
import { useReducer } from "react";
import { FeuilleRouteContextProvider } from "./FeuilleRouteContext";

const initialState = {
  formData: {
    chauffeur: {
      id: null,
      nom: "",
      prenom: "",
      date: new Date().toISOString().split('T')[0],
      heureDebut: "",
      heureFin: "",
      interruptions: "",
      regleSalaire: "",
      tauxSalaire: null,
      note: "",
    },
    vehicule: {
      plaqueImmatriculation: "",
      numeroIdentification: "",
      priseEnChargeDebut: null,
      priseEnChargeFin: null,
      kmDebut: null,
      kmFin: null,
      kmTotalDebut: null,
      kmTotalFin: null,
      kmEnChargeDebut: null,
      kmEnChargeFin: null,
      chutesDebut: null,
      chutesFin: null,
      recettes: null,
    },
    courses: [],
    charges: [],
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
  let coursesTotal, chargesTotal;
  
  switch (action.type) {
    case "SET_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    case "SET_STEP_STATUS":
      return {
        ...state,
        stepStatus: {
          ...state.stepStatus,
          ...action.payload,
        },
      };
    case "ADD_COURSE":
      return {
        ...state,
        formData: {
          ...state.formData,
          courses: [...state.formData.courses, action.payload],
        },
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
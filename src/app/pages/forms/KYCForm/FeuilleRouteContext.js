import { createContext, useContext, useReducer } from "react";

export const FeuilleRouteContext = createContext();

export function useFeuilleRouteContext() {
  const context = useContext(FeuilleRouteContext);
  if (!context) {
    throw new Error("useFeuilleRouteContext must be used within a FeuilleRouteContextProvider");
  }
  return context;
}

export function FeuilleRouteProvider({ children }) {
  const initialState = {
    formData: {
      chauffeur: null,
      vehicule: null,
      courses: [],
      charges: [],
      coursesHorsCreneau: [],
      validation: {
        alertes: [],
        totalCash: 0,
        totalFactures: 0,
        totalSalaire: 0
      }
    },
    stepStatus: {
      identiteChauffeur: { isDone: false },
      infoVehicule: { isDone: false },
      listeCourses: { isDone: false },
      charges: { isDone: false },
      selectionHorsCreneau: { isDone: false },
      recapitulatif: { isDone: false }
    }
  };

  function reducer(state, action) {
    switch (action.type) {
      case 'SET_CHAUFFEUR':
        return { ...state, formData: { ...state.formData, chauffeur: action.payload } };
      case 'SET_VEHICULE':
        return { ...state, formData: { ...state.formData, vehicule: action.payload } };
      case 'ADD_COURSE':
        return { ...state, formData: { ...state.formData, courses: [...state.formData.courses, action.payload] } };
      case 'REMOVE_COURSE':
        return { ...state, formData: { ...state.formData, courses: state.formData.courses.filter(c => c.id !== action.payload) } };
      case 'ADD_CHARGE':
        return { ...state, formData: { ...state.formData, charges: [...state.formData.charges, action.payload] } };
      case 'REMOVE_CHARGE':
        return { ...state, formData: { ...state.formData, charges: state.formData.charges.filter(c => c.id !== action.payload) } };
      case 'TOGGLE_HORS_CRENEAU':
        // Logique pour gérer les courses hors créneau
        return state;
      case 'CALCULER_TOTAUX':
        // Logique de calcul des totaux
        return state;
      case 'SET_STEP_STATUS':
        return { ...state, stepStatus: { ...state.stepStatus, ...action.payload } };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <FeuilleRouteContext.Provider value={{ state, dispatch }}>
      {children}
    </FeuilleRouteContext.Provider>
  );
}
import PropTypes from "prop-types";
import { useReducer } from "react";
import { KYCFormContextProvider } from "./KYCFormContext";

const initialState = {
  formData: {
    vehicleInfo: {
      vehicle: {
        plaqueImmatriculation: "",
        numeroIdentification: "",
      },
      service: {
        date: new Date(),
        heureDebut: "",
        heureFin: "",
        interruptions: "",
      },
      taximetre: {
        priseEnChargeDebut: "",
        priseEnChargeFin: "",
        indexKmDebut: "",
        indexKmFin: "",
      },
      charges: [],
      notes: "",
    },
    coursesList: {
      courses: [],
    },
    finalValidation: {
      signature: "",
      dateSignature: "",
      salaireCash: 0,
    },
  },
  stepStatus: {
    vehicleInfo: { isDone: false },
    coursesList: { isDone: false },
    finalValidation: { isDone: false },
  },
};

const reducer = (state, action) => {
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
    default:
      return state;
  }
};

export function KYCFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return (
    <KYCFormContextProvider value={value}>{children}</KYCFormContextProvider>
  );
}

KYCFormProvider.propTypes = {
  children: PropTypes.node,
};
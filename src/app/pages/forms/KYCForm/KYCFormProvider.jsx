import PropTypes from 'prop-types';
import { useReducer } from 'react';
import { KYCFormContextProvider } from './KYCFormContext';

const initialState = {
  etape1: {
    chauffeurId: '',
    periodeService: { date: new Date(), heureDebut: '', heureFin: '' },
    remunerationType: '40percent',
    notes: ''
  },
  etape2: {
    plaqueImmatriculation: '',
    numeroIdentification: '',
    taximetre: {
      kmChargeDebut: '',
      kmChargeFin: '',
      chutesDebut: '',
      chutesFin: ''
    }
  },
  etape3: {
    courses: [],
    notes: ''
  },
  etape4: {
    charges: []
  },
  stepStatus: {
    etape1: { isDone: false },
    etape2: { isDone: false },
    etape3: { isDone: false },
    etape4: { isDone: false }
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ETAPE1_DATA':
      return {
        ...state,
        etape1: { ...state.etape1, ...action.payload },
        stepStatus: { ...state.stepStatus, etape1: { isDone: true } }
      };
    case 'SET_ETAPE2_DATA':
      return {
        ...state,
        etape2: { ...state.etape2, ...action.payload },
        stepStatus: { ...state.stepStatus, etape2: { isDone: true } }
      };
    case 'SET_ETAPE3_DATA':
      return {
        ...state,
        etape3: { ...state.etape3, ...action.payload },
        stepStatus: { ...state.stepStatus, etape3: { isDone: true } }
      };
    case 'SET_ETAPE4_DATA':
      return {
        ...state,
        etape4: { ...state.etape4, ...action.payload },
        stepStatus: { ...state.stepStatus, etape4: { isDone: true } }
      };
    default:
      return state;
  }
};

export function KYCFormProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  
  return (
    <KYCFormContextProvider value={value}>
      {children}
    </KYCFormContextProvider>
  );
}

KYCFormProvider.propTypes = {
  children: PropTypes.node
};
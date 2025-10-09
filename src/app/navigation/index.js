import { dashboards } from "./dashboards";
import { tables } from "./tables";
import { forms } from "./forms";

// Filtrer la navigation pour le mode driver
const isDriverMode = import.meta.env.VITE_DRIVER_MODE === 'true';

const driverNavigation = [
    {
        ...forms,
        childs: forms.childs.filter(child => child.title === 'eForms - Chauffeur')
    }
];

export const navigation = isDriverMode ? driverNavigation : [
    dashboards,
    tables,
    forms,
];

export { baseNavigation } from './baseNavigation'

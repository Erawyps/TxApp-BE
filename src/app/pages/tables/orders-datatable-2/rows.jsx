// Import Dependencies
import dayjs from "dayjs";
import PropTypes from "prop-types";
import {
    CheckBadgeIcon,
    ClockIcon,
    XCircleIcon,
    PencilSquareIcon
} from "@heroicons/react/20/solid";

// Local Imports
import { Avatar, Badge } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";

// ----------------------------------------------------------------------

export function DateCell({ getValue }) {
    const { locale } = useLocaleContext();
    const date = dayjs(getValue()).locale(locale).format("DD MMM YYYY");
    return <p className="font-medium">{date}</p>;
}

export function ChauffeurCell({ row }) {
    return (
        <div className="flex items-center space-x-4">
            <Avatar
                size={9}
                name={row.original.chauffeur.nom}
                src={row.original.chauffeur.avatar}
                classNames={{
                    display: "mask is-squircle rounded-none text-sm",
                }}
            />
            <span className="font-medium text-gray-800 dark:text-dark-100">
                {row.original.chauffeur.nom}
            </span>
        </div>
    );
}

export function VehiculeCell({ getValue }) {
    return (
        <div className="flex items-center space-x-2">
            <span className="font-mono">{getValue().plaque}</span>
            <span className="text-xs text-gray-500">{getValue().modele}</span>
        </div>
    );
}

export function HeuresCell({ row }) {
    return (
        <div className="flex flex-col">
            <span className="font-medium">
                {row.original.heure_debut} - {row.original.heure_fin || '--:--'}
            </span>
            <span className="text-xs text-gray-500">
                {row.original.total_heures || '--h--'}
            </span>
        </div>
    );
}

export function KmCell({ getValue }) {
    return (
        <span className="font-mono font-medium">
            {getValue()?.toLocaleString() || '--'} km
        </span>
    );
}

export function RecetteCell({ getValue }) {
    return (
        <span className="font-medium text-success-600 dark:text-success-400">
            {(getValue() || 0).toFixed(2)} €
        </span>
    );
}

export function StatusCell({ getValue }) {
    const status = getValue();
    const options = {
        'validée': { color: 'success', icon: CheckBadgeIcon },
        'en_cours': { color: 'primary', icon: PencilSquareIcon },
        'annulée': { color: 'error', icon: XCircleIcon },
        'en_attente': { color: 'warning', icon: ClockIcon }
    };
    
    const { color, icon: Icon } = options[status] || { color: 'neutral' };
    
    return (
        <Badge color={color} className="space-x-1.5 capitalize">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{status.replace('_', ' ')}</span>
        </Badge>
    );
}

// PropTypes
DateCell.propTypes = { getValue: PropTypes.func };
ChauffeurCell.propTypes = { row: PropTypes.object };
VehiculeCell.propTypes = { getValue: PropTypes.func };
HeuresCell.propTypes = { row: PropTypes.object };
KmCell.propTypes = { getValue: PropTypes.func };
RecetteCell.propTypes = { getValue: PropTypes.func };
StatusCell.propTypes = { getValue: PropTypes.func };
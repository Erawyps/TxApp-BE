import PropTypes from "prop-types";
import dayjs from "dayjs";
import { Avatar, Badge } from "components/ui";
import { useLocaleContext } from "app/contexts/locale/context";
import { tripStatusOptions, paymentMethods } from "./data";

export function ChauffeurCell({ getValue }) {
  return (
    <div className="flex items-center space-x-3">
      <Avatar size={9} name={getValue()} />
      <span className="font-medium text-gray-800 dark:text-dark-100">{getValue()}</span>
    </div>
  );
}

export function VehiculeCell({ getValue }) {
  return (
    <p className="font-medium text-gray-700 dark:text-dark-100">
      {getValue()}
    </p>
  );
}

export function LieuCell({ getValue }) {
  return (
    <p className="w-48 truncate text-xs-plus xl:w-56 2xl:w-64">
      {getValue()}
    </p>
  );
}

export function HeureCell({ getValue }) {
  const { locale } = useLocaleContext();
  const timestamp = getValue();
  const time = dayjs(timestamp).locale(locale).format("HH:mm");
  return <p className="font-medium">{time}</p>;
}

export function DistanceCell({ getValue }) {
  return (
    <p className="font-medium text-gray-700 dark:text-dark-100">
      {getValue()} km
    </p>
  );
}

export function PrixCell({ getValue }) {
  const value = getValue();
  const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  return (
    <p className="font-medium text-gray-800 dark:text-dark-100">
      {isNaN(numericValue) ? '0.00' : numericValue.toFixed(2)} €
    </p>
  );
}

export function PaiementCell({ getValue }) {
  const method = paymentMethods.find(m => m.value === getValue());
  return (
    <Badge color={method?.color || "neutral"}>
      {method?.label || getValue()}
    </Badge>
  );
}

export function StatutCourseCell({ getValue }) {
  const val = getValue();
  const option = tripStatusOptions.find((item) => item.value === val);

  return (
    <Badge color={option?.color || "neutral"} className="gap-1.5">
      {option?.icon && <option.icon className="h-4 w-4" />}
      <span>{option?.label || "Inconnu"}</span>
    </Badge>
  );
}

ChauffeurCell.propTypes = { getValue: PropTypes.func };
VehiculeCell.propTypes = { getValue: PropTypes.func };
LieuCell.propTypes = { getValue: PropTypes.func };
HeureCell.propTypes = { getValue: PropTypes.func };
DistanceCell.propTypes = { getValue: PropTypes.func };
PrixCell.propTypes = { getValue: PropTypes.func };
PaiementCell.propTypes = { getValue: PropTypes.func };
StatutCourseCell.propTypes = { getValue: PropTypes.func };
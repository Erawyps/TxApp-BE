// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import {
  ChauffeurCell,
  VehiculeCell,
  LieuCell,
  HeureCell,
  DistanceCell,
  PrixCell,
  PaiementCell,
  StatutCourseCell,
} from "./rows"; // Les nouveaux composants ci-dessous
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";
import { RowActions } from "./RowActions";
import { tripStatusOptions } from "./data";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    label: "Sélection",
    header: SelectHeader,
    cell: SelectCell,
  }),
  columnHelper.accessor((row) => row.driver.name, {
    id: "chauffeur",
    label: "Chauffeur",
    header: "Chauffeur",
    cell: ChauffeurCell,
  }),
  columnHelper.accessor((row) => row.vehicle?.plate ?? "N/A", {
    id: "vehicule",
    label: "Véhicule",
    header: "Véhicule",
    cell: VehiculeCell,
  }),
  columnHelper.accessor((row) => `${row.pickup_location} → ${row.dropoff_location}`, {
    id: "trajet",
    label: "Trajet",
    header: "Départ → Arrivée",
    cell: LieuCell,
  }),
  columnHelper.accessor((row) => row.start_time, {
    id: "start_time",
    label: "Heure de Départ",
    header: "Départ",
    cell: HeureCell,
    filter: "dateRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => row.distance, {
    id: "distance",
    label: "Distance (km)",
    header: "Distance",
    cell: DistanceCell,
    filter: "numberRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => row.earnings, {
    id: "earnings",
    label: "Prix (€)",
    header: "Prix",
    cell: PrixCell,
    filter: "numberRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => row.payment.method, {
    id: "paiement",
    label: "Paiement",
    header: "Paiement",
    cell: PaiementCell,
  }),
  columnHelper.accessor((row) => row.trip_status, {
    id: "statut",
    label: "Statut",
    header: "Statut de la Course",
    cell: StatutCourseCell,
    filter: "select",
    filterFn: "arrIncludesSome",
    options: tripStatusOptions,
  }),
  columnHelper.display({
    id: "actions",
    label: "Actions",
    header: "Actions",
    cell: RowActions,
  }),
];

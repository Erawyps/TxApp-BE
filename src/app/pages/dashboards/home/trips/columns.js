import { createColumnHelper } from "@tanstack/react-table";
import {
  ChauffeurCell,
  VehiculeCell,
  LieuCell,
  HeureCell,
  DistanceCell,
  PrixCell,
  PaiementCell,
  StatutCourseCell,
} from "./rows";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";
import { RowActions } from "./RowActions";
import { tripStatusOptions, paymentMethods } from "./data";

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    label: "Sélection",
    header: SelectHeader,
    cell: SelectCell,
  }),
  columnHelper.accessor((row) => `${row.chauffeur_nom} ${row.chauffeur_prenom}`, {
    id: "chauffeur",
    label: "Chauffeur",
    header: "Chauffeur",
    cell: ChauffeurCell,
  }),
  columnHelper.accessor((row) => row.vehicule_immatriculation, {
    id: "vehicule",
    label: "Véhicule",
    header: "Véhicule",
    cell: VehiculeCell,
  }),
  columnHelper.accessor((row) => `${row.lieu_embarquement} → ${row.lieu_debarquement}`, {
    id: "trajet",
    label: "Trajet",
    header: "Départ → Arrivée",
    cell: LieuCell,
  }),
  columnHelper.accessor((row) => row.heure_embarquement, {
    id: "heure_depart",
    label: "Heure de Départ",
    header: "Départ",
    cell: HeureCell,
    filter: "dateRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => row.distance_km, {
    id: "distance",
    label: "Distance (km)",
    header: "Distance",
    cell: DistanceCell,
    filter: "numberRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => row.prix_course, {
    id: "prix",
    label: "Prix (€)",
    header: "Prix",
    cell: PrixCell,
    filter: "numberRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => row.mode_paiement_libelle, {
    id: "paiement",
    label: "Paiement",
    header: "Paiement",
    cell: PaiementCell,
    filter: "select",
    filterFn: "arrIncludesSome",
    options: paymentMethods,
  }),
  columnHelper.accessor((row) => row.statut, {
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
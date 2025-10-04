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
  columnHelper.accessor((row) => {
    // Extraire le nom du chauffeur depuis la structure imbriquée
    const prenom = row.feuille_route?.chauffeur?.utilisateur?.prenom || '';
    const nom = row.feuille_route?.chauffeur?.utilisateur?.nom || '';
    return `${prenom} ${nom}`.trim() || 'Inconnu';
  }, {
    id: "chauffeur",
    label: "Chauffeur",
    header: "Chauffeur",
    cell: ChauffeurCell,
  }),
  columnHelper.accessor((row) => {
    // Extraire la plaque du véhicule
    return row.feuille_route?.vehicule?.plaque_immatriculation || 'N/A';
  }, {
    id: "vehicule",
    label: "Véhicule",
    header: "Véhicule",
    cell: VehiculeCell,
  }),
  columnHelper.accessor((row) => {
    // Construire le trajet
    const depart = row.lieu_embarquement || 'N/A';
    const arrivee = row.lieu_debarquement || 'N/A';
    return `${depart} → ${arrivee}`;
  }, {
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
  columnHelper.accessor((row) => {
    // Calculer la distance en km
    const distance = (row.index_debarquement || 0) - (row.index_embarquement || 0);
    return distance;
  }, {
    id: "distance",
    label: "Distance (km)",
    header: "Distance",
    cell: DistanceCell,
    filter: "numberRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => {
    // Utiliser sommes_percues comme prix
    return parseFloat(row.sommes_percues || 0);
  }, {
    id: "prix",
    label: "Prix (€)",
    header: "Prix",
    cell: PrixCell,
    filter: "numberRange",
    filterFn: "inNumberRange",
  }),
  columnHelper.accessor((row) => {
    // Extraire le libellé du mode de paiement
    return row.mode_paiement?.libelle || 'Non spécifié';
  }, {
    id: "paiement",
    label: "Paiement",
    header: "Paiement",
    cell: PaiementCell,
    filter: "select",
    filterFn: "arrIncludesSome",
    options: paymentMethods,
  }),
  columnHelper.accessor((row) => {
    // Déterminer le statut de la course
    if (row.est_hors_heures) return 'hors_heures';
    if (row.feuille_route?.est_validee) return 'validee';
    return 'en_cours';
  }, {
    id: "statut",
    label: "Statut",
    header: "Statut",
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
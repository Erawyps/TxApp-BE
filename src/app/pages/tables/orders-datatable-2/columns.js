
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
    SelectCell,
    SelectHeader,
} from "components/shared/table/SelectCheckbox";
import {
    ChauffeurCell,
    DateCell,
    VehiculeCell,
    HeuresCell,
    KmCell,
    RecetteCell,
    StatusCell,
} from "./rows";
import { feuilleStatusOptions } from "./data";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
    columnHelper.display({
        id: "select",
        label: "Row Selection",
        header: SelectHeader,
        cell: SelectCell,
    }),
    columnHelper.accessor((row) => row.id, {
        id: "id",
        label: "ID Feuille",
        header: "N° Feuille",
        cell: (info) => info.getValue(),
        filterFn: "includesString",
        filter: "fuzzy",
    }),
    columnHelper.accessor((row) => row.date, {
        id: "date",
        label: "Date",
        header: "Date",
        cell: DateCell,
        filter: "dateRange",
        filterFn: "inNumberRange",
    }),
    columnHelper.accessor((row) => row.chauffeur, {
        id: "chauffeur",
        label: "Chauffeur",
        header: "Chauffeur",
        cell: ChauffeurCell,
        filterFn: "arrIncludesSome",
    }),
    columnHelper.accessor((row) => row.vehicule, {
        id: "vehicule",
        label: "Véhicule",
        header: "Véhicule",
        cell: VehiculeCell,
    }),
    columnHelper.accessor((row) => row.heures, {
        id: "heures",
        label: "Heures",
        header: "Heures",
        cell: HeuresCell,
    }),
    columnHelper.accessor((row) => row.km_parcourus, {
        id: "km",
        label: "Kilométrage",
        header: "Km",
        cell: KmCell,
        filterFn: "inNumberRange",
        filter: "numberRange",
    }),
    columnHelper.accessor((row) => row.recette_totale, {
        id: "recette",
        label: "Recette",
        header: "Recette",
        filterFn: "inNumberRange",
        filter: "numberRange",
        cell: RecetteCell,
    }),
    columnHelper.accessor((row) => row.statut, {
        id: "statut",
        label: "Statut",
        header: "Statut",
        filter: "select",
        filterFn: "arrIncludesSome",
        cell: StatusCell,
        options: feuilleStatusOptions,
    }),
    columnHelper.display({
        id: "actions",
        label: "Row Actions",
        header: "Actions",
        cell: RowActions
    }),
];
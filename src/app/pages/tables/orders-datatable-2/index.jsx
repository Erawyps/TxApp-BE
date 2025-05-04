// Import Dependencies
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Page } from "components/shared/Page";
import { Fragment, useRef, useState } from "react";
import {
  ArrowPathIcon,
  CheckBadgeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";

// Local Imports
import { TableSortIcon } from "components/shared/table/TableSortIcon";
import { ColumnFilter } from "components/shared/table/ColumnFilter";
import { PaginationSection } from "components/shared/table/PaginationSection";
import { Button, Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
import { useBoxSize, useLockScrollbar, useLocalStorage } from "hooks";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
import { useSkipper } from "utils/react-table/useSkipper";
import { SelectedRowsActions } from "./SelectedRowsActions";
import { SubRowComponent } from "./SubRowComponent";
import { columns } from "./columns";
import { feuillesRouteList } from "./data";
import { Toolbar } from "./Toolbar";
import { useThemeContext } from "app/contexts/theme/context";

export default function FeuillesRouteDatatable() {
  const { cardSkin } = useThemeContext();

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
  const [feuillesRoute, setFeuillesRoute] = useState([...feuillesRouteList]);
  const [tableSettings, setTableSettings] = useState({
    enableSorting: true,
    enableColumnFilters: true,
    enableFullScreen: false,
    enableRowDense: false,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    "column-visibility-feuilles-route",
    {}
  );
  const [columnPinning, setColumnPinning] = useLocalStorage(
    "column-pinning-feuilles-route",
    {}
  );

  const cardRef = useRef();
  const { width: cardWidth } = useBoxSize({ ref: cardRef });

  const table = useReactTable({
    data: feuillesRoute,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
      columnPinning,
      tableSettings,
    },
    meta: {
      setTableSettings,
      deleteRow: (row) => {
        skipAutoResetPageIndex();
        setFeuillesRoute((old) =>
          old.filter((oldRow) => oldRow.id !== row.original.id)
        );
      },
      deleteRows: (rows) => {
        skipAutoResetPageIndex();
        const rowIds = rows.map((row) => row.original.id);
        setFeuillesRoute((old) => old.filter((row) => !rowIds.includes(row.id)));
      },
    },
    filterFns: { fuzzy: fuzzyFilter },
    enableSorting: tableSettings.enableSorting,
    enableColumnFilters: tableSettings.enableColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    autoResetPageIndex,
  });

  useLockScrollbar(tableSettings.enableFullScreen);

  return (
    <Page title ="Feuilles de Route - Liste des feuilles de route">
    <div className="transition-content grid grid-cols-1 grid-rows-[auto_auto_1fr] px-(--margin-x) py-4">
      <div className="flex items-center justify-between space-x-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50">
            Feuilles de Route
          </h2>
        </div>
        <Button
          className="h-8 space-x-1.5 rounded-md px-3 text-xs"
          color="primary"
        >
          <PlusIcon className="size-5" />
          <span>Nouvelle Feuille</span>
        </Button>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 2xl:gap-6">
        <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {feuillesRoute.length}
            </p>
            <TruckIcon className="size-5 text-info" />
          </div>
          <p className="mt-1 text-xs-plus">Total</p>
        </div>
        <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {feuillesRoute.filter(f => f.statut === 'validée').length}
            </p>
            <CheckBadgeIcon className="size-5 text-success" />
          </div>
          <p className="mt-1 text-xs-plus">Validées</p>
        </div>
        <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {feuillesRoute.filter(f => f.statut === 'en_cours').length}
            </p>
            <ArrowPathIcon className="size-5 text-primary-500" />
          </div>
          <p className="mt-1 text-xs-plus">En Cours</p>
        </div>
        <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {feuillesRoute.filter(f => f.statut === 'en_attente').length}
            </p>
            <ClockIcon className="size-5 text-warning" />
          </div>
          <p className="mt-1 text-xs-plus">En Attente</p>
        </div>
        <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {feuillesRoute.filter(f => f.statut === 'annulée').length}
            </p>
            <XCircleIcon className="size-5 text-error" />
          </div>
          <p className="mt-1 text-xs-plus">Annulées</p>
        </div>
        <div className="rounded-lg bg-gray-150 p-3 dark:bg-dark-700 2xl:p-4">
          <div className="flex justify-between space-x-1">
            <p className="text-xl font-semibold text-gray-800 dark:text-dark-100">
              {feuillesRoute.reduce((sum, f) => sum + f.recette_totale, 0).toFixed(2)} €
            </p>
            <CurrencyDollarIcon className="size-5 text-secondary" />
          </div>
          <p className="mt-1 text-xs-plus">Recette Totale</p>
        </div>
      </div>

      <div className={clsx(
        "flex flex-col pt-4",
        tableSettings.enableFullScreen && "fixed inset-0 z-61 h-full w-full bg-white pt-3 dark:bg-dark-900"
      )}>
        <Toolbar table={table} />
        <Card
          className={clsx(
            "relative mt-3 flex grow flex-col",
            tableSettings.enableFullScreen && "overflow-hidden"
          )}
          ref={cardRef}
        >
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <Table
              hoverable
              dense={tableSettings.enableRowDense}
              sticky={tableSettings.enableFullScreen}
              className="w-full text-left rtl:text-right"
            >
              <THead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th
                        key={header.id}
                        className={clsx(
                          "bg-gray-200 font-semibold uppercase text-gray-800 dark:bg-dark-800 dark:text-dark-100 first:ltr:rounded-tl-lg last:ltr:rounded-tr-lg first:rtl:rounded-tr-lg last:rtl:rounded-tl-lg",
                          header.column.getCanPin() && [
                            header.column.getIsPinned() === "left" && "sticky z-2 ltr:left-0 rtl:right-0",
                            header.column.getIsPinned() === "right" && "sticky z-2 ltr:right-0 rtl:left-0",
                          ]
                        )}
                      >
                        {header.column.getCanSort() ? (
                          <div
                            className="flex cursor-pointer select-none items-center space-x-3"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="flex-1">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </span>
                            <TableSortIcon
                              sorted={header.column.getIsSorted()}
                            />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                        {header.column.getCanFilter() ? (
                          <ColumnFilter column={header.column} />
                        ) : null}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <Tr
                      className={clsx(
                        "relative border-y border-transparent border-b-gray-200 dark:border-b-dark-500",
                        row.getIsExpanded() && "border-dashed",
                        row.getIsSelected() && "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td
                          key={cell.id}
                          className={clsx(
                            "relative",
                            cardSkin === "shadow-sm" ? "dark:bg-dark-700" : "dark:bg-dark-900",
                            cell.column.getCanPin() && [
                              cell.column.getIsPinned() === "left" && "sticky z-2 ltr:left-0 rtl:right-0",
                              cell.column.getIsPinned() === "right" && "sticky z-2 ltr:right-0 rtl:left-0",
                            ]
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </Td>
                      ))}
                    </Tr>
                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length} className="p-0">
                          <SubRowComponent row={row} cardWidth={cardWidth} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </TBody>
            </Table>
          </div>
          <SelectedRowsActions table={table} />
          {table.getCoreRowModel().rows.length && (
            <div
              className={clsx(
                "px-4 pb-4 sm:px-5 sm:pt-4",
                tableSettings.enableFullScreen && "bg-gray-50 dark:bg-dark-800",
                !(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()) && "pt-4"
              )}
            >
              <PaginationSection table={table} />
            </div>
          )}
        </Card>
      </div>
    </div>
    </Page>
  );
}
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
  import { Fragment, useRef, useState } from "react";
  
  // Local Imports
  import { TableSortIcon } from "components/shared/table/TableSortIcon";
  import { ColumnFilter } from "components/shared/table/ColumnFilter";
  import { PaginationSection } from "components/shared/table/PaginationSection";
  import { Card, Table, THead, TBody, Th, Tr, Td } from "components/ui";
  import {
    useBoxSize,
    useLockScrollbar,
    useDidUpdate,
    useLocalStorage,
  } from "hooks";
  import { fuzzyFilter } from "utils/react-table/fuzzyFilter";
  import { useSkipper } from "utils/react-table/useSkipper";
  import { SelectedRowsActions } from "./SelectedRowsActions"; // Attention: ./ (car dans trips/)
  import { SubRowComponent } from "./SubRowComponent";
  import { columns } from "./columns";
  import { tripsList } from "./data";             // <<< Tes données de courses
  import { Toolbar } from "./Toolbar";
  import { useThemeContext } from "app/contexts/theme/context";
  import { getUserAgentBrowser } from "utils/dom/getUserAgentBrowser";
  
  // ----------------------------------------------------------------------
  
  const isSafari = getUserAgentBrowser() === "Safari";
  
  export default function TripsTable() {
    const { cardSkin } = useThemeContext();
  
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
    const [trips, setTrips] = useState([...tripsList]);
    const [tableSettings, setTableSettings] = useState({
      enableSorting: true,
      enableColumnFilters: true,
      enableFullScreen: false,
      enableRowDense: false,
    });
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
  
    const [columnVisibility, setColumnVisibility] = useLocalStorage(
      "column-visibility-trips",
      {}
    );
    const [columnPinning, setColumnPinning] = useLocalStorage(
      "column-pinning-trips",
      {}
    );
  
    const cardRef = useRef();
    const { width: cardWidth } = useBoxSize({ ref: cardRef });
  
    const table = useReactTable({
      data: trips,
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
          setTrips((old) => old.filter((r) => r.trip_id !== row.original.trip_id));
        },
        deleteRows: (rows) => {
          skipAutoResetPageIndex();
          const rowIds = rows.map((r) => r.original.trip_id);
          setTrips((old) => old.filter((r) => !rowIds.includes(r.trip_id)));
        },
      },
      filterFns: { fuzzy: fuzzyFilter },
      enableSorting: tableSettings.enableSorting,
      enableColumnFilters: tableSettings.enableColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFacetedMinMaxValues: getFacetedMinMaxValues(),
      getSortedRowModel: getSortedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getRowCanExpand: () => true,
      getPaginationRowModel: getPaginationRowModel(),
      onGlobalFilterChange: setGlobalFilter,
      onSortingChange: setSorting,
      onColumnVisibilityChange: setColumnVisibility,
      onColumnPinningChange: setColumnPinning,
      autoResetPageIndex,
    });
  
    useDidUpdate(() => table.resetRowSelection(), [trips]);
    useLockScrollbar(tableSettings.enableFullScreen);
  
    return (
      <div className="flex flex-col">
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
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            <TableSortIcon sorted={header.column.getIsSorted()} />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(header.column.columnDef.header, header.getContext())
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
                        row.getIsSelected() &&
                          !isSafari &&
                          "row-selected after:pointer-events-none after:absolute after:inset-0 after:z-2 after:h-full after:w-full after:border-3 after:border-transparent after:bg-primary-500/10 ltr:after:border-l-primary-500 rtl:after:border-r-primary-500"
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
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
  
                    {row.getIsExpanded() && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length} className="p-0">
                          <SubRowComponent 
                            row={row} 
                            cardWidth={cardWidth}
                            details={{
                              driver: row.original.driver,
                              vehicle: row.original.vehicle,
                              paymentDetails: row.original.payment,
                              additionalNotes: row.original.notes
                            }}
                          />
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
    );
  }
  
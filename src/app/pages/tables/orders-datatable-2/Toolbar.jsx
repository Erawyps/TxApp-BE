// Import Dependencies
import clsx from "clsx";
import PropTypes from "prop-types";

// Local Imports
import { CollapsibleSearch } from "components/shared/CollapsibleSearch";
import { MenuAction } from "./MenuActions";
import { TableConfig } from "./TableConfig";

export function Toolbar({ table }) {
  const enableFullScreen = table.getState().tableSettings.enableFullScreen;

  return (
    <div
      className={clsx(
        "flex items-center justify-between",
        enableFullScreen && "px-4 sm:px-5",
      )}
    >
      <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
        Feuilles de Route
      </h2>
      <div className={clsx("flex", enableFullScreen && "ltr:-mr-2 rtl:-ml-2")}>
        <CollapsibleSearch
          placeholder="Rechercher..."
          value={table.getState().globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        <TableConfig table={table} />
        <MenuAction />
      </div>
    </div>
  );
}

Toolbar.propTypes = {
  table: PropTypes.object,
};
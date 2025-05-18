// Import Dependencies
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { forwardRef, Fragment, useMemo, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Input } from "components/ui";
import { countries } from "constants/countries.constant";

// ----------------------------------------------------------------------

const CountrySelect = forwardRef(({ onChange, value, name, error }, ref) => {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    return query === ""
      ? countries
      : countries.filter((country) =>
          country.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        );
  }, [query]);

  return (
    <Combobox
      as="div"
      value={countries.find((country) => country.code === value) || null}
      onChange={(val) => onChange(val?.code)}
      name={name}
      ref={ref}
    >
      {({ open, value: selectedValue }) => (
        <>
          <Label>Country</Label>

          <div className="relative mt-1.5">
            <div className="relative w-full cursor-pointer overflow-hidden">
              <ComboboxInput
                as={Input}
                autoComplete="new"
                className={clsx(
                  selectedValue && "ltr:pl-12 ltr:pr-8 rtl:pl-8 rtl:pr-12",
                )}
                error={error}
                displayValue={(val) => val?.name}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Select Country"
                suffix={
                  <ComboboxButton>
                    <ChevronDownIcon
                      className={clsx(
                        "size-5 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </ComboboxButton>
                }
              />
              {selectedValue && (
                <div className="pointer-events-none absolute inset-y-0 flex items-center ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3">
                  <img
                    className="h-4.5 w-7 rounded-xs object-cover object-center"
                    src={`/images/flags/png/${selectedValue.code.toLowerCase()}.png`}
                    alt={selectedValue.name}
                  />
                </div>
              )}
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
              afterLeave={() => setQuery("")}
            >
              <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-750 dark:shadow-none">
                {filteredData.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-800 dark:text-dark-100">
                    Nothing found for {query}
                  </div>
                ) : (
                  filteredData.map((country) => (
                    <ComboboxOption
                      key={country.code}
                      className={({ selected, active }) =>
                        clsx(
                          "relative cursor-pointer select-none px-4 py-2 outline-hidden transition-colors",
                          active && !selected && "bg-gray-100 dark:bg-dark-600",
                          selected
                            ? "bg-primary-600 text-white dark:bg-primary-500"
                            : "text-gray-800 dark:text-dark-100",
                        )
                      }
                      value={country}
                    >
                      <>
                        <div className="flex items-center space-x-3 ">
                          <img
                            className="h-4.5 w-7 rounded-xs object-cover object-center"
                            src={`/images/flags/png/${country.code.toLowerCase()}.png`}
                            alt={country.name}
                          />
                          <span>{country.name}</span>
                        </div>
                      </>
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </Transition>
          </div>
        </>
      )}
    </Combobox>
  );
});

CountrySelect.displayName = "CountrySelect";

CountrySelect.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
  error: PropTypes.node,
};

export { CountrySelect };

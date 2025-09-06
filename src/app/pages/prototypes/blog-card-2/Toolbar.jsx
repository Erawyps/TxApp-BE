// Import Dependencies
import { Fragment, useRef, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  Cog8ToothIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { RiFilter3Line } from "react-icons/ri";
import clsx from "clsx";
import PropTypes from "prop-types";

// Local Imports
import { Button, Input } from "components/ui";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useIsomorphicEffect } from "hooks";

// ----------------------------------------------------------------------

export function Toolbar({ query, setQuery }) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileSearchRef = useRef();

  const { isXs } = useBreakpointsContext();

  useIsomorphicEffect(() => {
    if (showMobileSearch) mobileSearchRef?.current?.focus();
  }, [showMobileSearch]);

  return (
    <div className="flex items-center justify-between py-5 lg:py-6">
      {showMobileSearch && isXs ? (
        <Input
          classNames={{
            root: "flex-1",
            input: "h-9 text-xs-plus",
          }}
          value={query || ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Posts ..."
          ref={mobileSearchRef}
          prefix={<MagnifyingGlassIcon className="size-4.5" />}
          suffix={
            <Button
              variant="flat"
              className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
              onClick={() => {
                setQuery("");
                setShowMobileSearch(false);
              }}
            >
              <XMarkIcon className="size-4.5 text-gray-500 dark:text-dark-200" />
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex min-w-0 items-center space-x-1 ">
            <h2 className="truncate text-xl font-medium text-gray-700 dark:text-dark-50 lg:text-2xl">
              Blog Cards
            </h2>
            <ActionMenu />
          </div>
          <div className="flex items-center space-x-1 ">
            <Input
              classNames={{
                input: "h-9 rounded-full text-xs-plus",
                root: "max-sm:hidden",
              }}
              value={query || ""}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Posts ..."
              className=""
              prefix={<MagnifyingGlassIcon className="size-4.5" />}
            />
            <Button
              onClick={() => setShowMobileSearch(true)}
              className="size-9 shrink-0 rounded-full sm:hidden"
              isIcon
              variant="flat"
            >
              <MagnifyingGlassIcon className="size-5" />
            </Button>

            <Button
              className="size-9 shrink-0 rounded-full"
              isIcon
              variant="flat"
            >
              <RiFilter3Line className="size-5" />
            </Button>
            <Button
              className="size-9 shrink-0 rounded-full"
              isIcon
              variant="flat"
            >
              <Cog8ToothIcon className="size-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function ActionMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        as={Button}
        variant="flat"
        className="size-8 shrink-0 rounded-full p-0"
      >
        <ChevronDownIcon className="size-4.5" strokeWidth="2" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] whitespace-nowrap rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0">
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center space-x-2 px-3 tracking-wide outline-hidden transition-colors ",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <PlusIcon className="size-4.5 stroke-2" />
                <span>New Post</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center space-x-2 px-3 tracking-wide outline-hidden transition-colors ",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <ArrowDownTrayIcon className="size-4.5 stroke-2" />
                <span>Export Posts</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center space-x-2 px-3 tracking-wide outline-hidden transition-colors ",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <Cog8ToothIcon className="size-4.5 stroke-2" />
                <span>Settings</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

Toolbar.propTypes = {
  query: PropTypes.string,
  setQuery: PropTypes.func,
};

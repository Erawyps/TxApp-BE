// Import Dependencies
import PropTypes from "prop-types";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import clsx from "clsx";

// Local Imports
import { Avatar, Button, Card } from "components/ui";
import { Highlight } from "components/shared/Highlight";
import { useBreakpointsContext } from "app/contexts/breakpoint/context";

// ----------------------------------------------------------------------

export function UserCard({ name, avatar, position, query }) {
  const { lgAndUp } = useBreakpointsContext();

  return (
    <Card className="flex flex-col items-center justify-between lg:flex-row">
      <div className="flex flex-col items-center p-4 text-center sm:p-5 lg:flex-row lg:space-x-4 lg:text-start lg:">
        <Avatar
          size={lgAndUp ? 12 : 18}
          name={name}
          src={avatar}
          initialColor="auto"
        />
        <div className="mt-2 lg:mt-0">
          <div className="flex items-center justify-center space-x-1">
            <h4 className="truncate text-base font-medium text-gray-800 dark:text-dark-100">
              <Highlight query={query}>{name}</Highlight>
            </h4>
            <Button
              color="primary"
              variant="flat"
              className="hidden h-6 rounded-full px-2 text-xs lg:inline-flex"
            >
              Follow
            </Button>
          </div>
          <p className="text-xs-plus">
            <Highlight query={query}>{position}</Highlight>
          </p>
          <Button
            variant="outlined"
            className="mt-4 rounded-full text-primary-600 dark:text-primary-400 lg:hidden"
          >
            Follow
          </Button>
        </div>
      </div>

      <ActionMenu />
    </Card>
  );
}

function ActionMenu() {
  return (
    <Menu
      as="div"
      className="absolute right-0 top-0 m-2 inline-block text-left lg:relative"
    >
      <MenuButton
        as={Button}
        variant="flat"
        className="size-8 shrink-0 rounded-full p-0"
      >
        <EllipsisHorizontalIcon className="size-4.5" />
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
        <MenuItems className="absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden dark:border-dark-500 dark:bg-dark-700 dark:shadow-none ltr:right-0 rtl:left-0">
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Action</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Another action</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Other action</span>
              </button>
            )}
          </MenuItem>

          <hr className="mx-3 my-1.5 h-px border-gray-150 dark:border-dark-500" />

          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "bg-gray-100 text-gray-800 dark:bg-dark-600 dark:text-dark-100",
                )}
              >
                <span>Separated action</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

UserCard.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  position: PropTypes.string,
  query: PropTypes.string,
};

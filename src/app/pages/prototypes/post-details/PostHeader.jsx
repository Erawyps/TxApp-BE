// Import Dependencies
import PropTypes from "prop-types";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

// Local Imports
import { useHover } from "hooks";
import { Avatar, Button } from "components/ui";

// ----------------------------------------------------------------------

export function PostHeader() {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <AuthorAvatar
            name="Travis Fuller"
            image="/images/200x200.png"
            username="@travisfuller"
          />
          <div>
            <a
              href="##"
              className="truncate font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
            >
              Travis Fuller
            </a>
            <div className="mt-1.5 flex items-center text-xs">
              <span className="truncate">Jun 26</span>
              <div className="mx-2 my-0.5 w-px self-stretch bg-white/20"></div>
              <p className="shrink-0">8 min red</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex max-sm:hidden">
            <Button
              component="a"
              href="#"
              isIcon
              variant="flat"
              className="size-8 rounded-full"
            >
              <BookmarkIcon className="size-5" />
            </Button>
            <Button
              component="a"
              href="#"
              isIcon
              variant="flat"
              className="size-8 rounded-full"
            >
              <FaTwitter className="size-4.5" />
            </Button>
            <Button
              component="a"
              href="#"
              isIcon
              variant="flat"
              className="size-8 rounded-full"
            >
              <FaLinkedin className="size-4.5" />
            </Button>
            <Button
              component="a"
              href="#"
              isIcon
              variant="flat"
              className="size-8 rounded-full"
            >
              <FaInstagram className="size-4.5" />
            </Button>
            <Button
              component="a"
              href="#"
              isIcon
              variant="flat"
              className="size-8 rounded-full"
            >
              <FaFacebook className="size-4.5" />
            </Button>
          </div>
          <ActionMenu />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 sm:hidden">
        <Button
          variant="outlined"
          className="space-x-2 rounded-full "
        >
          <BookmarkIcon className="size-4.5 text-gray-400 dark:text-gray-300" />
          <span> Save</span>
        </Button>
        <div className="flex flex-wrap">
          <Button
            component="a"
            href="#"
            isIcon
            variant="flat"
            className="size-8 rounded-full"
          >
            <BookmarkIcon className="size-5" />
          </Button>
          <Button
            component="a"
            href="#"
            isIcon
            variant="flat"
            className="size-8 rounded-full"
          >
            <FaTwitter className="size-4.5" />
          </Button>
          <Button
            component="a"
            href="#"
            isIcon
            variant="flat"
            className="size-8 rounded-full"
          >
            <FaLinkedin className="size-4.5" />
          </Button>
          <Button
            component="a"
            href="#"
            isIcon
            variant="flat"
            className="size-8 rounded-full"
          >
            <FaInstagram className="size-4.5" />
          </Button>
          <Button
            component="a"
            href="#"
            isIcon
            variant="flat"
            className="size-8 rounded-full"
          >
            <FaFacebook className="size-4.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AuthorAvatar({ name, image, username }) {
  const [avatarRef, isHovered] = useHover();

  return (
    <div className="relative" ref={avatarRef}>
      <Avatar
        size={12}
        src={image}
        initialColor="color"
        name={name}
        className="align-middle"
        classNames={{
          display: "mask is-squircle rounded-none",
        }}
      />

      <Transition
        show={isHovered}
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in delay-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <div className="absolute z-100 pt-1.5">
          <div className="flex w-48 flex-col items-center rounded-md border border-gray-300 bg-white p-3 text-center shadow-lg shadow-gray-200/50 dark:border-dark-500 dark:bg-dark-750 dark:shadow-none">
            <Avatar size={16} src={image} name={name} initialColor="auto" />

            <p className="mt-2 font-medium tracking-wide text-gray-800 dark:text-dark-100">
              {name}
            </p>

            <a
              href="##"
              className="text-xs tracking-wide hover:text-primary-600 focus:text-primary-600 dark:hover:text-primary-400 dark:focus:text-primary-400"
            >
              {username}
            </a>

            <div className="mt-4">
              <Button color="primary" className="h-6 rounded-full px-3 text-xs">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

function ActionMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-8 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
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

AuthorAvatar.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  username: PropTypes.string,
};

// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { ChatBubbleOvalLeftIcon, UserIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { Fragment } from "react";
import PropTypes from "prop-types";

// Local Imports
import { Avatar, Button, Card, Tag } from "components/ui";
import { Highlight } from "components/shared/Highlight";

// ----------------------------------------------------------------------

const avatarShapeClass = {
  circle: "rounded-full",
  squircle: "mask is-squircle",
  triangle: "mask is-reuleaux-triangle",
  diamond: "mask is-diamond",
  hexagon: "mask is-hexagon",
  hexagon2: "mask is-hexagon-2",
  star: "mask is-star",
  star2: "mask is-star-2",
  octagon: "mask is-octagon",
};

export function UserCard({
  shape,
  color,
  skills,
  position,
  avatar,
  name,
  query,
}) {
  return (
    <Card className="flex flex-col">
      <div className="p-2 text-end">
        <ActionMenu />
      </div>
      <div className="flex grow flex-col items-center px-4 pb-5 sm:px-5">
        <Avatar
          size={20}
          src={avatar}
          name={name}
          initialColor={color}
          classNames={{
            display: clsx(
              "text-2xl",
              shape &&
                shape !== "circle" && ["rounded-none", avatarShapeClass[shape]],
            ),
          }}
        />

        <h3 className="pt-3 text-lg font-medium text-gray-800 dark:text-dark-100">
          <Highlight query={query}>{name}</Highlight>
        </h3>
        <div className="text-xs-plus">
          <Highlight query={query}>{position}</Highlight>
        </div>
        <div className="mt-3 flex grow flex-wrap items-start gap-2">
          {skills.map((skill, i) => (
            <Tag
              component="button"
              key={i}
              className="rounded-full"
              color={color}
              variant="soft"
            >
              <Highlight query={query}>{skill}</Highlight>
            </Tag>
          ))}
        </div>
        <div className="mt-6 grid w-full grid-cols-2 gap-2">
          <Button color="primary" className="gap-2">
            <UserIcon className="size-4 shrink-0" />
            <span>Profile</span>
          </Button>
          <Button className="gap-2">
            <ChatBubbleOvalLeftIcon className="size-4 shrink-0" />
            <span>Chat</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ActionMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-8 rounded-full"
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
  shape: PropTypes.oneOf([
    "circle",
    "squircle",
    "triangle",
    "diamond",
    "hexagon",
    "hexagon2",
    "star",
    "star2",
    "octagon",
  ]),
  color: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.string),
  position: PropTypes.string,
  avatar: PropTypes.string,
  name: PropTypes.string,
  query: PropTypes.string,
};

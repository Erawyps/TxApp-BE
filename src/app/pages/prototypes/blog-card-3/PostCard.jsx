// Import Dependencies
import { Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/20/solid";
import {
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import PropTypes from "prop-types";

// Local Imports
import { Highlight } from "components/shared/Highlight";
import { Avatar, Button, Card, Input } from "components/ui";
import { useHover } from "hooks";

// ----------------------------------------------------------------------

export function PostCard({
  author_avatar,
  author_name,
  author_username,
  created_at,
  cover,
  title,
  description,
  tags,
  viewCount,
  query,
}) {
  return (
    <Card className="flex grow flex-col p-4">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center space-x-3 ">
          <AvatarHoverCard
            name={author_name}
            image={author_avatar}
            username={author_username}
          />
          <div className="min-w-0">
            <p className="truncate text-gray-800 dark:text-dark-100">
              <Highlight query={query}>{author_name}</Highlight>
            </p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">
              {created_at}
            </p>
          </div>
        </div>
        <ActionMenu />
      </div>
      <div className="mt-5">
        <img
          className="h-48 w-full rounded-lg object-cover object-center"
          src={cover}
          alt={title}
        />
      </div>
      <div className="mt-4 grow">
        <a
          href="##"
          className="text-base font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
        >
          <Highlight query={query}>{title}</Highlight>
        </a>
        <p className="mt-2 line-clamp-3">{description}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <a
            key={i}
            href="##"
            className="text-xs-plus text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
          >
            #<Highlight query={query}>{tag}</Highlight>
          </a>
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex ltr:-ml-1.5 rtl:-mr-1.5">
          <Button
            data-tooltip
            data-tooltip-content="Like"
            isIcon
            variant="flat"
            className="size-9 rounded-full hover:text-secondary dark:hover:text-secondary-light"
          >
            <HeartIcon className="size-5.5" />
          </Button>
          <Button
            data-tooltip
            data-tooltip-content="Comments"
            isIcon
            variant="flat"
            className="size-9 rounded-full hover:text-success dark:hover:text-success-light"
          >
            <ChatBubbleBottomCenterTextIcon className="size-5.5" />
          </Button>
          <Button
            data-tooltip
            data-tooltip-content="Share"
            isIcon
            variant="flat"
            className="size-9 rounded-full hover:text-info dark:hover:text-info-light"
          >
            <ShareIcon className="size-5" />
          </Button>
        </div>
        <div>
          <EyeIcon className="inline size-4.5" /> <span>{viewCount}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between space-x-3 ">
        <Avatar size={8} src="/images/200x200.png" />
        <Input
          classNames={{
            root: "w-full",
            input: "h-8 rounded-full text-xs",
          }}
          placeholder="Write a comment..."
          suffix={
            <Button variant="flat" isIcon className="size-5">
              <MicrophoneIcon className="size-4" />
            </Button>
          }
          prefix={<PaperAirplaneIcon className="size-4" />}
        />
      </div>
    </Card>
  );
}

function AvatarHoverCard({ name, image, username }) {
  const [avatarRef, isHovered] = useHover();

  return (
    <div className="relative" ref={avatarRef}>
      <Avatar
        size={10}
        src={image}
        name={name}
        color="auto"
        classNames={{
          root: "align-middle",
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
            <Avatar size={16} src={image} name={name} color="auto" />

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
        className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
      >
        <EllipsisVerticalIcon className="size-4.5" />
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

AvatarHoverCard.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  username: PropTypes.string,
};

PostCard.propTypes = {
  author_avatar: PropTypes.string,
  author_name: PropTypes.string,
  author_username: PropTypes.string,
  created_at: PropTypes.string,
  cover: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.array,
  viewCount: PropTypes.number,
  query: PropTypes.string,
};

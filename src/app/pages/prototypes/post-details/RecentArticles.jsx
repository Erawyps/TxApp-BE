// Import Dependencies
import PropTypes from "prop-types";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";

// Local Imports
import { Avatar, Button, Card } from "components/ui";

// ----------------------------------------------------------------------

const articles = [
  {
    uid: "1",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "What is Tailwind CSS?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    author_avatar: "/images/200x200.png",
    author_name: "John Doe",
    created_at: "June 23, 2021",
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est repellat nisi corrupti. Lorem, ipsum.",
    author_avatar: "/images/200x200.png",
    author_name: "Konnor Guzman",
    created_at: "May 25, 2021",
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    category: "Programming Language",
    title: "What is PHP?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    author_avatar: "/images/200x200.png",
    author_name: "Travis Fuller",
    created_at: "March 14, 2022",
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    category: "UI/UX",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem quibusdam, ipsam in eveniet quod voluptatum!",
    author_avatar: "/images/200x200.png",
    author_name: "Alfredo Elliott",
    created_at: "June 20, 2022",
  },
];

export function RecentArticles() {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium text-gray-800 dark:text-dark-100">
          Recent Articles
        </p>
        <a
          href="##"
          className="border-b border-dotted border-current pb-0.5 text-xs-plus font-medium text-primary-600 outline-hidden transition-colors duration-300 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400/70 dark:focus:text-primary-400/70"
        >
          View All
        </a>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-1 lg:gap-6">
        {articles.map((article) => (
          <PostCard
            key={article.uid}
            cover={article.cover}
            category={article.category}
            title={article.title}
            description={article.description}
            author_avatar={article.author_avatar}
            author_name={article.author_name}
            created_at={article.created_at}
          />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  cover,
  category,
  title,
  description,
  author_name,
  author_avatar,
  created_at,
}) {
  return (
    <Card className="flex flex-col lg:flex-row">
      <div className="relative h-48 w-full shrink-0 lg:h-auto lg:w-48">
        <img
          className="h-48 w-full rounded-t-lg object-cover object-center lg:h-full lg:ltr:rounded-l-lg lg:ltr:rounded-tr-none lg:rtl:rounded-r-lg lg:rtl:rounded-tl-none"
          src={cover}
          alt={title}
        />
        <a href="##" className="absolute inset-0 opacity-0">
          {title}
        </a>
      </div>
      <div className="flex w-full grow flex-col p-4 sm:px-5">
        <div className="-mt-2 flex items-center justify-between ltr:-mr-1.5 rtl:-ml-1.5">
          <a className="text-xs-plus text-info dark:text-info-lighter" href="##">
            {category}
          </a>
          <div className="-mr-1.5 flex space-x-1 ">
            <Button variant="flat" isIcon className="size-7 rounded-full">
              <BookmarkIcon className="size-4.5" />
            </Button>
            <ActionMenu />
          </div>
        </div>
        <div>
          <a
            href="##"
            className="text-lg font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
          >
            {title}
          </a>
        </div>
        <p className="mt-1 line-clamp-3">{description}</p>
        <div className="mt-4 grow">
          <div className="flex items-center text-xs">
            <a
              href="##"
              className="flex min-w-0 items-center space-x-2 hover:text-gray-800 dark:hover:text-dark-100 "
            >
              <Avatar
                size={6}
                name={author_name}
                src={author_avatar}
                initialColor="auto"
              />
              <span className="truncate">{author_name}</span>
            </a>
            <div className="mx-3 my-1 w-px self-stretch bg-gray-200 dark:bg-dark-500"></div>
            <span className="shrink-0 text-gray-400 dark:text-dark-300">
              {created_at}
            </span>
          </div>
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
        className="size-7 rounded-full"
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

PostCard.propTypes = {
  cover: PropTypes.string,
  category: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  author_name: PropTypes.string,
  author_avatar: PropTypes.string,
  created_at: PropTypes.string,
};

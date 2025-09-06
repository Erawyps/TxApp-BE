// Import Dependencies
import PropTypes from "prop-types";
import { HeartIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Highlight } from "components/shared/Highlight";
import { Button, Card } from "components/ui";

// ----------------------------------------------------------------------

export function PostCard({
  cover,
  category,
  created_at,
  title,
  description,
  likes,
  query,
}) {
  return (
    <Card className="flex flex-col">
      <img
        src={cover}
        className="h-48 w-full rounded-t-lg object-cover object-center"
        alt={title}
      />
      <div className="flex grow flex-col p-4">
        <div className="flex">
          <a
            href="##"
            className="truncate text-xs text-info dark:text-info-lighter"
          >
            <Highlight query={query}>{category}</Highlight>
          </a>
          <div className="mx-2 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
          <span className="text-tiny-plus text-gray-400 dark:text-dark-300">
            {created_at}
          </span>
        </div>
        <div className="line-clamp-2 pt-2">
          <a
            href="##"
            className="text-base font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
          >
            <Highlight query={query}>{title}</Highlight>
          </a>
        </div>
        <p className="grow pt-2">{description}</p>
        <div className="mt-3 text-end">
          <Button className="h-8 space-x-1.5 rounded-full px-4 ">
            <HeartIcon className="size-4.5" />
            <span>{likes}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

PostCard.propTypes = {
  cover: PropTypes.string,
  category: PropTypes.string,
  created_at: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  likes: PropTypes.number,
  query: PropTypes.string,
};

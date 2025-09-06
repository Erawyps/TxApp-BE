// Import Dependencies
import PropTypes from "prop-types";
import { BookmarkIcon, HandThumbUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Highlight } from "components/shared/Highlight";
import { Avatar, Button, Card } from "components/ui";

// ----------------------------------------------------------------------

export function PostCard({
  cover,
  title,
  readTime,
  author_name,
  author_avatar,
  query,
}) {
  return (
    <Card className="flex justify-between gap-2 p-2.5">
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="line-clamp-3">
          <a
            href="##"
            className="font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
          >
            <Highlight query={query}>{title}</Highlight>
          </a>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              size={7}
              name={author_name}
              src={author_avatar}
              initialColor="auto"
              classNames={{ display: "text-xs" }}
            />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                <Highlight query={query}>{author_name}</Highlight>
              </p>
              <p className="truncate text-tiny-plus text-gray-400 dark:text-dark-300">
                {readTime}
              </p>
            </div>
          </div>
          <div className="flex">
            <Button isIcon variant="flat" className="size-7 rounded-full">
              <HandThumbUpIcon className="size-4" />
            </Button>
            <Button isIcon variant="flat" className="size-7 rounded-full">
              <BookmarkIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      <img
        src={cover}
        className="size-28 rounded-lg object-cover object-center"
        alt={title}
      />
    </Card>
  );
}

PostCard.propTypes = {
  cover: PropTypes.string,
  title: PropTypes.string,
  readTime: PropTypes.string,
  author_name: PropTypes.string,
  author_avatar: PropTypes.string,
  query: PropTypes.string,
};

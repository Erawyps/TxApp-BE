import { PropTypes } from "prop-types";

// Local Imports
import { Highlight } from "components/shared/Highlight";
import { Button, Card } from "components/ui";

// ----------------------------------------------------------------------

export function PostCard({
  cover,
  category,
  title,
  description,
  created_at,
  query,
}) {
  return (
    <Card className="flex flex-col">
      <div className="p-2.5">
        <img
          src={cover}
          className="h-48 w-full rounded-lg object-cover object-center"
          alt={title}
        />
      </div>
      <div className="flex grow flex-col px-4 pb-5 pt-1 text-center sm:px-5">
        <div>
          <a className="text-xs-plus text-info dark:text-info-lighter" href="##">
            <Highlight query={query}>{category}</Highlight>
          </a>
        </div>
        <div className="mt-1">
          <a
            href="##"
            className="text-lg font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
          >
            <Highlight query={query}>{title}</Highlight>
          </a>
        </div>
        <div className="my-2 flex items-center space-x-3 text-xs">
          <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
          <p>{created_at}</p>
          <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
        </div>
        <p className="my-2 line-clamp-3 grow text-start">{description}</p>
        <div className="mt-4">
          <Button color="primary" className="rounded-full">
            Read Article
          </Button>
        </div>
      </div>
    </Card>
  );
}

PostCard.propTypes = {
  cover: PropTypes.string,
  category: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  created_at: PropTypes.string,
  query: PropTypes.string,
};

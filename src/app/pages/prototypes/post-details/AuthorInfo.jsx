// Import Dependencies
import {
  EllipsisHorizontalIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Button, Card } from "components/ui";

// ----------------------------------------------------------------------

export function AuthorInfo() {
  return (
    <Card>
      <div className="h-24 rounded-t-lg bg-primary-500">
        <img
          className="h-full w-full rounded-t-lg object-cover object-center"
          src="/images/800x600.png"
          alt="author"
        />
      </div>
      <div className="px-4 pb-5 pt-2 sm:px-5">
        <Avatar
          size={20}
          classNames={{
            root: "-mt-12",
            display: "border-2 border-white dark:border-dark-700",
          }}
          src="/images/200x200.png"
        />
        <h3 className="pt-2 text-lg font-medium text-gray-800 dark:text-dark-100">
          Travis Fuller
        </h3>
        <p className="text-xs-plus text-gray-400 dark:text-dark-300">
          1,596 followers
        </p>
        <p className="mt-3">
          Professional product designer and amateur cyclist living in New York
          City, USA.
        </p>
        <div className="mt-5 flex gap-1">
          <Button className="h-7 rounded-full px-3 text-xs-plus">Follow</Button>
          <Button
            className="size-7 rounded-full"
            isIcon
            aria-label="Send Message"
          >
            <EnvelopeIcon className="size-4 stroke-2" />
          </Button>
          <Button
            className="size-7 rounded-full"
            isIcon
            aria-label="User Actions"
          >
            <EllipsisHorizontalIcon className="size-4 stroke-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

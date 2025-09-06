// Import Dependencies
import PropTypes from "prop-types";
import {
  EnvelopeIcon,
  GlobeAltIcon,
  UserIcon,
  PhoneIcon,
} from "@heroicons/react/20/solid";

// Local Imports
import { Avatar, AvatarDot, Button, Card } from "components/ui";
import { Highlight } from "components/shared/Highlight";

// ----------------------------------------------------------------------

export function UserCard({
  name,
  avatar,
  position,
  phone,
  email,
  website,
  isOnline,
  query,
}) {
  return (
    <Card className="flex grow flex-col items-center p-4 sm:p-5">
      <Avatar
        size={20}
        name={name}
        src={avatar}
        initialColor="auto"
        classNames={{
          display: "text-2xl",
        }}
        indicator={
          <AvatarDot
            color={isOnline ? "primary" : "neutral"}
            className="right-0 m-1 size-4"
          />
        }
      />
      <h3 className="pt-3 text-lg font-medium text-gray-800 dark:text-dark-100">
        <Highlight query={query}>{name}</Highlight>
      </h3>
      <p className="text-xs-plus">
        <Highlight query={query}>{position}</Highlight>
      </p>
      <div className="my-4 h-px w-full bg-gray-200 dark:bg-dark-500"></div>
      <div className="mx-auto inline-grid grid-cols-1 gap-3">
        <div className="flex min-w-0 items-center space-x-2 ">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <PhoneIcon className="size-3.5" />
          </div>
          <p className="truncate">
            <Highlight query={query}>{phone}</Highlight>
          </p>
        </div>
        <div className="flex min-w-0 items-center space-x-2 ">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <EnvelopeIcon className="size-3.5" />
          </div>
          <p className="truncate">
            <Highlight query={query}>{email}</Highlight>
          </p>
        </div>
        <div className="flex min-w-0 items-center space-x-2 ">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <GlobeAltIcon className="size-3.5" />
          </div>
          <p className="truncate">
            <Highlight query={query}>{website}</Highlight>
          </p>
        </div>
        <div className="mt-2 text-center">
          <Button className="space-x-2 " color="primary">
            <UserIcon className="size-4" />
            <span>Profile</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

UserCard.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  position: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
  website: PropTypes.string,
  isOnline: PropTypes.bool,
  query: PropTypes.string,
};

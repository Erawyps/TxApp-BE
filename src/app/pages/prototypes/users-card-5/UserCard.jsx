// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Avatar, AvatarDot, Button, Card } from "components/ui";
import { Highlight } from "components/shared/Highlight";

// ----------------------------------------------------------------------

export function UserCard({ name, avatar, username, isOnline, query }) {
  return (
    <Card className="flex flex-row justify-between space-x-2 p-4 sm:p-5 ">
      <div>
        <div className="flex space-x-1 ">
          <h4 className="truncate text-base font-medium text-gray-800 dark:text-dark-100">
            <Highlight query={query}>{name}</Highlight>
          </h4>
          <Button
            color="primary"
            variant="flat"
            className="h-6 rounded-full px-2 text-xs"
          >
            Follow
          </Button>
        </div>
        <a
          href="##"
          className="text-xs-plus transition-colors hover:text-gray-800 dark:hover:text-dark-50"
        >
          <Highlight query={query}>{username}</Highlight>
        </a>
      </div>

      <Avatar
        size={10}
        name={name}
        src={avatar}
        initialColor="auto"
        classNames={{
          display: "mask is-squircle rounded-none",
        }}
        indicator={
          <AvatarDot
            color={isOnline ? "primary" : "neutral"}
            className="right-0 -m-0.5"
          />
        }
      />
    </Card>
  );
}

UserCard.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  username: PropTypes.string,
  isOnline: PropTypes.bool,
  query: PropTypes.string,
};

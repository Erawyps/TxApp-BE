// Import Dependencies
import PropTypes from "prop-types";

// Local Imports
import { Avatar, Button, Card } from "components/ui";
import { Highlight } from "components/shared/Highlight";

// ----------------------------------------------------------------------

export function UserCard({ name, avatar, team, position, query }) {
  return (
    <Card className="flex flex-col">
      <div className="flex flex-col items-center p-4 text-center sm:p-5">
        <Avatar
          size={20}
          name={name}
          classNames={{ display: "text-xl" }}
          src={avatar}
          initialColor="auto"
        />
        <h3 className="pt-3 text-lg font-medium text-gray-800 dark:text-dark-100">
          <Highlight query={query}>{name}</Highlight>
        </h3>
        <p className="text-xs-plus">
          <Highlight query={query}>{position}</Highlight>
        </p>
        <div className="my-3.5 flex flex-wrap gap-2">
          {team.map(({ uid, name, avatar }) => (
            <Avatar
              size={8}
              key={uid}
              name={name}
              src={avatar}
              initialColor="auto"
              classNames={{ display: "text-xs" }}
            />
          ))}
        </div>
      </div>
      <div className="flex divide-x divide-gray-150 border-t border-gray-150 dark:divide-dark-500 dark:border-dark-500 rtl:divide-x-reverse">
        <Button
          variant="flat"
          className="h-11 w-full rounded-none ltr:rounded-bl-lg rtl:rounded-br-lg"
        >
          Profile
        </Button>
        <Button
          variant="flat"
          color="primary"
          className="h-11 w-full rounded-none ltr:rounded-br-lg rtl:rounded-bl-lg"
        >
          Chat
        </Button>
      </div>
    </Card>
  );
}

UserCard.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  team: PropTypes.array,
  position: PropTypes.string,
  query: PropTypes.string,
};

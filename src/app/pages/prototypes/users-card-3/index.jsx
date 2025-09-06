// Local Imports
import { Page } from "components/shared/Page";
import { Toolbar } from "./Toolbar";
import { UserCard } from "./UserCard";
import { useFuse } from "hooks";

// ----------------------------------------------------------------------

const users = [
  {
    uid: "1",
    name: "Konnor Guzman",
    avatar: "/images/200x200.png",
    tags: ["PHP", "NodeJS", "ReactJS"],
  },
  {
    uid: "2",
    name: "Travis Fuller",
    avatar: "/images/200x200.png",
    tags: ["React", "Laravel"],
  },
  {
    uid: "3",
    name: "Alfredo Elliott",
    avatar: "/images/200x200.png",
    tags: ["Javascript", "CSS", "ES6"],
  },
  {
    uid: "4",
    name: "Derrick Simmons",
    avatar: null,
    tags: ["AlpineJS", "TailwindCSS"],
  },
  {
    uid: "5",
    name: "Katrina West",
    avatar: "/images/200x200.png",
    tags: ["Ionic", "React", "Flutter"],
  },
  {
    uid: "6",
    name: "Henry Curtis",
    avatar: "/images/200x200.png",
    tags: ["ReactJS", "Typescript", "NestJS"],
  },
  {
    uid: "7",
    name: "Raul Bradley",
    avatar: "/images/200x200.png",
    tags: ["MariaDB", "Laravel"],
  },
  {
    uid: "8",
    name: "Samantha Shelton",
    avatar: null,
    tags: ["MariaDB", "Laravel"],
  },
  {
    uid: "9",
    name: "Corey Evans",
    avatar: "/images/200x200.png",
    tags: ["SolidJS", "ReactJS", "Typescript"],
  },
  {
    uid: "10",
    name: "Lance Tucker",
    avatar: null,
    tags: ["NestJS", "Express", "Typescript"],
  },
  {
    uid: "11",
    name: "Anthony Jensen",
    avatar: "/images/200x200.png",
    tags: ["Figma", "Illustrator", "Sketch"],
  },
  {
    uid: "12",
    name: "Anthony Jensen",
    avatar: "/images/200x200.png",
    tags: ["NextJS", "Remix", "Typescript"],
  },
];

export default function UsersCard3() {
  const {
    result: filteredUsers,
    query,
    setQuery,
  } = useFuse(users, {
    keys: ["name", "tags"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
    <Page title="Users Card 1">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filteredUsers.map(({ item: user, refIndex }) => (
            <UserCard
              key={refIndex}
              name={user.name}
              avatar={user.avatar}
              tags={user.tags}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

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
    position: "Senior Developer",
    skills: ["PHP", "NodeJS", "ReactJS"],
    color: "success",
    shape: "circle",
  },
  {
    uid: "2",
    name: "Travis Fuller",
    avatar: "/images/200x200.png",
    position: "Web Developer",
    skills: ["React", "Laravel"],
    color: "primary",
    shape: "circle",
  },
  {
    uid: "3",
    name: "Alfredo Elliott",
    avatar: "/images/200x200.png",
    position: "UI/UX designer",
    skills: ["Javascript", "CSS", "ES6"],
    color: "secondary",
    shape: "squircle",
  },
  {
    uid: "4",
    name: "Derrick Simmons",
    avatar: null,
    position: "React Developer",
    skills: ["AlpineJS", "TailwindCSS"],
    color: "warning",
    shape: "circle",
  },
  {
    uid: "5",
    name: "Katrina West",
    avatar: "/images/200x200.png",
    position: "Android Developer",
    skills: ["Ionic", "React", "Flutter"],
    color: "info",
    shape: "triangle",
  },
  {
    uid: "6",
    name: "Henry Curtis",
    avatar: "/images/200x200.png",
    position: "Full Stack Developer",
    skills: ["ReactJS", "Typescript", "NestJS"],
    color: "success",
    shape: "circle",
  },
  {
    uid: "7",
    name: "Raul Bradley",
    avatar: "/images/200x200.png",
    position: "Laravel Developer",
    skills: ["MariaDB", "Laravel"],
    color: "error",
    shape: "diamond",
  },
  {
    uid: "8",
    name: "Samantha Shelton",
    avatar: null,
    position: "Backend Developer",
    skills: ["MariaDB", "Laravel"],
    color: "primary",
    shape: "hexagon",
  },
  {
    uid: "9",
    name: "Corey Evans",
    avatar: "/images/200x200.png",
    position: "Frontend Developer",
    skills: ["SolidJS", "ReactJS", "Typescript"],
    color: "secondary",
    shape: "hexagon2",
  },
  {
    uid: "10",
    name: "Lance Tucker",
    avatar: null,
    position: "NodeJS Developer",
    skills: ["NestJS", "Express", "Typescript"],
    color: "warning",
    shape: "star",
  },
  {
    uid: "11",
    name: "Anthony Jensen",
    avatar: "/images/200x200.png",
    position: "UI/UX Designer",
    skills: ["Figma", "Illustrator", "Sketch"],
    color: "info",
    shape: "star2",
  },
  {
    uid: "12",
    name: "Anthony Jensen",
    avatar: "/images/200x200.png",
    position: "Backend Developer",
    skills: ["NextJS", "Remix", "Typescript"],
    color: "success",
    shape: "octagon",
  },
];

export default function UsersCard1() {
  const {
    result: filteredUsers,
    query,
    setQuery,
  } = useFuse(users, {
    keys: ["name", "skills", "position"],
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
              position={user.position}
              skills={user.skills}
              color={user.color}
              shape={user.shape}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

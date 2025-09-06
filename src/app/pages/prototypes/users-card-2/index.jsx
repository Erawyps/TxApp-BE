import { Page } from "components/shared/Page";
import { useFuse } from "hooks";
import { Toolbar } from "./Toolbar";
import { UserCard } from "./UserCard";

const users = [
  {
    uid: "1",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "primary",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Konnor Guzman",
    location: "USA, Washington DC",
    chartData: [48, 100, 70, 92],
    postsCount: 24,
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "secondary",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Travis Fuller",
    location: "UK, London",
    chartData: [54, 77, 43, 69, 12],
    postsCount: 11,
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "success",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Alfredo Elliott",
    location: "Australia, Sydney",
    chartData: [0, 100, 0],
    postsCount: 171,
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "error",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Derrick Simmons",
    location: "Austria, Vienna",
    chartData: [0, 20, 10, 30, 20, 50],
    postsCount: 67,
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "warning",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Raul Bradley",
    location: "Germany, Berlin",
    chartData: [33, 77, 55, 102, 12],
    postsCount: 36,
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "primary",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Katrina West",
    location: "Sweden, Stockholm",
    chartData: [48, 100, 70, 92],
    postsCount: 52,
  },
  {
    uid: "7",
    cover: "/images/800x600.png",
    avatar: null,
    color: "secondary",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Samantha Shelton",
    location: "Switzerland, Zurich",
    chartData: [54, 77, 43, 69, 12],
    postsCount: 96,
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    avatar: "/images/200x200.png",
    color: "success",
    socialLinks: {
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      facebook: "https://facebook.com",
    },
    name: "Henry Curtis",
    location: "Australia, Sydney",
    chartData: [0, 100, 0],
    postsCount: 125,
  },
];

export default function UsersCard2() {
  const {
    result: filteredUsers,
    query,
    setQuery,
  } = useFuse(users, {
    keys: ["name", "location"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
    <Page title="Users Card 2">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filteredUsers.map(({ item: user, refIndex }) => (
            <UserCard
              key={refIndex}
              avatar={user.avatar}
              cover={user.cover}
              color={user.color}
              socialLinks={user.socialLinks}
              name={user.name}
              query={query}
              chartData={user.chartData}
              location={user.location}
              postsCount={user.postsCount}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

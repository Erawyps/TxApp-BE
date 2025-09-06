// Local Imports
import { Page } from "components/shared/Page";
import { Toolbar } from "./Toolbar";
import { UserCard } from "./UserCard";
import { useFuse } from "hooks";

// ----------------------------------------------------------------------

const users = [
  {
    uid: 1,
    name: "Chiquita Flament",
    avatar: "/images/200x200.png",
    email: "cflament0@foxnews.com",
    website: "www.foxnews.com",
    phone: "312-329-5963",
    position: "Backend Developer",
    isOnline: true,
  },
  {
    uid: 2,
    name: "Ludvig Kennea",
    avatar: "/images/200x200.png",
    email: "lkennea1@nydailynews.com",
    website: "www.nydailynews.com",
    phone: "398-181-0799",
    position: "Frontend Developer",
    isOnline: true,
  },
  {
    uid: 3,
    name: "Kelvin Keuning",
    avatar: "/images/200x200.png",
    email: "kkeuning2@nih.gov",
    website: "www.nih.gov",
    phone: "177-302-1065",
    position: "UI/UX Designer",
    isOnline: true,
  },
  {
    uid: 4,
    name: "Homere O'Noulane",
    avatar: "/images/200x200.png",
    email: "honoulane3@goo.ne.jp",
    website: "www.goo.ne.jp",
    phone: "673-942-1852",
    position: "Web Developer",
    isOnline: false,
  },
  {
    uid: 5,
    name: "Kriste Salerno",
    avatar: null,
    email: "ksalerno4@amazonaws.com",
    website: "www.amazonaws.com",
    phone: "355-451-1490",
    position: "Commercial Director",
    isOnline: true,
  },
  {
    uid: 6,
    name: "Georgianna Lancett",
    avatar: "/images/200x200.png",
    email: "glancett5@w3.org",
    website: "www.w3.org",
    phone: "957-842-2732",
    position: "HR",
    isOnline: true,
  },
  {
    uid: 7,
    name: "Elissa Hunter",
    avatar: "/images/200x200.png",
    email: "ehunter6@cocolog-nifty.com",
    website: "www.cocolog-nifty.com",
    phone: "791-332-3620",
    position: "Software Engineer",
    isOnline: true,
  },
  {
    uid: 8,
    name: "Melvin Fynan",
    avatar: null,
    email: "mfynan7@photobucket.com",
    website: "www.photobucket.com",
    phone: "231-966-7454",
    position: "IOS Developer",
    isOnline: true,
  },
  {
    uid: 9,
    name: "Cooper Hanfrey",
    avatar: "/images/200x200.png",
    email: "chanfrey8@indiatimes.com",
    website: "www.indiatimes.com",
    phone: "853-318-1593",
    position: "Full Stack Developer",
    isOnline: false,
  },
  {
    uid: 10,
    name: "Isobel Beininck",
    avatar: null,
    email: "ibeininck9@smugmug.com",
    website: "www.smugmug.com",
    phone: "952-500-0727",
    position: "Android Developer",
    isOnline: true,
  },
  {
    uid: 11,
    name: "Arlen Guyonneau",
    avatar: "/images/200x200.png",
    email: "aguyonneaua@apple.com",
    website: "www.apple.com",
    phone: "173-834-9691",
    position: "Senior Developer",
    isOnline: true,
  },
  {
    uid: 12,
    name: "Erda Matyja",
    avatar: "/images/200x200.png",
    email: "ematyjab@sbwire.com",
    website: "www.sbwire.com",
    phone: "762-437-1668",
    position: "Laravel Developer",
    isOnline: true,
  },
];

export default function UsersCard7() {
  const {
    result: filteredUsers,
    query,
    setQuery,
  } = useFuse(users, {
    keys: ["name", "position", "email", "phone", "website"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
    <Page title="Users Card 7">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filteredUsers.map(({ item: user, refIndex }) => (
            <UserCard
              key={refIndex}
              name={user.name}
              avatar={user.avatar}
              isOnline={user.isOnline}
              position={user.position}
              phone={user.phone}
              email={user.email}
              website={user.website}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

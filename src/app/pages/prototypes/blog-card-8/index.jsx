// Local Imports
import { Page } from "components/shared/Page";
import { Toolbar } from "./Toolbar";
import { PostCard } from "./PostCard";
import { useFuse } from "hooks";

// ----------------------------------------------------------------------

const posts = [
  {
    uid: "1",
    cover: "/images/800x600.png",
    created_at: "25 May, 2022",
    title: "Food: A Simple Definition",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi necessitatibus repellat voluptatibus?",
    author_name: "John Doe",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    created_at: "30 May, 2022",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor on the sit.",
    author_name: "Konnor Guzman",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    created_at: "10 June, 2022",
    title: "What is PHP?",
    description:
      "How Did We Get Here? The History of Music Told Through Tweets",
    author_name: "Travis Fuller",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    created_at: "19 June, 2022",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto assumenda.",
    author_name: "Alfredo Elliott",
    author_avatar: null,
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    created_at: "26 June, 2022",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto assumenda.",
    author_name: "Katrina West",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    created_at: "12 June, 2022",
    title: "How Did We Get Here? The History of Music Told Through Tweets",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    author_name: "Henry Curtis",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "7",
    cover: "/images/800x600.png",
    created_at: "30 June, 2022",
    title: "NodeJS Design Patterns",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    author_name: "Samantha Shelton",
    author_avatar: null,
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    created_at: "03 July, 2022",
    title: "313 Pattern and Color ideas",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    author_name: "Konnor Guzman",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "9",
    cover: "/images/800x600.png",
    created_at: "08 July, 2022",
    title: "25 Surprising Facts About Chair",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    author_name: "Selena Gomez",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "10",
    cover: "/images/800x600.png",
    created_at: "10 June, 2022",
    title: "What is PHP?",
    description:
      "How Did We Get Here? The History of Music Told Through Tweets",
    author_name: "Travis Fuller",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "11",
    cover: "/images/800x600.png",
    created_at: "11 September, 2022",
    title: "Food: A Simple Definition",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi necessitatibus repellat voluptatibus?",
    author_name: "John Doe",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "12",
    cover: "/images/800x600.png",
    created_at: "25 May, 2022",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor on the sit.",
    author_name: "Konnor Guzman",
    author_avatar: "/images/200x200.png",
  },
];

export default function BlogCard8() {
  const {
    result: filteredPosts,
    query,
    setQuery,
  } = useFuse(posts, {
    keys: ["author_name", "title"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
    <Page title="Blog Card 8">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filteredPosts.map(({ item: post, refIndex }) => (
            <PostCard
              key={refIndex}
              cover={post.cover}
              created_at={post.created_at}
              title={post.title}
              description={post.description}
              author_name={post.author_name}
              author_avatar={post.author_avatar}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

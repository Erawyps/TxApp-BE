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
    category: "Frameworks",
    created_at: "a hour ago",
    title: "Food: A Simple Definition",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi necessitatibus repellat voluptatibus?",
    likes: 32,
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    category: "Frameworks",
    created_at: "12 min ago",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor on the sit.",
    likes: 65,
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    category: "Music",
    created_at: "a day ago",
    title: "What is PHP?",
    description:
      "How Did We Get Here? The History of Music Told Through Tweets",
    likes: 126,
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    category: "UI/UX Design",
    created_at: "2 days ago",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto assumenda.",
    likes: 658,
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    category: "UI/UX Design",
    created_at: "2 days ago",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto assumenda.",
    likes: 268,
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    category: "Music",
    created_at: "5 days ago",
    title: "How Did We Get Here? The History of Music Told Through Tweets",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    likes: 38,
  },
  {
    uid: "7",
    cover: "/images/800x600.png",
    category: "Programming",
    created_at: "11 days ago",
    title: "NodeJS Design Patterns",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    likes: 79,
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    category: "UI/UX Design",
    created_at: "14 days ago",
    title: "313 Pattern and Color ideas",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    likes: 126,
  },
  {
    uid: "9",
    cover: "/images/800x600.png",
    category: "Home",
    created_at: "22 days ago",
    title: "25 Surprising Facts About Chair",
    description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit.",
    likes: 215,
  },
  {
    uid: "10",
    cover: "/images/800x600.png",
    category: "Music",
    created_at: "25 days ago",
    title: "What is PHP?",
    description:
      "How Did We Get Here? The History of Music Told Through Tweets",
    likes: 127,
  },
  {
    uid: "11",
    cover: "/images/800x600.png",
    category: "Frameworks",
    created_at: "a month ago",
    title: "Food: A Simple Definition",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi necessitatibus repellat voluptatibus?",
    likes: 32,
  },
  {
    uid: "12",
    cover: "/images/800x600.png",
    category: "Frameworks",
    created_at: "12 month ago",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur. Lorem ipsum dolor on the sit.",
    likes: 65,
  },
];

export default function BlogCard7() {
  const {
    result: filteredPosts,
    query,
    setQuery,
  } = useFuse(posts, {
    keys: ["category", "title"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
    <Page title="Blog Card 7">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filteredPosts.map(({ item: post, refIndex }) => (
            <PostCard
              key={refIndex}
              cover={post.cover}
              category={post.category}
              created_at={post.created_at}
              title={post.title}
              description={post.description}
              likes={post.likes}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

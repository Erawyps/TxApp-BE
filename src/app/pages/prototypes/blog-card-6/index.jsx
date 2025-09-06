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
    title: "What is Tailwind CSS?",
    readTime: "2 min read",
    author_name: "John D.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    title: "Tailwind CSS Card Example",
    readTime: "5 min read",
    author_name: "Travis F.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    title: "10 Tips for Making a Good Camera Even Better",
    readTime: "4 min read",
    author_name: "Alfredo E.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    title: "Top Design Systems",
    readTime: "1 min read",
    author_name: "Katrina W.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    title: "NodeJS Design Patterns",
    readTime: "6 min read",
    author_name: "Henry C.",
    author_avatar: null,
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    title: "313 Pattern and Color ideas",
    readTime: "3 min read",
    author_name: "Derrick S.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "7",
    cover: "/images/800x600.png",
    title: "10 Tips for Making a Good Camera Even Better",
    readTime: "1 min read",
    author_name: "Raul B.",
    author_avatar: null,
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    title: "The 12 Worst Types Business Accounts You Follow on Twitter",
    readTime: "7 min read",
    author_name: "Samantha S.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "9",
    cover: "/images/800x600.png",
    title: "25 Surprising Facts About Chair",
    readTime: "2 min read",
    author_name: "Travis F..",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "10",
    cover: "/images/800x600.png",
    title: "What is Tailwind CSS?",
    readTime: "2 min read",
    author_name: "John D.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "11",
    cover: "/images/800x600.png",
    title: "Tailwind CSS Card Example",
    readTime: "5 min read",
    author_name: "Travis F.",
    author_avatar: "/images/200x200.png",
  },
  {
    uid: "12",
    cover: "/images/800x600.png",
    title: "10 Tips for Making a Good Camera Even Better",
    readTime: "4 min read",
    author_name: "Alfredo E.",
    author_avatar: "/images/200x200.png",
  },
];

export default function BlogCard6() {
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
    <Page title="Blog Card 6">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {filteredPosts.map(({ item: post, refIndex }) => (
            <PostCard
              key={refIndex}
              cover={post.cover}
              title={post.title}
              readTime={post.readTime}
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

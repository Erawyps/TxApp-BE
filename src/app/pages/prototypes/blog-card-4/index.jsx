// Local Imports
import { Page } from "components/shared/Page";
import { Toolbar } from "./Toolbar";
import { PostCard } from "./PostCard";
import { useFuse } from "hooks";

const posts = [
  {
    uid: "1",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "What is Tailwind CSS?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    author_avatar: "/images/200x200.png",
    author_name: "John Doe",
    author_username: "@johndoe",
    tags: ["PHP", "ReactJS", "NextJS"],
    viewCount: 237,
    created_at: "37 min ago",
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est repellat nisi corrupti. Lorem, ipsum.",
    author_avatar: "/images/200x200.png",
    author_name: "Konnor Guzman",
    author_username: "@konnorguzman",
    tags: ["TailwindCSS", "RemixJS", "AlpineJS"],
    viewCount: 479,
    created_at: "2 hour ago",
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    category: "Programming Language",
    title: "What is PHP?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    author_avatar: "/images/200x200.png",
    author_name: "Travis Fuller",
    author_username: "@travisfuller",
    tags: ["OOP", "Laravel", "NextJS"],
    viewCount: 665,
    created_at: "2 days ago",
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    category: "UI/UX",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem quibusdam, ipsam in eveniet quod voluptatum!",
    author_avatar: "/images/200x200.png",
    author_name: "Alfredo Elliott",
    author_username: "@alfredorlliott",
    tags: ["DesignSystem", "MaterialUI", "FluentDesign"],
    viewCount: 742,
    created_at: "3 days ago",
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    category: "UI/UX",
    title: "313 Pattern and Color ideas",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptates impedit odio consectetur! Voluptatem ipsa nulla excepturi voluptatibus.",
    author_avatar: "/images/200x200.png",
    author_name: "Derrick Simmons",
    author_username: "@derricksimmons",
    tags: ["colors", "spectrum", "warmcolors"],
    viewCount: 23,
    created_at: "6 days ago",
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    category: "Programming Language",
    title: "NodeJS Design Patterns",
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias rerum aliquam maiores dolorum itaque?",
    author_avatar: "/images/200x200.png",
    author_name: "Katrina West",
    author_username: "@katrinawest",
    tags: ["PHP", "NodeJS", "Javascript"],
    viewCount: 237,
    created_at: "14 days ago",
  },
];

export default function BlogCard4() {
  const {
    result: filteredPosts,
    query,
    setQuery,
  } = useFuse(posts, {
    keys: ["category", "title", "tags", "author_name"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
    <Page title="Blog Card 4">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {filteredPosts.map(({ item: post, refIndex }) => (
            <PostCard
              key={refIndex}
              cover={post.cover}
              category={post.category}
              title={post.title}
              description={post.description}
              author_avatar={post.author_avatar}
              author_name={post.author_name}
              author_username={post.author_username}
              tags={post.tags}
              created_at={post.created_at}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

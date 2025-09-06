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
    created_at: "June 23, 2021",
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est repellat nisi corrupti. Lorem, ipsum.",
    created_at: "May 25, 2021",
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    category: "Programming Language",
    title: "What is PHP?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    created_at: "March 14, 2022",
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    category: "UI/UX",
    title: "Top Design Systems",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem quibusdam, ipsam in eveniet quod voluptatum!",
    created_at: "June 20, 2022",
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    category: "UI/UX",
    title: "313 Pattern and Color ideas",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptates impedit odio consectetur! Voluptatem ipsa nulla excepturi voluptatibus.",
    created_at: "December 27, 2021",
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    category: "Programming Language",
    title: "NodeJS Design Patterns",
    description:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias rerum aliquam maiores dolorum itaque?",
    created_at: "November 9, 2021",
  },
  {
    uid: "7",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "What is Tailwind CSS?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    created_at: "June 23, 2021",
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "Tailwind CSS Card Example",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est repellat nisi corrupti. Lorem, ipsum.",
    created_at: "May 25, 2021",
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    category: "Frameworks",
    title: "What is Tailwind CSS?",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eveniet, provident quasi recusandae repudiandae rerum temporibus!",
    created_at: "June 23, 2021",
  },
];

export default function BlogCard2() {
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
    <Page title="Blog Card 2">
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
              created_at={post.created_at}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

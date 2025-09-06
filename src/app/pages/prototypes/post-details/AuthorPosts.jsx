// Import Dependencies
import {
  BookmarkIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Button } from "components/ui";

// ----------------------------------------------------------------------

const posts = [
  {
    uid: "1",
    title: "What is Tailwind CSS?",
    cover: "/images/800x600.png",
    readTime: "2 min read",
    created_at: "06 Nov",
  },
  {
    uid: "2",
    title: "Top Design Systems",
    cover: "/images/800x600.png",
    readTime: "5 min read",
    created_at: "13 Oct",
  },
  {
    uid: "3",
    title: "10 Tips for Making a Good Camera Even Better",
    cover: "/images/800x600.png",
    readTime: "7 min read",
    created_at: "22 Oct",
  },
  {
    uid: "4",
    title: "25 Surprising Facts About Chair",
    cover: "/images/800x600.png",
    readTime: "4 min read",
    created_at: "01 Nov",
  },
];

export function AuthorPosts() {
  return (
    <div className="mt-5">
      <p className="border-b border-gray-200 pb-2 text-base text-gray-800 dark:border-dark-600 dark:text-dark-100">
        More from Travis Fuller
      </p>
      <div className="mt-3 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
        {posts.map((post) => (
          <div className="flex justify-between gap-2" key={post.uid}>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="truncate text-xs font-medium">
                  {post.created_at}
                </p>
                <div className="mt-1 line-clamp-3 text-gray-800 dark:text-dark-100">
                  <a
                    href="##"
                    className="font-medium text-gray-700 hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400"
                  >
                    {post.title}
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="truncate text-xs font-medium">{post.readTime}</p>
                <div className="flex">
                  <Button className="size-7 rounded-full" isIcon variant="flat">
                    <EllipsisHorizontalIcon className="size-4.5" />
                  </Button>
                  <Button className="size-7 rounded-full" isIcon variant="flat">
                    <BookmarkIcon className="size-4.5" />
                  </Button>
                </div>
              </div>
            </div>
            <img
              src={post.cover}
              className="size-24 rounded-lg object-cover object-center"
              alt={post.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

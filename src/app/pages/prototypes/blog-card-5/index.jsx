// Import Dependencies
import {
  CpuChipIcon,
  CurrencyDollarIcon,
  HomeIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";

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
    category: "Technology",
    CategoryIcon: CpuChipIcon,
    title: "10 Tips for Making a Good Camera Even Better",
    created_at: "48 min ago",
  },
  {
    uid: "2",
    cover: "/images/800x600.png",
    category: "Music",
    CategoryIcon: MusicalNoteIcon,
    title: "How Did We Get Here? The History of Music Told Through Tweets",
    created_at: "a hour ago",
  },
  {
    uid: "3",
    cover: "/images/800x600.png",
    category: "Business",
    CategoryIcon: CurrencyDollarIcon,
    title: "The 12 Worst Types Business Accounts You Follow on Twitter",
    created_at: "a day ago",
  },
  {
    uid: "4",
    cover: "/images/800x600.png",
    category: "Home",
    CategoryIcon: HomeIcon,
    title: "25 Surprising Facts About Chair",
    created_at: "3 days ago",
  },
  {
    uid: "5",
    cover: "/images/800x600.png",
    category: "Home",
    CategoryIcon: HomeIcon,
    title: "10 Meetups About Food You Should Attend",
    created_at: "5 days ago",
  },
  {
    uid: "6",
    cover: "/images/800x600.png",
    category: "Home",
    CategoryIcon: HomeIcon,
    title: "Food: A Simple Definition",
    created_at: "8 days ago",
  },
  {
    uid: "7",
    cover: "/images/800x600.png",
    category: "Technology",
    CategoryIcon: CpuChipIcon,
    title: "10 Tips for Making a Good Camera Even Better",
    created_at: "48 min ago",
  },
  {
    uid: "8",
    cover: "/images/800x600.png",
    category: "Music",
    CategoryIcon: MusicalNoteIcon,
    title: "How Did We Get Here? The History of Music Told Through Tweets",
    created_at: "a hour ago",
  },
  {
    uid: "9",
    cover: "/images/800x600.png",
    category: "Business",
    CategoryIcon: CurrencyDollarIcon,
    title: "The 12 Worst Types Business Accounts You Follow on Twitter",
    created_at: "a day ago",
  },
];

export default function BlogCard5() {
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
    <Page title="Blog Card 5">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {filteredPosts.map(({ item: post, refIndex }) => (
            <PostCard
              key={refIndex}
              cover={post.cover}
              category={post.category}
              CategoryIcon={post.CategoryIcon}
              title={post.title}
              created_at={post.created_at}
              query={query}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

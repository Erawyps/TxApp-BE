// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostFooter } from "./PostFooter";
import { RecentArticles } from "./RecentArticles";
import { AuthorInfo } from "./AuthorInfo";
import { AuthorPosts } from "./AuthorPosts";

// ----------------------------------------------------------------------

export default function PostDetails() {
  return (
    <Page title="Post Details">
      <div className="transition-content grid w-full grid-cols-12 px-(--margin-x) lg:gap-6">
        <div className="col-span-12 pt-6 lg:col-span-8 lg:pb-6">
          <Card className="p-4 lg:p-6">
            <PostHeader />
            <PostContent />
            <PostFooter />
          </Card>
          <RecentArticles />
        </div>
        <div className="col-span-12 py-6 lg:sticky lg:top-16 lg:col-span-4 lg:self-start">
          <AuthorInfo />
          <AuthorPosts/>
        </div>
      </div>
    </Page>
  );
}

// Local Imports
import { Page } from "components/shared/Page";
import { Breadcrumbs } from "components/shared/Breadcrumbs";
import { Search } from "./sections/Search";
import { Section1 } from "./sections/Section1";
import { Section2 } from "./sections/Section2";
import { Section3 } from "./sections/Section3";

const breadcrumbs = [
  { title: "Pages", path: "/pages" },
  { title: "Help", path: "/pages/help" },
  { title: "Help v3" },
];

export default function Help3() {
  return (
    <Page title="Help V3">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="flex items-center space-x-4 py-5  lg:py-6">
          <h2 className="text-xl font-medium tracking-wide text-gray-800 dark:text-dark-50 lg:text-2xl">
            Help v3
          </h2>
          <div className="hidden self-stretch py-1 sm:flex">
            <div className="h-full w-px bg-gray-300 dark:bg-dark-600"></div>
          </div>
          <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
        </div>
        <Search />
        <div className="mt-20 space-y-20">
          <Section1 />
          <Section2 />
          <Section3 />
        </div>
      </div>
    </Page>
  );
}

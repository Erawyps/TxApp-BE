// Local Imports
import { Page } from "components/shared/Page";
import { OnboardingItem } from "./OnboardingItem";
import Creativedesign  from "assets/illustrations/creativedesign-amber.svg?react";
import Performance  from "assets/illustrations/performance-indigo.svg?react";
import Responsive  from "assets/illustrations/responsive-rose.svg?react";

// ----------------------------------------------------------------------

const items = [
  {
    id: 1,
    title: "Creative Design",
    Image: Creativedesign,
    colorClasses: "from-amber-400 to-orange-600",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus eius in qui!",
    action: "/",
    actionLabel: "Start Design",
  },
  {
    id: 2,
    title: "Fully Responsive",
    Image: Responsive,
    colorClasses: "from-pink-500 to-rose-500",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea ipsam odio totam?",
    action: "/",
    actionLabel: "Start Design",
  },
  {
    id: 3,
    title: "Performance",
    Image: Performance,
    colorClasses: "from-purple-500 to-indigo-600",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum necessitatibus quas sit.",
    action: "/",
    actionLabel: "Start Design",
  },
];

export default function Onboarding2() {
  return (
    <Page title="Onboarding v2">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="py-5 text-center lg:py-6">
          <p className="text-sm uppercase">Are you new here?</p>
          <h3 className="mt-1 text-xl font-semibold text-gray-600 dark:text-dark-100">
            Welcome. Where do you like to Start?
          </h3>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {items.map((item) => (
            <OnboardingItem
              key={item.id}
              title={item.title}
              description={item.description}
              action={item.action}
              actionLabel={item.actionLabel}
              Image={item.Image}
              colorClasses={item.colorClasses}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

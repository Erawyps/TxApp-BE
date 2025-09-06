// Local Imports
import { Page } from "components/shared/Page";
import { OnboardingItem } from "./OnboardingItem";
import BoyDashboard from "assets/illustrations/boy-dashboard.svg?react";
import GirlDesigning from "assets/illustrations/girl-designing.svg?react";
import ResponsiveDevicesGirl from "assets/illustrations/responsive-devices-girl.svg?react";

// ----------------------------------------------------------------------

const items = [
  {
    id: 1,
    title: "Creative Design",
    Image: BoyDashboard,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus eius in qui!",
    action: "/",
    actionLabel: "Start Design",
  },
  {
    id: 2,
    title: "Fully Responsive",
    Image: GirlDesigning,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea ipsam odio totam?",
    action: "/",
    actionLabel: "Start Design",
  },
  {
    id: 3,
    title: "Performance",
    Image: ResponsiveDevicesGirl,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illum necessitatibus quas sit.",
    action: "/",
    actionLabel: "Start Design",
  },
];

export default function Onboarding1() {
  return (
    <Page title="Onboarding v1">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="py-5 text-center lg:py-6">
          <p className="text-sm uppercase">Are you new here?</p>
          <h3 className="mt-1 text-xl font-semibold text-gray-600 dark:text-dark-100">
            Welcome. Where do you like to Start?
          </h3>
        </div>
        <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6 mx-auto">
          {items.map((item) => (
            <OnboardingItem
              key={item.id}
              title={item.title}
              description={item.description}
              action={item.action}
              actionLabel={item.actionLabel}
              Image={item.Image}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

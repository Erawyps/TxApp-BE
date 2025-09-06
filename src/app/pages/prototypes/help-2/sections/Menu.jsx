// Import Dependencies
import {
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { Box } from "components/ui";

// ----------------------------------------------------------------------

const items = [
  {
    id: "start",
    Icon: ArrowTrendingUpIcon,
    title: "Getting Started",
    description: "Lorem ipsum dolor sit amet, consectetur.",
    isActive: true,
  },
  {
    id: "my-account",
    Icon: UserIcon,
    title: "My Account",
    description: "Lorem ipsum dolor sit amet, consectetur.",
    isActive: false,
  },
  {
    id: "mobile-app",
    Icon: DevicePhoneMobileIcon,
    title: "Mobile App",
    description: "Lorem ipsum dolor sit amet, consectetur.",
    isActive: false,
  },
  {
    id: "security",
    Icon: ShieldCheckIcon,
    title: "Security",
    description: "Lorem ipsum dolor sit amet, consectetur.",
    isActive: false,
  },
];

export function Menu() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      {items.map(({ id, isActive, Icon, title, description }) => (
        <Box
          component="a"
          href="#"
          key={id}
          className={clsx(
            "relative rounded-lg px-4 py-10 text-center",
            isActive
              ? "bg-primary-600 text-white dark:bg-primary-500"
              : "bg-white text-gray-800 shadow-soft dark:bg-dark-700 dark:text-dark-100 dark:shadow-none",
          )}
        >
          <Icon
            className={clsx(
              "inline size-12",
              !isActive && "text-primary-600 dark:text-primary-400",
            )}
          />
          <h4 className="mt-2 text-lg font-medium">{title}</h4>
          <p className="mt-2 opacity-90">{description}</p>
        </Box>
      ))}
    </div>
  );
}

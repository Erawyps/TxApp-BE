// Import Dependencies
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaCar, FaPlane, FaRocket } from "react-icons/fa";
import clsx from "clsx";

// Local Imports
import { Page } from "components/shared/Page";
import { Badge, Button } from "components/ui";

// ----------------------------------------------------------------------

const plan1 = [
  {
    id: 1,
    label: "Lorem ipsum",
    avaliable: true,
  },
  {
    id: 2,
    label: "Lorem set",
    avaliable: true,
  },
  {
    id: 3,
    label: "Lorem ipsum dolor.",
    avaliable: true,
  },
  {
    id: 4,
    label: "Lorem ipsum dolor sit amet, consectetur.",
    avaliable: false,
  },
  {
    id: 5,
    label: "Only lorem",
    avaliable: false,
  },
  {
    id: 6,
    label: "Lorem ipsum dolor.",
    avaliable: false,
  },
  {
    id: 7,
    label: "Lorem ipsum.",
    avaliable: false,
  },
];

const plan2 = [
  {
    id: 1,
    label: "Lorem ipsum",
    avaliable: true,
  },
  {
    id: 2,
    label: "Lorem set",
    avaliable: true,
  },
  {
    id: 3,
    label: "Lorem ipsum dolor.",
    avaliable: true,
  },
  {
    id: 4,
    label: "Lorem ipsum dolor sit amet, consectetur.",
    avaliable: true,
  },
  {
    id: 5,
    label: "Only lorem",
    avaliable: true,
  },
  {
    id: 6,
    label: "Lorem ipsum dolor.",
    avaliable: false,
  },
  {
    id: 7,
    label: "Lorem ipsum.",
    avaliable: false,
  },
];

const plan3 = [
  {
    id: 1,
    label: "Lorem ipsum",
    avaliable: true,
  },
  {
    id: 2,
    label: "Lorem set",
    avaliable: true,
  },
  {
    id: 3,
    label: "Lorem ipsum dolor.",
    avaliable: true,
  },
  {
    id: 4,
    label: "Lorem ipsum dolor sit amet, consectetur.",
    avaliable: true,
  },
  {
    id: 5,
    label: "Only lorem",
    avaliable: true,
  },
  {
    id: 6,
    label: "Lorem ipsum dolor.",
    avaliable: true,
  },
  {
    id: 7,
    label: "Lorem ipsum.",
    avaliable: true,
  },
];

export default function PriceList2() {
  return (
    <Page title="Price List v2">
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <div className="py-5 text-center lg:py-6">
          <p className="text-sm uppercase">Are you new here?</p>
          <h3 className="mt-1 text-xl font-semibold text-gray-600 dark:text-dark-100">
            Welcome. Where do you like to Start?
          </h3>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 rtl:divide-x-reverse divide-y divide-gray-150 rounded-lg bg-white shadow-soft dark:divide-dark-500 dark:bg-dark-700 dark:shadow-none sm:grid-cols-3 sm:gap-5 sm:divide-x sm:divide-y-0 lg:gap-6">
          <div className="p-4 text-center sm:p-5">
            <div className="mt-8">
              <FaCar className="inline size-16 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-5">
              <h4 className="text-xl font-semibold text-gray-600 dark:text-dark-100">
                Basic
              </h4>
              <p>the starter choise</p>
            </div>
            <div className="mt-5">
              <span className="text-4xl tracking-tight text-primary-600 dark:text-primary-400">
                $5
              </span>
              /month
            </div>
            <div className="mt-8 space-y-4 text-left">
              {plan1.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      item.avaliable
                        ? "bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400"
                        : "bg-warning/10 text-warning dark:bg-warning-light/10 dark:text-warning-light",
                    )}
                  >
                    {item.avaliable ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <XMarkIcon className="size-4" />
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button className="rounded-full" variant="outlined">
                <span className="text-primary-600 dark:text-primary-400">
                  Choose Plan
                </span>
              </Button>
            </div>
          </div>

          <div className="relative p-4 text-center sm:p-5">
            <div className="absolute right-0 top-0 p-3">
              <Badge color="info" className="rounded-full">
                Recommended
              </Badge>
            </div>
            <div className="mt-8">
              <FaPlane className="inline size-16 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-5">
              <h4 className="text-xl font-semibold text-gray-600 dark:text-dark-100">
                Pro
              </h4>
              <p>the starter choise</p>
            </div>
            <div className="mt-5">
              <span className="text-4xl tracking-tight text-primary-600 dark:text-primary-400">
                $15
              </span>
              /month
            </div>
            <div className="mt-8 space-y-4 text-left">
              {plan2.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      item.avaliable
                        ? "bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400"
                        : "bg-warning/10 text-warning dark:bg-warning-light/10 dark:text-warning-light",
                    )}
                  >
                    {item.avaliable ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <XMarkIcon className="size-4" />
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button className="rounded-full" color="primary">
                Choose Plan
              </Button>
            </div>
          </div>

          <div className="p-4 text-center sm:p-5">
            <div className="mt-8">
              <FaRocket className="inline size-16 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-5">
              <h4 className="text-xl font-semibold text-gray-600 dark:text-dark-100">
                Enterprice
              </h4>
              <p>the starter choise</p>
            </div>
            <div className="mt-5">
              <span className="text-4xl tracking-tight text-primary-600 dark:text-primary-400">
                $25
              </span>
              /month
            </div>
            <div className="mt-8 space-y-4 text-left">
              {plan3.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className={clsx(
                      "flex size-6 shrink-0 items-center justify-center rounded-full",
                      item.avaliable
                        ? "bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400"
                        : "bg-warning/10 text-warning dark:bg-warning-light/10 dark:text-warning-light",
                    )}
                  >
                    {item.avaliable ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <XMarkIcon className="size-4" />
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button className="rounded-full" variant="outlined">
                <span className="text-primary-600 dark:text-primary-400">
                  Choose Plan
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

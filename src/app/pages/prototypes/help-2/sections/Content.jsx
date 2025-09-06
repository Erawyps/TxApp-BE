// Import Dependencies
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
  ArrowTrendingUpIcon,
  CreditCardIcon,
  ReceiptRefundIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Card,
  Tag,
} from "components/ui";

// ----------------------------------------------------------------------

export function Content() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-5 sm:gap-5 lg:mt-6 lg:grid-cols-2 lg:gap-6">
      <Card>
        <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-dark-500 sm:px-5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary-600/10 p-1.5 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <ArrowTrendingUpIcon className="h-full w-full stroke-2" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            Getting Started
          </h4>
        </div>
        <Accordion
          defaultValue="item-1"
          className="flex flex-col divide-y divide-gray-150 px-4 dark:divide-dark-500 sm:px-5"
        >
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <AccordionItem key={i} value={"item-" + (i + 1)}>
                <AccordionButton className="flex w-full cursor-pointer items-center justify-between rounded-lg py-4 text-base font-medium text-gray-700 outline-hidden ring-primary-500/50 ring-offset-2 ring-offset-white focus-visible:ring-3 dark:text-dark-100 dark:ring-offset-dark-700">
                  {({ open }) => (
                    <>
                      <p>Question {i + 1}</p>
                      <div
                        className={clsx(
                          "text-sm font-normal leading-none text-gray-400 transition-transform duration-300 dark:text-dark-300",
                          open && "-rotate-180",
                        )}
                      >
                        <ChevronDownIcon className="size-6" />
                      </div>
                    </>
                  )}
                </AccordionButton>
                <AccordionPanel className="pb-4">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi earum magni officiis possimus repellendus.
                    Accusantium adipisci aliquid praesentium quaerat voluptate.
                  </p>
                  <div className="flex space-x-2 pt-3 ">
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 1
                    </Tag>
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 2
                    </Tag>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
        </Accordion>
      </Card>
      <Card>
        <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-dark-500 sm:px-5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary-600/10 p-1.5 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <CreditCardIcon className="h-full w-full stroke-2" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            Payment
          </h4>
        </div>
        <Accordion
          defaultValue="item-1"
          className="flex flex-col divide-y divide-gray-150 px-4 dark:divide-dark-500 sm:px-5"
        >
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <AccordionItem key={i} value={"item-" + (i + 1)}>
                <AccordionButton className="flex w-full cursor-pointer items-center justify-between rounded-lg py-4 text-base font-medium text-gray-700 outline-hidden ring-primary-500/50 ring-offset-2 ring-offset-white focus-visible:ring-3 dark:text-dark-100 dark:ring-offset-dark-700">
                  {({ open }) => (
                    <>
                      <p>Question {i + 1}</p>
                      <div
                        className={clsx(
                          "text-sm font-normal leading-none text-gray-400 transition-transform duration-300 dark:text-dark-300",
                          open && "-rotate-180",
                        )}
                      >
                        <ChevronDownIcon className="size-6" />
                      </div>
                    </>
                  )}
                </AccordionButton>
                <AccordionPanel className="pb-4">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi earum magni officiis possimus repellendus.
                    Accusantium adipisci aliquid praesentium quaerat voluptate.
                  </p>
                  <div className="flex space-x-2 pt-3 ">
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 1
                    </Tag>
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 2
                    </Tag>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
        </Accordion>
      </Card>
      <Card>
        <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-dark-500 sm:px-5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary-600/10 p-1.5 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <TruckIcon className="h-full w-full stroke-2" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            Shipping
          </h4>
        </div>
        <Accordion
          defaultValue="item-1"
          className="flex flex-col divide-y divide-gray-150 px-4 dark:divide-dark-500 sm:px-5"
        >
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <AccordionItem key={i} value={"item-" + (i + 1)}>
                <AccordionButton className="flex w-full cursor-pointer items-center justify-between rounded-lg py-4 text-base font-medium text-gray-700 outline-hidden ring-primary-500/50 ring-offset-2 ring-offset-white focus-visible:ring-3 dark:text-dark-100 dark:ring-offset-dark-700">
                  {({ open }) => (
                    <>
                      <p>Question {i + 1}</p>
                      <div
                        className={clsx(
                          "text-sm font-normal leading-none text-gray-400 transition-transform duration-300 dark:text-dark-300",
                          open && "-rotate-180",
                        )}
                      >
                        <ChevronDownIcon className="size-6" />
                      </div>
                    </>
                  )}
                </AccordionButton>
                <AccordionPanel className="pb-4">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi earum magni officiis possimus repellendus.
                    Accusantium adipisci aliquid praesentium quaerat voluptate.
                  </p>
                  <div className="flex space-x-2 pt-3 ">
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 1
                    </Tag>
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 2
                    </Tag>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
        </Accordion>
      </Card>
      <Card>
        <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-dark-500 sm:px-5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary-600/10 p-1.5 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
            <ReceiptRefundIcon className="h-full w-full stroke-2" />
          </div>
          <h4 className="text-lg font-medium text-gray-800 dark:text-dark-100">
            Refund
          </h4>
        </div>
        <Accordion
          defaultValue="item-1"
          className="flex flex-col divide-y divide-gray-150 px-4 dark:divide-dark-500 sm:px-5"
        >
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <AccordionItem key={i} value={"item-" + (i + 1)}>
                <AccordionButton className="flex w-full cursor-pointer items-center justify-between rounded-lg py-4 text-base font-medium text-gray-700 outline-hidden ring-primary-500/50 ring-offset-2 ring-offset-white focus-visible:ring-3 dark:text-dark-100 dark:ring-offset-dark-700">
                  {({ open }) => (
                    <>
                      <p>Question {i + 1}</p>
                      <div
                        className={clsx(
                          "text-sm font-normal leading-none text-gray-400 transition-transform duration-300 dark:text-dark-300",
                          open && "-rotate-180",
                        )}
                      >
                        <ChevronDownIcon className="size-6" />
                      </div>
                    </>
                  )}
                </AccordionButton>
                <AccordionPanel className="pb-4">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi earum magni officiis possimus repellendus.
                    Accusantium adipisci aliquid praesentium quaerat voluptate.
                  </p>
                  <div className="flex space-x-2 pt-3 ">
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 1
                    </Tag>
                    <Tag
                      color="primary"
                      variant="outlined"
                      className="rounded-full"
                      href="#"
                    >
                      Tag 2
                    </Tag>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
        </Accordion>
      </Card>
    </div>
  );
}

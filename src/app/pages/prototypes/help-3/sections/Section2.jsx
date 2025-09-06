// Import Dependencies
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// Local Imports
import MobileApp from "assets/illustrations/mobile-app.svg?react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Tag,
} from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------

export function Section2() {
  const { primaryColorScheme: primary } = useThemeContext();

  return (
    <div className="grid grid-cols-1 place-items-center gap-10 lg:grid-cols-2">
      <div className="flex justify-center lg:order-last">
        <MobileApp
          className="w-full max-w-xs"
          style={{ "--primary": primary[500] }}
        />
      </div>
      <div className="w-full">
        <h4 className="text-lg font-medium text-gray-800 dark:text-dark-100">
          Mobile App
        </h4>
        <Accordion
          defaultValue="item-1"
          className="mt-3 flex flex-col divide-y divide-primary-400 overflow-hidden rounded-lg border border-primary-600 dark:border-primary-500"
        >
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <AccordionItem key={i} value={"item-" + (i + 1)}>
                <AccordionButton className="flex w-full cursor-pointer items-center justify-between bg-primary-600 p-4 text-base font-medium text-white outline-hidden focus-visible:opacity-90 dark:bg-primary-500 sm:px-5">
                  {({ open }) => (
                    <>
                      <p>Accordion Item {i + 1}</p>
                      <div
                        className={clsx(
                          "text-sm font-normal leading-none text-primary-50 transition-transform duration-300",
                          open && "-rotate-180",
                        )}
                      >
                        <ChevronDownIcon className="size-6" />
                      </div>
                    </>
                  )}
                </AccordionButton>
                <AccordionPanel className="p-4 sm:px-5">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Commodi earum magni officiis possimus repellendus.
                    Accusantium adipisci aliquid praesentium quaerat voluptate.
                  </p>
                  <div className="mt-3 gap-2">
                    <Tag href="#">Tag 1</Tag>
                    <Tag href="#">Tag 2</Tag>
                  </div>
                </AccordionPanel>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}

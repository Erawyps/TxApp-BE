// Import Dependencies
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Input, Tag } from "components/ui";

// ----------------------------------------------------------------------

export function Search() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      <h2 className="mt-8 text-xl font-medium text-gray-800 dark:text-dark-100 lg:text-2xl">
        How we can help you?
      </h2>
      <Input
        classNames={{
          root: "mt-6 w-full max-w-md",
          input: "text-base h-12 rounded-full",
          prefix: "w-10!",
        }}
        placeholder="Search your question"
        prefix={<MagnifyingGlassIcon className="size-5 stroke-2" />}
      />

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span>Popular searched:</span>

        <div className="flex flex-wrap gap-1">
          <Tag href="#" color="info" variant="soft" className="rounded-full">
            Apps
          </Tag>
          <Tag href="#" color="info" variant="soft" className="rounded-full">
            Developers
          </Tag>
          <Tag href="#" color="info" variant="soft" className="rounded-full">
            Repair
          </Tag>
          <Tag href="#" color="info" variant="soft" className="rounded-full">
            Billing
          </Tag>
        </div>
      </div>
    </div>
  );
}

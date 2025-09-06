// Import Dependencies
import {
  ChatBubbleBottomCenterTextIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Button } from "components/ui";

// ----------------------------------------------------------------------

export function PostFooter() {
  return (
    <div className="mt-5 flex gap-3">
      <Button variant="outlined" className="gap-2">
        <HandThumbUpIcon className="size-4.5 text-gray-400 dark:text-dark-300" />
        <span>236</span>
      </Button>
      <Button variant="outlined" className="gap-2">
        <ChatBubbleBottomCenterTextIcon className="size-4.5 text-gray-400 dark:text-dark-300" />
        <span>641</span>
      </Button>
    </div>
  );
}

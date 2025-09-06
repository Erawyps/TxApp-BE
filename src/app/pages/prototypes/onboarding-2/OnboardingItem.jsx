// Import Dependencies
import PropTypes from "prop-types";
import { Link } from "react-router";
import clsx from "clsx";

// Local Imports
import { Box, Button } from "components/ui";

// ----------------------------------------------------------------------

export function OnboardingItem({
  title,
  Image,
  description,
  action,
  actionLabel,
  colorClasses,
}) {
  return (
    <Box
      className={clsx(
        "rounded-lg bg-linear-to-br px-5 py-6 text-center",
        colorClasses,
      )}
    >
      <h4 className="text-xl font-semibold text-white">{title}</h4>
      <p className="pt-2 text-white">{description}</p>
      <div className="px-5 py-8">
        <Image className="h-auto w-full" />
      </div>
      <Button
        unstyled
        component={Link}
        to={action}
        className="h-9 w-full rounded-lg border border-white/10 bg-white/20 text-white hover:bg-white/30 focus:bg-white/30"
      >
        {actionLabel}
      </Button>
    </Box>
  );
}

OnboardingItem.propTypes = {
  title: PropTypes.string,
  Image: PropTypes.elementType,
  description: PropTypes.string,
  action: PropTypes.string,
  actionLabel: PropTypes.string,
  colorClasses: PropTypes.string,
};

// Import Dependencies
import PropTypes from "prop-types";
import { Link } from "react-router";

// Local Imports
import { Button, Card } from "components/ui";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------

export function OnboardingItem({
  title,
  Image,
  description,
  action,
  actionLabel,
}) {
  const { primaryColorScheme: primary, darkColorScheme: dark } =
    useThemeContext();

  return (
    <Card>
      <div className="flex justify-center p-5">
        <Image
          className="h-auto w-9/12"
          style={{ "--primary": primary[500], "--darker": dark[500] }}
        />
      </div>
      <div className="px-4 pb-8 text-center sm:px-5">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
          {title}
        </h4>
        <p className="pt-3">{description}</p>
        <Button
          className="mt-8"
          color="primary"
          component={Link}
          to={action}
          isGlow
        >
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}

OnboardingItem.propTypes = {
  title: PropTypes.string,
  Image: PropTypes.elementType,
  description: PropTypes.string,
  action: PropTypes.string,
  actionLabel: PropTypes.string,
};

// Import Dependencies
import PropTypes from "prop-types";
import {
  EllipsisHorizontalIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import Chart from "react-apexcharts";

// Local Imports
import { Highlight } from "components/shared/Highlight";
import { Avatar, Button, Card } from "components/ui";
import { getChartConfig } from "./chartConfig";

// ----------------------------------------------------------------------

const socialIcons = {
  twitter: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebook,
};

export function UserCard({
  avatar,
  cover,
  color,
  socialLinks,
  chartData,
  name,
  query,
  location,
  postsCount,
}) {
  const socialButtons = Object.entries(socialLinks).map(([label, link]) => ({
    label,
    Icon: socialIcons[label],
    link,
  }));

  return (
    <Card>
      <div className="h-24 rounded-t-lg bg-primary-500">
        <img
          src={cover}
          alt="cover"
          className="h-full w-full rounded-t-lg object-cover object-center"
        />
      </div>
      <div className="px-4 py-2 sm:px-5">
        <div className="flex justify-between gap-4">
          <Avatar
            size={20}
            name={name}
            src={avatar}
            initialColor={color}
            classNames={{
              root: "-mt-12",
              display: "border-2 border-white text-2xl dark:border-dark-700",
            }}
          />
          <div className="flex gap-2">
            {socialButtons.map((item) => (
              <Button
                key={item.label}
                color="primary"
                variant="soft"
                className="size-7 rounded-full"
                isIcon
                component="a"
                href={item.link}
                aria-label={item.label}
              >
                <item.Icon className="size-4" />
              </Button>
            ))}
          </div>
        </div>
        <h3 className="pt-2 text-lg font-medium text-gray-800 dark:text-dark-100">
          <Highlight query={query}>{name}</Highlight>
        </h3>
        <p className="text-xs">
          <Highlight query={query}>{location}</Highlight>
        </p>

        <div className="flex items-center space-x-3 py-3">
          <Chart
            className="ax-transparent-gridline w-2/3"
            series={[
              {
                name: "Posts",
                data: chartData,
              },
            ]}
            height="85"
            options={getChartConfig(color)}
            type="area"
          />

          <div className="w-3/12 text-center">
            <p className="text-xl font-medium text-gray-800 dark:text-dark-100">
              {postsCount}
            </p>
            <p className="text-xs-plus">Posts</p>
          </div>
        </div>

        <div className="flex justify-center space-x-3 py-3 ">
          <Button className="size-9 rounded-full" isIcon>
            <VideoCameraIcon className="size-4.5" />
          </Button>
          <Button className="size-9 rounded-full" isIcon>
            <ChatBubbleLeftIcon className="size-4.5" />
          </Button>
          <Button className="size-9 rounded-full" isIcon>
            <EllipsisHorizontalIcon className="size-4.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

UserCard.propTypes = {
  avatar: PropTypes.string,
  cover: PropTypes.string,
  color: PropTypes.string,
  socialLinks: PropTypes.object,
  chartData: PropTypes.array,
  name: PropTypes.string,
  query: PropTypes.string,
  location: PropTypes.string,
  postsCount: PropTypes.number,
};

// Import Dependencies
import { UserIcon } from "@heroicons/react/24/outline";
import { TbPalette, TbShield, TbBell, TbSettings, TbApi, TbDatabase } from "react-icons/tb";

// Local Imports
import SettingIcon from "assets/dualicons/setting.svg?react";
import { NAV_TYPE_ITEM } from "constants/app.constant";

// ----------------------------------------------------------------------

export const settings = {
    id: 'settings',
    type: NAV_TYPE_ITEM,
    path: '/settings',
    title: 'Settings',
    transKey: 'nav.settings.settings',
    Icon: SettingIcon,
    childs: [
        {
            id: 'general',
            type: NAV_TYPE_ITEM,
            path: '/settings/general',
            title: 'General',
            transKey: 'nav.settings.general',
            Icon: UserIcon,
        },
        {
            id: 'security',
            type: NAV_TYPE_ITEM,
            path: '/settings/security',
            title: 'Security',
            transKey: 'nav.settings.security',
            Icon: TbShield,
        },
        {
            id: 'notifications',
            type: NAV_TYPE_ITEM,
            path: '/settings/notifications',
            title: 'Notifications',
            transKey: 'nav.settings.notifications',
            Icon: TbBell,
        },
        {
            id: 'preferences',
            type: NAV_TYPE_ITEM,
            path: '/settings/preferences',
            title: 'Preferences',
            transKey: 'nav.settings.preferences',
            Icon: TbSettings,
        },
        {
            id: 'integrations',
            type: NAV_TYPE_ITEM,
            path: '/settings/integrations',
            title: 'Integrations',
            transKey: 'nav.settings.integrations',
            Icon: TbApi,
        },
        {
            id: 'data',
            type: NAV_TYPE_ITEM,
            path: '/settings/data',
            title: 'Data & Backup',
            transKey: 'nav.settings.data',
            Icon: TbDatabase,
        },
        {
            id: 'appearance',
            type: NAV_TYPE_ITEM,
            path: '/settings/appearance',
            title: 'Appearance',
            transKey: 'nav.settings.appearance',
            Icon: TbPalette,
        },
    ]
}
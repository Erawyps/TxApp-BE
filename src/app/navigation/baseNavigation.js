import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import FormsIcon from 'assets/dualicons/forms.svg?react'

export const baseNavigation = [
    {
        id: 'dashboards',
        type: NAV_TYPE_ITEM,
        path: '/dashboards',
        title: 'Dashboards - Vue d\'ensemble',
        transKey: 'nav.dashboards.dashboards',
        Icon: DashboardsIcon,
    },
    {
        id: 'forms',
        type: NAV_TYPE_ITEM,
        path: '/forms/new-post-form',
        title: 'Formulaires - Créer une nouvelle feuille de route',
        transKey: 'nav.forms.forms',
        Icon: FormsIcon,
    },
]

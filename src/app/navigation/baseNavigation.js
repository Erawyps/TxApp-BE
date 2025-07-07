import { NAV_TYPE_ITEM, } from "constants/app.constant";
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import FormsIcon from 'assets/dualicons/forms.svg?react'
import TableIcon from 'assets/nav-icons/table.svg?react'

export const baseNavigation = [
    {
        id: 'dashboards',
        type: NAV_TYPE_ITEM,
        path: '/dashboards',
        title: 'Tableaux de bord',
        transKey: 'nav.dashboards.dashboards',
        Icon: DashboardsIcon,
    },
    {
        id: 'tables',
        type: NAV_TYPE_ITEM,
        path: '/tables/orders-datatable-2',
        title: 'Tables',
        transKey: 'nav.tables.tables',
        Icon: TableIcon,
    },
    {
        id: 'forms',
        type: NAV_TYPE_ITEM,
        path: '/forms/new-post-form',
        title: 'eForms - Feuilles de route',
        transKey: 'nav.forms.forms',
        Icon: FormsIcon,
    },
]

import DualTableIcon from 'assets/dualicons/table.svg?react'
import TableIcon from 'assets/nav-icons/table.svg?react'

import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_APPS = '/tables'

const path = (root, item) => `${root}${item}`;

export const tables = {
    id: 'tables',
    type: NAV_TYPE_ROOT,
    path: '/tables',
    title: 'Listes des feuilles de route',
    transKey: 'nav.tables.tables',
    Icon: DualTableIcon,
    childs: [
        {
            id: 'tables.orders-datatable-2',
            path: path(ROOT_APPS, '/orders-datatable-2'),
            type: NAV_TYPE_ITEM,
            title: 'Feuilles de route - Liste des feuilles de route',
            transKey: 'nav.tables.orders-datatable-2',
            Icon: TableIcon
        },
    ]
}

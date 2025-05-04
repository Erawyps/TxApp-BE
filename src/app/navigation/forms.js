import FormsIcon from 'assets/dualicons/forms.svg?react'
import DocumentAddIcon from 'assets/nav-icons/document-add.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_FORMS = '/forms';

const path = (root, item) => `${root}${item}`;

export const forms = {
    id: 'forms',
    type: NAV_TYPE_ROOT,
    path: 'forms',
    title: 'Formulaires - Créer une nouvelle feuille de route',
    transKey: 'nav.forms.forms',
    Icon: FormsIcon,
    childs: [
        {
            id: 'forms.new-post-form',
            type: NAV_TYPE_ITEM,
            path: path(ROOT_FORMS, '/new-post-form'),
            title: 'Formulaire - Créer une nouvelle feuille de route',
            transKey: 'nav.forms.new-post-form',
            Icon: DocumentAddIcon
        },
    ]
}

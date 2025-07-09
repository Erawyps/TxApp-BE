import FormsIcon from 'assets/dualicons/forms.svg?react'
import IdIcon from 'assets/nav-icons/id.svg?react'
import DocumentAddIcon from 'assets/nav-icons/document-add.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_FORMS = '/forms';

const path = (root, item) => `${root}${item}`;

export const forms = {
    id: 'forms',
    type: NAV_TYPE_ROOT,
    path: 'forms',
    title: 'eForms - Feuille de routes',
    //transKey: 'nav.forms.forms',
    Icon: FormsIcon,
    childs: [
        {
            id: 'forms.ekyc-form',
            type: NAV_TYPE_ITEM,
            path: path(ROOT_FORMS, '/ekyc-form'),
            title: 'eForms - Administration',
            //transKey: 'nav.forms.ekyc-form',
            Icon: IdIcon
        },
        {
            id: 'forms.new-post-form',
            type: NAV_TYPE_ITEM,
            path: path(ROOT_FORMS, '/new-post-form'),
            title: 'eForms - Chauffeur',
            //transKey: 'nav.forms.new-post-form',
            Icon: DocumentAddIcon
        },
    ]
}

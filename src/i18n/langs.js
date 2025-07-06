export const locales = {
    en: {
        label: "English",
        dayjs: () => import('dayjs/locale/en'),
        flatpickr: null,
        i18n: () => import("./locales/en/translations.json"),
        flag: 'united-kingdom'
    },
    fr_be: {
        label: "Français (Belgique)",
        dayjs: () => import('dayjs/locale/fr'),
        flatpickr: () => import("flatpickr/dist/l10n/fr").then((module) => module.French),
        i18n: () => import("./locales/fr_be/translations.json"),
        flag: 'belgium'
    },
    nl_be: {
        label: "Nederlands (België)",
        dayjs: () => import('dayjs/locale/nl-be'),
        flatpickr: () => import("flatpickr/dist/l10n/nl").then((module) => module.Dutch),
        i18n: () => import("./locales/nl_be/translations.json"),
        flag: 'belgium'
    }
}
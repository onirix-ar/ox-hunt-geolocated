import i18next from 'i18next';
import I18NextVue from 'i18next-vue';
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend';

export const i18nextPromise = i18next.use(Backend).use(LanguageDetector).init({
    fallbackLng: 'en',
    defaultNS: 'oxhunt',
    fallbackNS: 'oxhunt',
    ns: ['oxhunt'],
    load: 'languageOnly',
    debug: true,
    supportedLngs: ['en', 'fr'],
    detection: {
        // order and from where user language should be detected
        order: ["localStorage", "navigator", "htmlTag"],

        // keys or params to lookup language from
        lookupCookie: "i18next",
        lookupLocalStorage: "i18nextLng",

        // cache user language on
        caches: ["localStorage"],
        excludeCacheFor: ["cimode"], // languages to not persist (cookie, localStorage)

        // optional htmlTag with lang attribute, the default is:
        htmlTag: document.documentElement,

        // only detect languages that are in the whitelist
        checkWhitelist: true,

        // fallback to a similar whitelist language
        checkForSimilarInWhitelist: true,
    }
});

export default function (app) {
    app.use(I18NextVue, { i18next });
    return app;
}
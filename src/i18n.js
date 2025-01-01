// i18n.js
import { createI18n } from 'vue-i18n';
import { getFromLocalStorage } from '@/utilities/localStorage.js';

const language=getFromLocalStorage("Language")?{name:getFromLocalStorage("Language").name,value:getFromLocalStorage("Language").value}:{name:'English',value:'en'};

 const i18n = createI18n({
  legacy: false, // Enable composition API
  locale: language.value, // Default locale
  fallbackLocale: 'en',
  messages: {}, // Initial empty messages
});

 async function setI18nLanguage(locale) {
  const messages = await import(`./locales/${locale}.json`);
  i18n.global.setLocaleMessage(locale, messages.default);
  i18n.global.locale.value = locale;
  document.querySelector('html').setAttribute('lang', locale);
};
async function loadLocaleMessages(locale) {
    const messages = await import(`./locales/${locale}.json`);
    i18n.global.setLocaleMessage(locale, messages.default);
    return messages.default;
  };
  loadLocaleMessages(language.value);
  export { i18n, setI18nLanguage };


import '@shared/config/styles';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { setAppInstance, $confirmModal } from '@shared/utils/globals';
import { setPrimeVue } from '@shared/primevue';
import ConfirmationService from 'primevue/confirmationservice';
import router from './router/router';
import Kaannos from '@shared/plugins/kaannos';
import { Kieli } from '@shared/tyypit';
import { createI18n } from 'vue-i18n';
import fiLocale from '@shared/translations/locale-fi.json';
import svLocale from '@shared/translations/locale-sv.json';
import enLocale from '@shared/translations/locale-en.json';
import { Kielet } from '@shared/stores/kieli';
import Aikaleima from '@shared/plugins/aikaleima';
import { LoadingPlugin } from 'vue-loading-overlay';
import { createHead } from '@unhead/vue/client';
import { Oikeustarkastelu } from '@shared/plugins/oikeustarkastelu';
import { Notifikaatiot } from '@shared/plugins/notifikaatiot';
import { Kayttajat } from './stores/kayttaja';
import VueScrollTo from 'vue-scrollto';
import Vue3ApexCharts from 'vue3-apexcharts';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TekstikappaleStore } from './stores/TekstikappaleStore';
import { TutkinnonOsaStore } from './stores/TutkinnonOsaStore';
import { stores } from './stores';
import { SisaltoEditStore } from './stores/SisaltoEditStore';
import { SisaltoViiteStore } from './stores/SisaltoViiteStore';
import { RakenneStore } from './stores/RakenneStore';
import { OpintokokonaisuusStore } from './stores/OpintokokonaisuusStore';
import { registerIconColorSchemeChange } from '@shared/utils/icon';
import { vSticky } from '@shared/directives/vSticky';

const app = createApp(App);

app.directive('sticky', vSticky);

registerIconColorSchemeChange();

setAppInstance(app);
app.config.globalProperties.$confirmModal = $confirmModal;

app.use(createPinia());
app.use(router);
app.use(Kaannos);
app.use(ConfirmationService);

export const i18n = createI18n({
  legacy: false, // Set to false to use Composition API
  locale: Kieli.fi,
  fallbackLocale: Kieli.fi,
  messages: {
    fi: {
      ...fiLocale,
    },
    sv: {
      ...svLocale,
    },
    en: {
      ...enLocale,
    },
  },
});

app.use(i18n);
setPrimeVue(app);
app.use(Kielet, { i18n });
app.use(Aikaleima);
app.use(LoadingPlugin);
app.use(createHead());
app.use(Oikeustarkastelu, { oikeusProvider: Kayttajat });
app.use(Notifikaatiot);

app.use(VueScrollTo, {
  duration: 1000,
});
app.use(Vue3ApexCharts);
app.component('Apexchart', Vue3ApexCharts);

app.use(EditointiStore, { router, kayttajaProvider: Kayttajat });
app.use(TekstikappaleStore, { router, updateNavigation: () => stores.toteutussuunnitelmaStore.initNavigation() });
app.use(TutkinnonOsaStore, { router, updateNavigation: () => stores.toteutussuunnitelmaStore.initNavigation() });
app.use(SisaltoEditStore, { router, updateNavigation: () => stores.toteutussuunnitelmaStore.initNavigation() });
app.use(SisaltoViiteStore, { router, updateNavigation: () => stores.toteutussuunnitelmaStore.initNavigation() });
app.use(RakenneStore, { router, updateNavigation: () => stores.toteutussuunnitelmaStore.initNavigation() });
app.use(OpintokokonaisuusStore, { router, updateNavigation: () => stores.toteutussuunnitelmaStore.initNavigation() });

app.mount('#app');

import Vue from 'vue';
import Vuelidate from 'vuelidate';
import VueApexCharts from 'vue-apexcharts';

import App from './App.vue';
import '@shared/config/bootstrap';
import '@shared/config/styles';
import 'animate.css/animate.min.css';
import 'material-icons/iconfont/material-icons.css';
import '@shared/config/defaultcomponents';

import VueI18n from 'vue-i18n';
import VueCompositionApi from '@vue/composition-api';
import VueScrollTo from 'vue-scrollto';
import Loading from 'vue-loading-overlay';
import Notifications from 'vue-notification';
import PortalVue from 'portal-vue';

import { Oikeustarkastelu } from '@shared/plugins/oikeustarkastelu';
import Aikaleima from '@shared/plugins/aikaleima';
import { Vahvistus } from '@shared/plugins/vahvistus';
import Kaannos from '@shared/plugins/kaannos';
import { Notifikaatiot } from '@shared/plugins/notifikaatiot';
import { Kielet } from '@shared/stores/kieli';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Kayttajat } from '@/stores/kayttaja';
import { VueTutorial } from '@shared/plugins/tutoriaali';
import { tutoriaaliStore } from '@shared/stores/tutoriaali';
import { registerIconColorSchemeChange } from '@shared/utils/icon';

import router from './router';
import { getKaannokset } from '@shared/api/eperusteet';

Vue.config.productionTip = false;

Vue.use(VueI18n);
Vue.use(VueCompositionApi);
Vue.use(Vuelidate);
Vue.use(VueScrollTo);
Vue.use(Notifications);
Vue.use(PortalVue);
Vue.use(Loading, {
  fullPage: true,
  color: '#159ecb',
  loader: 'dots',
});
Vue.use(Kielet, {
  messages: {
    fi: {
      ...require('@shared/translations/locale-fi.json'),
    },
    sv: {
      ...require('@shared/translations/locale-sv.json'),
    },
  },
});

Vue.use(Kaannos);
Vue.use(Vahvistus);
Vue.use(Aikaleima);
Vue.use(Notifikaatiot);
Vue.use(Oikeustarkastelu, { oikeusProvider: Kayttajat });
Vue.use(EditointiStore, { router, kayttajaProvider: Kayttajat });
Vue.use(VueTutorial, { tutoriaaliStore });
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);

async function main() {
  registerIconColorSchemeChange();
  new Vue({
    router,
    i18n: Kielet.i18n,
    render: h => h(App),
  }).$mount('#app');

  Kielet.load(await getKaannokset('eperusteet'));
}

main();

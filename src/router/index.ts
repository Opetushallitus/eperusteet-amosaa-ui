import Vue from 'vue';
import VueRouter from 'vue-router';
import RouteVirhe from '@/views/RouteVirhe.vue';
import RouteLang from '@/views/RouteLang.vue';
import RouteRoot from '@/views/RouteRoot.vue';
import RouteEtusivu from '@/views/RouteEtusivu.vue';
import RouteUkk from '@/views/RouteUkk.vue';
import RouteToteutussuunnitelmat from '@/views/RouteToteutussuunnitelmat.vue';
import RouteYleisnakyma from '@/views/RouteYleisnakyma.vue';
import RouteToteutussuunnitelma from '@/views/RouteToteutussuunnitelma.vue';
import RouteTekstikappale from '@/views/RouteTekstikappale.vue';
import RouteTutkinnonosat from '@/views/RouteTutkinnonosat.vue';
import RouteTutkinnonosa from '@/views/RouteTutkinnonosa.vue';
import RouteSuorituspolut from '@/views/RouteSuorituspolut.vue';
import RouteSuorituspolku from '@/views/RouteSuorituspolku.vue';
import RouteJarjestys from '@/views/RouteJarjestys.vue';
import RouteToteutussuunnitelmaTiedot from '@/views/RouteToteutussuunnitelmaTiedot.vue';
import RouteToteutussuunnitelmaLuonti from '@/views/RouteToteutussuunnitelmaLuonti.vue';

import { stores } from '@/stores/index';
import { Virheet } from '@shared/stores/virheet';
import { SovellusVirhe } from '@shared/tyypit';
import { createLogger } from '@shared/utils/logger';

Vue.use(VueRouter);

const logger = createLogger('Router');

const props = (route: any) => {
  return {
    ...route.params,
    ...stores,
  };
};

const router = new VueRouter({
  routes: [{
    path: '',
    alias: '/',
    name: 'root',
    component: RouteLang,
    props,
  }, {
    path: '/:lang/koulutustoimija/:koulutustoimijaId',
    component: RouteRoot,
    props,
    children: [{
      path: 'virhe',
      name: 'virhe',
      component: RouteVirhe,
    }, {
      path: '',
      name: 'home',
      component: RouteEtusivu,
      props,
    }, {
      path: 'ukk',
      name: 'ukk',
      component: RouteUkk,
      props,
    }, {
      path: 'tilastot',
      name: 'tilastot',
      // component: ...,
      props,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      // component: ...,
      props,
    }, {
      path: 'organisaatio',
      name: 'organisaatio',
      // component: ...,
      props,
    }, {
      path: 'yhteinen',
      name: 'yhteinen',
      // component: ...,
      props,
    }, {
      path: 'paivitettavat',
      name: 'paivitettavat',
      // component: ...,
      props,
    }, {
      path: 'toteutussuunnitelmat',
      name: 'toteutussuunnitelmat',
      component: RouteToteutussuunnitelmat,
      props,
    }, {
      path: 'toteutussuunnitelmat/uusi',
      name: 'toteutussuunnitelmaLuonti',
      component: RouteToteutussuunnitelmaLuonti,
      props,
    }, {
      path: 'toteutussuunnitelma/:toteutussuunnitelmaId',
      component: RouteToteutussuunnitelma,
      props,
      children: [{
        path: '',
        name: 'toteutussuunnitelma',
        component: RouteYleisnakyma,
        props,
      }, {
        path: 'tiedot',
        name: 'toteutussuunnitelmantiedot',
        component: RouteToteutussuunnitelmaTiedot,
        props,
      }, {
        path: 'tekstikappale/:id',
        name: 'tekstikappale',
        component: RouteTekstikappale,
        props,
      }, {
        path: 'tutkinnonosat/:id',
        name: 'tutkinnonosat',
        component: RouteTutkinnonosat,
        props,
      }, {
        path: 'tutkinnonosa/:id',
        name: 'tutkinnonosa',
        component: RouteTutkinnonosa,
        props,
      }, {
        path: 'suorituspolut/:id',
        name: 'suorituspolut',
        component: RouteSuorituspolut,
        props,
      }, {
        path: 'suorituspolku/:id',
        name: 'suorituspolku',
        component: RouteSuorituspolku,
        props,
      }, {
        path: 'jarjesta',
        component: RouteJarjestys,
        name: 'jarjesta',
        props,
      }],
    }, {
      path: '*',
      redirect: (to) => {
        logger.error('Unknown route', to);
        return {
          name: 'virhe',
        };
      },
    }],
  }],
});

export default router;

Virheet.onError((virhe: SovellusVirhe) => {
  router.push({
    name: 'virhe',
  });
});

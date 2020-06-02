import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import RouteHome from '@/views/RouteHome.vue';
import RouteRoot from '@/views/RouteRoot.vue';
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
import { stores } from '@/stores/index';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [{
    path: '',
    redirect: () => '/fi',
  }, {
    path: '/',
    redirect: () => '/fi',
  }, {
    path: '/:lang/koulutustoimija/:koulutustoimijaId',
    component: RouteRoot,
    props: { ...stores },
    children: [{
      path: '',
      name: 'root',
      component: RouteHome,
      props: { ...stores },
    }, {
      path: 'ukk',
      name: 'ukk',
      component: RouteUkk,
      props: { ...stores },
    }, {
      path: 'toteutussuunnitelmat',
      name: 'toteutussuunnitelmat',
      component: RouteToteutussuunnitelmat,
      props: { ...stores },
    }, {
      path: 'toteutussuunnitelma/:toteutussuunnitelmaId',
      component: RouteToteutussuunnitelma,
      props: {
        ...stores,
      },
      children: [{
        path: '',
        name: 'toteutussuunnitelma',
        component: RouteYleisnakyma,
        props: { ...stores },
      }, {
        path: 'tekstikappale/:id',
        name: 'tekstikappale',
        component: RouteTekstikappale,
        props: { ...stores },
      }, {
        path: 'tutkinnonosat/:id',
        name: 'tutkinnonosat',
        component: RouteTutkinnonosat,
        props: { ...stores },
      }, {
        path: 'tutkinnonosa/:id',
        name: 'tutkinnonosa',
        component: RouteTutkinnonosa,
        props: { ...stores },
      }, {
        path: 'suorituspolut/:id',
        name: 'suorituspolut',
        component: RouteSuorituspolut,
        props: { ...stores },
      }, {
        path: 'suorituspolku/:id',
        name: 'suorituspolku',
        component: RouteSuorituspolku,
        props: { ...stores },
      }, {
        path: 'jarjesta',
        component: RouteJarjestys,
        name: 'jarjesta',
      }],
    }],
  }],
});

export default router;

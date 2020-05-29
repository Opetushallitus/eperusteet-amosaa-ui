import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import RouteHome from '@/views/RouteHome.vue';
import RouteRoot from '@/views/RouteRoot.vue';
import RouteUkk from '@/views/RouteUkk.vue';
import { stores } from '@/store/index';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [{
    path: '',
    redirect: () => '/fi',
  }, {
    path: '/',
    redirect: () => '/fi',
  }, {
    path: '/:lang',
    component: RouteRoot,
    props: { ...stores },
    children: [{
      path: '',
      name: 'root',
      component: RouteHome,
      props: { ...stores },
    }, {
      path: '',
      name: 'home',
      component: RouteHome,
      props: { ...stores },
    }, {
      path: 'ukk',
      name: 'ukk',
      component: RouteUkk,
      props: { ...stores },
    }],
  }],
});

export default router;

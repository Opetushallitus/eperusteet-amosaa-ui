import { createRouter, createWebHashHistory } from 'vue-router';
import EpErrorPage from '@shared/components/EpErrorPage/EpErrorPage.vue';
import RouteLang from '@/views/RouteLang.vue';
import RouteRoot from '@/views/RouteRoot.vue';
import RouteEtusivu from '@/views/RouteEtusivu.vue';
import RouteUkk from '@/views/RouteUkk.vue';
import RouteTiedotteet from '@/views/RouteTiedotteet.vue';
import RouteTiedote from '@/views/RouteTiedote.vue';
import RouteOrganisaatio from '@/views/RouteOrganisaatio.vue';
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
import RoutePdfLuonti from '@/views/RoutePdfLuonti.vue';
import RoutePaivitettavatJaSiirrettavatToteutussuunnitelmat from '@/views/RoutePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import RoutePoistetutSisallot from '@/views/RoutePoistetutSisallot.vue';
import RouteYhteiset from '@/views/RouteYhteiset.vue';
import RouteKayttooikeudet from '@/views/RouteKayttooikeudet.vue';
import RouteOpintokokonaisuus from '@/views/RouteOpintokokonaisuus.vue';
import RouteKoulutuksenOsa from '@/views/RouteKoulutuksenOsa.vue';
import RouteLaajaAlainenOsaaminen from '@/views/RouteLaajaAlainenOsaaminen.vue';
import RouteJulkaisu from '@/views/RouteJulkaisu.vue';
import RouteOpetussuunnitelmaListaus from '@/views/vst/RouteOpetussuunnitelmaListaus.vue';
import RouteOpsPohjaLuonti from '@/views/RouteOpsPohjaLuonti.vue';
import RouteOppaat from '@/views/RouteOppaat.vue';
import RouteKoulutuksenOsat from '@/views/RouteKoulutuksenOsat.vue';
import RouteKotoKielitaitotaso from '@/views/RouteKotoKielitaitotaso.vue';
import RouteKotoLaajaAlainenOsaaminen from '@/views/RouteKotoLaajaAlainenOsaaminen.vue';
import RouteKotoOpinto from '@/views/RouteKotoOpinto.vue';
import RouteOsaAlue from '@/views/RouteOsaAlue.vue';

import { stores } from '@/stores/index';
import { changeLang, convertRouteParamsToNumbers } from '@shared/utils/router';
import { TervetuloaTeksti, TervetuloaTekstiKuvaus, ToteutusTekstikappaleStore, ToteutusTiles } from '@/utils/toteutustypes';
import { Maintenance } from '@shared/api/amosaa';
import _ from 'lodash';
import RouteOsaamismerkkiKappale from '@/views/RouteOsaamismerkkiKappale.vue';
import { BrowserStore } from '@shared/stores/BrowserStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Kielet } from '@shared/stores/kieli';
import { useLoading } from 'vue-loading-overlay';
import { loadingOptions } from '@/utils/loading';

const props = (route: any) => {
  return {
    ...convertRouteParamsToNumbers(route.params),
    ...convertRouteParamsToNumbers(route.query),
    ...stores,
  };
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '',
    alias: '/',
    name: 'root',
    component: RouteLang,
    props,
  },
  {
    path: '/maintenance/julkaise/:opstyyppi',
    redirect: (to) => {
      (async () => {
        await Maintenance.teeJulkaisut(false, undefined, to.params.opstyyppi);
        console.log('Julkaisut aloitettu');
      })();
      return '/';
    },
  },
  {
    path: '/:toteutus',
    name: 'rootToteutus',
    component: RouteLang,
    props,
  }, {
    path: '/:toteutus/:lang/koulutustoimija/:koulutustoimijaId/',
    component: RouteRoot,
    props,
    children: [{
      path: 'virhe',
      name: 'virhe',
      component: EpErrorPage,
      props: {
        paluukohde: 'home',
      },
    }, {
      path: '',
      name: 'home',
      component: RouteEtusivu,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          tervetuloaTeksti: TervetuloaTeksti[route.params.toteutus],
          tervetuloaTekstiKuvaus: TervetuloaTekstiKuvaus[route.params.toteutus],
          tiles: ToteutusTiles[route.params.toteutus](stores, route.params),
        };
      },
    }, {
      path: 'ukk',
      name: 'ukk',
      component: RouteUkk,
      props,
    }, {
      path: 'tiedotteet',
      name: 'tiedotteet',
      component: RouteTiedotteet,
      props,
    }, {
      path: 'oppaat',
      name: 'oppaat',
      component: RouteOppaat,
      props,
    }, {
      path: 'tiedotteet/:tiedoteId',
      name: 'tiedote',
      component: RouteTiedote,
      props,
    }, {
      path: 'organisaatio',
      name: 'organisaatio',
      component: RouteOrganisaatio,
      props,
    }, {
      path: 'yhteinen',
      name: 'yhteinen',
      component: RouteYhteiset,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          tyypit: stores.kayttajaStore.ophSelected.value ? ['pohja'] : ['yhteinen'],
          storeProvider: stores.kayttajaStore.ophSelected.value ? stores.ophPohjatStore : stores.yhteisetOsuudetStore,
        };
      },
    }, {
      path: 'paivitettavat',
      name: 'paivitettavat',
      component: RoutePaivitettavatJaSiirrettavatToteutussuunnitelmat,
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
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opetussuunnitelmanTyyppi: 'ops',
          opetussuunnitelmanSuoritustapa: 'reformi',
          ophPohjatStore: null,
          ophOpsPohjatStore: null,
          opetussuunnitelmaPohjatStore: null,
        };
      },
    }, {
      path: 'opetussuunnitelmat/uusi',
      name: 'opetussuunnitelmaLuonti',
      component: RouteToteutussuunnitelmaLuonti,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opetussuunnitelmanTyyppi: 'ops',
          opetussuunnitelmanSuoritustapa: 'reformi',
        };
      },
    }, {
      path: 'tuvatoteutussuunnitelma/uusi',
      name: 'tuvatoteutussuunnitelmaLuonti',
      component: RouteToteutussuunnitelmaLuonti,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opetussuunnitelmanTyyppi: 'ops',
          opetussuunnitelmanSuoritustapa: 'reformi',
          ophPohjatStore: null,
          perusteetStore: null,
          opetussuunnitelmaPohjatStore: null,
        };
      },
    }, {
      path: 'jaettuosa/uusi',
      name: 'jaettuosaLuonti',
      component: RouteToteutussuunnitelmaLuonti,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opetussuunnitelmanTyyppi: 'yleinen',
          perusteetStore: null,
          ophPohjatStore: null,
          ophOpsPohjatStore: null,
          opetussuunnitelmaPohjatStore: null,
        };
      },
    }, {
      path: 'yhteinenLuonti/uusi',
      name: 'yhteinenLuonti',
      component: RouteToteutussuunnitelmaLuonti,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opetussuunnitelmanTyyppi: stores.kayttajaStore.ophSelected.value ? 'pohja' : 'yhteinen',
          perusteetStore: null,
          opetussuunnitelmaPohjatStore: null,
        };
      },
    }, {
      path: 'tunnistamisraportti/uusi',
      name: 'tunnistamisraporttiLuonti',
      component: RouteToteutussuunnitelmaLuonti,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opetussuunnitelmanTyyppi: 'tunnistamisraportti',
          opetussuunnitelmanSuoritustapa: 'reformi',
          ophPohjatStore: null,
          ophOpsPohjatStore: null,
          opetussuunnitelmaPohjatStore: null,
        };
      },
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
        path: 'tekstikappale/:sisaltoviiteId',
        name: 'tekstikappale',
        component: RouteTekstikappale,
        props: (route: any) => {
          return {
            ...route.params,
            ...stores,
            tekstikappaleStore: ToteutusTekstikappaleStore[route.params.toteutus],
          };
        },
      }, {
        path: 'tutkinnonosat',
        name: 'tutkinnonosat',
        component: RouteTutkinnonosat,
        props,
      }, {
        path: 'tutkinnonosa/:sisaltoviiteId',
        name: 'tutkinnonosa',
        component: RouteTutkinnonosa,
        props,
      }, {
        path: 'tutkinnonosa/:sisaltoviiteId/osaalue/:osaalueId',
        name: 'osaalue',
        component: RouteOsaAlue,
        props,
      }, {
        path: 'suorituspolut/:sisaltoviiteId',
        name: 'suorituspolut',
        component: RouteSuorituspolut,
        props,
      }, {
        path: 'suorituspolku/:sisaltoviiteId',
        name: 'suorituspolku',
        component: RouteSuorituspolku,
        props,
      }, {
        path: 'osasuorituspolku/:sisaltoviiteId',
        name: 'osasuorituspolku',
        component: RouteSuorituspolku,
        props,
      }, {
        path: 'opintokokonaisuus/:sisaltoviiteId',
        name: 'opintokokonaisuus',
        component: RouteOpintokokonaisuus,
        props,
      }, {
        path: 'osaamismerkkikappale/:sisaltoviiteId',
        name: 'osaamismerkkikappale',
        component: RouteOsaamismerkkiKappale,
        props,
      }, {
        path: 'koulutuksenosa/:sisaltoviiteId',
        name: 'koulutuksenosa',
        component: RouteKoulutuksenOsa,
        props,
      }, {
        path: 'laajaalainenosaaminen/:sisaltoviiteId',
        name: 'laajaalainenosaaminen',
        component: RouteLaajaAlainenOsaaminen,
        props,
      }, {
        path: 'jarjesta',
        component: RouteJarjestys,
        name: 'jarjesta',
        props,
      }, {
        path: 'dokumentti',
        name: 'pdfLuonti',
        component: RoutePdfLuonti,
        props,
      }, {
        path: 'poistetut',
        name: 'poistetutsisallot',
        component: RoutePoistetutSisallot,
        props,
      }, {
        path: 'oikeudet',
        name: 'ystava-organisaatioiden-kayttooikeudet',
        component: RouteKayttooikeudet,
        props,
      }, {
        path: 'julkaisu',
        name: 'julkaise',
        component: RouteJulkaisu,
        props,
      }, {
        path: 'koulutuksenosat/:sisaltoviiteId',
        name: 'koulutuksenosat',
        component: RouteKoulutuksenOsat,
        props,
      }, {
        path: 'kotokielitaitotaso/:sisaltoviiteId',
        name: 'koto_kielitaitotaso',
        component: RouteKotoKielitaitotaso,
        props,
      }, {
        path: 'kotolaajaalainenosaaminen/:sisaltoviiteId',
        name: 'koto_laajaalainenosaaminen',
        component: RouteKotoLaajaAlainenOsaaminen,
        props,
      }, {
        path: 'kotopinto/:sisaltoviiteId',
        name: 'koto_opinto',
        component: RouteKotoOpinto,
        props,
      },
      ] }, {
      path: 'opetussuunnitelmat',
      name: 'opetussuunnitelmaListaus',
      component: RouteOpetussuunnitelmaListaus,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opsTyyppi: 'ops',
        };
      },
    }, {
      path: 'opetussuunnitelmat/pohjat',
      name: 'opetussuunnitelmaPohjatListaus',
      component: RouteOpetussuunnitelmaListaus,
      props: (route: any) => {
        return {
          ...route.params,
          ...stores,
          opsTyyppi: 'opspohja',
        };
      },
    }, {
      path: 'opetussuunnitelmat/pohjat/uusi',
      name: 'opetussuunnitelmaPohjaLuonti',
      component: RouteOpsPohjaLuonti,
      props,
    }, {
      path: '*',
      redirect: (to) => {
        return {
          name: 'virhe',
          query: {
            virhekoodi: '404',
          },
        };
      },
    }],
  }],
});

window.addEventListener('beforeunload', e => {
  if (EditointiStore.anyEditing()) {
    e.preventDefault();
    // Vanhemmat selainversiot vaativat erillisen varmistustekstin
    e.returnValue = Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti');
  }
});

router.beforeEach((to, from, next) => {
  const hash = window.location.hash;

  if (hash.includes('%2F')) {
    const decoded = decodeURIComponent(hash).replace('//', '/');
    window.location.replace(window.location.pathname + window.location.search + decoded);
    window.location.reload();
  }
  else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (!EditointiStore.anyEditing()) {
    loader = $loading.show();
  }
  next();
});

window.addEventListener('beforeunload', e => {
  if (EditointiStore.anyEditing()) {
    e.preventDefault();
    // Vanhemmat selainversiot vaativat erillisen varmistustekstin
    e.returnValue = Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti');
  }
});

router.beforeEach((to, from, next) => {
  const hash = window.location.hash;

  if (hash.includes('%2F')) {
    const decoded = decodeURIComponent(hash).replace('//', '/');
    window.location.replace(window.location.pathname + window.location.search + decoded);
    window.location.reload();
  }
  else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (!!from.params.toteutus && !!to.params.toteutus && from.params.toteutus !== to.params.toteutus) {
    window.location.reload();
  }
  else {
    next();
  }
});

router.beforeEach(async (to, from, next) => {
  if (EditointiStore.anyEditing()) {
    const value = await router.app.$bvModal.msgBoxConfirm(
      Kielet.kaannaOlioTaiTeksti('poistumisen-varmistusteksti-dialogi'), {
        title: Kielet.kaannaOlioTaiTeksti('haluatko-poistua-tallentamatta'),
        okTitle: Kielet.kaannaOlioTaiTeksti('poistu-tallentamatta'),
        cancelTitle: Kielet.kaannaOlioTaiTeksti('peruuta'),
        size: 'lg',
      });

    if (value) {
      try {
        await EditointiStore.cancelAll();
      }
      finally {
        next();
      }
    }
  }
  else {
    next();
  }
});

router.beforeEach(async (to, from, next) => {
  const koulutustoimijaId = String(to.params.koulutustoimijaId);
  const toteutussuunntelmaId = Number(to.params.toteutussuunnitelmaId);
  const oldkoulutustoimijaId = String(from.params.koulutustoimijaId);
  const oldtoteutussuunntelmaId = Number(from.params.toteutussuunnitelmaId);
  if (!koulutustoimijaId) {
    stores.kayttajaStore.clear();
    next();
  }
  else if (koulutustoimijaId === oldkoulutustoimijaId && toteutussuunntelmaId && oldtoteutussuunntelmaId) {
    next();
  }
  else {
    try {
      stores.kayttajaStore.setKoulutustoimijaId(koulutustoimijaId);
      stores.kayttajaStore.setToteutussuunnitelmaId(toteutussuunntelmaId);
      next();
    }
    catch (err) {
      throw new Error(err as any);
    }
  }
});

const $loading = useLoading(loadingOptions);
let loader: any = null;

router.beforeEach((to, from, next) => {
  changeLang(to, from);
  next();
});

router.beforeEach((to, from, next) => {
  stores.kayttajaStore.setToteutus(to.params.toteutus);
  stores.kayttoOikeudetStore.setToteutus(to.params.toteutus);
  stores.perusteetStore.init(to.params.toteutus);
  next();
});

router.afterEach(() => {
  hideLoading();
  BrowserStore.changeLocation(location.href);
});

function hideLoading() {
  if (loader !== null) {
    (loader as any).hide();
    loader = null;
  }
}

export default router;

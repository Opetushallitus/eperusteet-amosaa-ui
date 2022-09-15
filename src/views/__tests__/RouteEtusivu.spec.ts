import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils';
import { mock } from '@shared/utils/jestutils';
import RouteEtusivu from '../RouteEtusivu.vue';
import { KieliStore } from '@shared/stores/kieli';
import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import { Toteutus } from '@shared/utils/perusteet';
import { PalautteetStore } from '@/stores/PalautteetStore';
import { KayttajaStore } from '@/stores/kayttaja';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue);

describe('RouteEtusivu tiles', () => {
  const kayttajaStore = mock(KayttajaStore);

  function mountWrapper(hasOikeus) {
    kayttajaStore.hasOikeus = jest.fn( () => {
      return hasOikeus ;
    });

    const localVue = createLocalVue();
    const koulutustoimijaId = '1';
    const kieliStore = mock(KieliStore);
    const paivitettavatJaSiirrettavatTotsStore = mock(PaivitettavatJaSiirrettavatTotsStore);
    const palautteetStore = mock(PalautteetStore);
    const tervetuloaTeksti = 'tervetuloaTeksti';
    const tervetuloaTekstiKuvaus = 'tervetuloaTekstiKuvaus';
    const toteutus = Toteutus.AMMATILLINEN;
    const tiles = [
      {
        props: {
          text: "test-tile-1"
        },
      },
      {
        props: {
          text: "test-tile-2"
        },
        oikeustarkastelu: {
          oikeus: "luku"
        }
      },
      {
        props: {
          text: "test-tile-3"
        },
        oikeustarkastelu: {
          oikeus: "hallinta"
        }
      },
    ];
    return mount(RouteEtusivu, {
      localVue,
      mocks: {
        $t: x => x,
      },
      propsData: {
        koulutustoimijaId,
        kayttajaStore,
        kieliStore,
        paivitettavatJaSiirrettavatTotsStore,
        toteutus,
        tervetuloaTeksti,
        tervetuloaTekstiKuvaus,
        tiles,
        palautteetStore,
      },
      stubs: {
        Portal: '<div />',
        RouterLink: RouterLinkStub,
      },
    });
  }

  test('Should filter and return tiles based on if tile has oikeudet or oikeudet not required', async () => {
    const wrapper = mountWrapper(true);
    expect((wrapper.vm as any).tilesFiltered).toHaveLength(3);
    expect(kayttajaStore.hasOikeus).toHaveBeenCalledTimes(2);
  });

  test('Should filter and return tiles based on if oikeudet not required', async () => {
    const wrapper = mountWrapper(false);
    expect((wrapper.vm as any).tilesFiltered).toHaveLength(1);
    expect(kayttajaStore.hasOikeus).toHaveBeenCalledTimes(2);
  });
});

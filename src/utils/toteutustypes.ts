import TileToteutussuunnitelmat from '@/views/tiles/TileToteutussuunnitelmat.vue';
import TileKoulutustoimijanYhteinenOsuus from '@/views/tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from '@/views/tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from '@/views/tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from '@/views/tiles/TileTiedotteet.vue';
import TileUkk from '@/views/tiles/TileUkk.vue';
import TileTilastot from '@/views/tiles/TileTilastot.vue';
import { KieliStore } from '@shared/stores/kieli';
import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import TileVstToteutussuunnitelmat from '@/views/vst/TileVstToteutussuunnitelmat.vue';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';

enum Toteutus {
  VAPAASIVISTYSTYO = 'vapaasivistystyo',
  AMMATILLINEN = 'ammatillinen',
}

export const TervetuloaTeksti = {
  [Toteutus.VAPAASIVISTYSTYO]: 'amosaa-vst-tervetuloa',
  [Toteutus.AMMATILLINEN]: 'amosaa-tervetuloa',
};

export const TervetuloaTekstiKuvaus = {
  [Toteutus.VAPAASIVISTYSTYO]: 'amosaa-vst-tervetuloa-kuvaus',
  [Toteutus.AMMATILLINEN]: 'amosaa-tervetuloa-kuvaus',
};

export const ammatillinenTiles = (stores, { koulutustoimijaId, toteutus }) => {
  return [
    {
      component: TileToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    },
    {
      component: TileKoulutustoimijanYhteinenOsuus,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    },
    {
      component: TilePaivitettavatJaSiirrettavatToteutussuunnitelmat,
      props: {
        paivitettavatJaSiirrettavatTotsStore: stores.paivitettavatJaSiirrettavatTotsStore,
        koulutustoimijaId,
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileOrganisaationHallinta,
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileTiedotteet,
      props: {
        kieli: stores.kieliStore.getSisaltoKieli.value || null,
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileUkk,
    },
    {
      component: TileTilastot,
      oikeustarkastelu: {
        oikeus: 'hallinta',
        kohde: 'oph',
      },
    },
  ];
};

const vapaasivistystyoTiles = (stores, { koulutustoimijaId, toteutus }) => {
  return [
    {
      component: TileVstToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    },
  ];
};

export const ToteutusTiles = {
  [Toteutus.VAPAASIVISTYSTYO]: vapaasivistystyoTiles,
  [Toteutus.AMMATILLINEN]: ammatillinenTiles,
};

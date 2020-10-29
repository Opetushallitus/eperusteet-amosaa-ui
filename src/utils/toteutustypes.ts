import TileToteutussuunnitelmat from '@/views/tiles/TileToteutussuunnitelmat.vue';
import TileKoulutustoimijanYhteinenOsuus from '@/views/tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from '@/views/tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from '@/views/tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from '@/views/tiles/TileTiedotteet.vue';
import TileUkk from '@/views/tiles/TileUkk.vue';
import TileTilastot from '@/views/tiles/TileTilastot.vue';

export enum Toteutus {
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

export const OpetussuunnitelmaTyyppi = {
  [Toteutus.VAPAASIVISTYSTYO]: 'opetussuunnitelma',
  [Toteutus.AMMATILLINEN]: 'toteutussuunnitelma',
};

export const ammatillinenTiles = (stores, { koulutustoimijaId, toteutus }) => {
  return [
    {
      component: TileToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        title: 'toteutussuunnitelmat',
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
      props: {
        text: 'amosaa-ukk-kuvaus',
      },
    },
    {
      component: TileTilastot,
      props: {
        text: 'amosaa-tilastot-kuvaus',
      },
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
      component: TileToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        headerStyle: { 'background': 'linear-gradient(180deg, #9B4E27  0%, #993300 100%)' },
        title: 'opetussuunnitelmat',
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    },
    {
      component: TileTiedotteet,
      props: {
        kieli: stores.kieliStore.getSisaltoKieli.value || null,
        headerStyle: { 'background': 'linear-gradient(180deg, #9B4E27  0%, #993300 100%)' },
        julkaisupaikka: TiedoteJulkaisupaikka[toteutus],
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileOrganisaationHallinta,
      props: {
        headerStyle: { 'background': 'linear-gradient(180deg, #9B4E27  0%, #993300 100%)' },
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileUkk,
      props: {
        text: 'amosaa-vst-ukk-kuvaus',
        headerStyle: { 'background': 'linear-gradient(180deg, #9B4E27  0%, #993300 100%)' },
      },
    },
    {
      component: TileTilastot,
      props: {
        headerStyle: { 'background': 'linear-gradient(180deg, #9B4E27  0%, #993300 100%)' },
        text: 'amosaa-vst-tilastot-kuvaus',
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
        kohde: 'oph',
      },
    },
  ];
};
export const YleisnakymaSisaltoviitteTiedot = {
  [Toteutus.AMMATILLINEN]: {
    title: 'tutkinnon-osat-ja-suorituspolut',
    sisaltoviitetyypit: ['tutkinnonosa', 'paikallinentutkinnonosa', 'suorituspolku', 'osasuorituspolku'],
  },
  [Toteutus.VAPAASIVISTYSTYO]: {
    title: 'rakenne',
    sisaltoviitetyypit: ['tekstikappale', 'opintokokonaisuus'],
  },
};

export const ToteutussuunnitelmaTiedotKielistykset = {
  [Toteutus.AMMATILLINEN]: {
    title: 'toteutussuunnitelman-tiedot',
    nimi: 'toteutussuunnitelman-nimi',
  },
  [Toteutus.VAPAASIVISTYSTYO]: {
    title: 'opetussuunnitelman-tiedot',
    nimi: 'opetussuunnitelman-nimi',
  },
};

export const ToteutusTiles = {
  [Toteutus.VAPAASIVISTYSTYO]: vapaasivistystyoTiles,
  [Toteutus.AMMATILLINEN]: ammatillinenTiles,
};

export const TiedoteJulkaisupaikka = {
  [Toteutus.VAPAASIVISTYSTYO]: 'vst',
  [Toteutus.AMMATILLINEN]: 'amosaa',
};

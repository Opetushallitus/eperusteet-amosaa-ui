import TileToteutussuunnitelmat from '@/views/tiles/TileToteutussuunnitelmat.vue';
import TileOpetussuunnitelmaPohjat from '@/views/tiles/TileOpetussuunnitelmaPohjat.vue';
import TileKoulutustoimijanYhteinenOsuus from '@/views/tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from '@/views/tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from '@/views/tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from '@/views/tiles/TileTiedotteet.vue';
import TileUkk from '@/views/tiles/TileUkk.vue';
import TileTilastot from '@/views/tiles/TileTilastot.vue';
import { tileColors } from '@shared/utils/bannerIcons';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';

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
  [OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA]: 'pohja',
};

export const OpetussuunnitelmaOppilaitostyyppi = {
  [Toteutus.VAPAASIVISTYSTYO]: true,
  [Toteutus.AMMATILLINEN]: false,
};

export const TileBackground = {
  [Toteutus.VAPAASIVISTYSTYO]: { 'background': 'linear-gradient(180deg, ' + tileColors[Toteutus.VAPAASIVISTYSTYO][0] + ' 0%, ' + tileColors[Toteutus.VAPAASIVISTYSTYO][1] + ' 100%)' },
};

export const ammatillinenTiles = (stores, { koulutustoimijaId, toteutus }) => {
  return [
    ...(stores.kayttajaStore.ophSelected.value ? [] : [{
      component: TileToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        title: stores.kayttajaStore.koulutustoimija.value.organisaatioRyhma ? 'oppimisympariston-tunnistamisraportit' : 'toteutussuunnitelmat',
        route: 'toteutussuunnitelmat',
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    }]),
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
    ...(stores.kayttajaStore.ophSelected.value ? [] : [{
      component: TileToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        headerStyle: TileBackground[toteutus],
        title: 'opetussuunnitelmat',
        route: 'opetussuunnitelmaListaus',
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    }]),
    {
      component: TileOpetussuunnitelmaPohjat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        headerStyle: TileBackground[toteutus],
        title: 'opetussuunnitelmien-pohjat',
        route: 'opetussuunnitelmaPohjatListaus',
      },
      oikeustarkastelu: {
        oikeus: 'luku',
      },
    },
    {
      component: TileTiedotteet,
      props: {
        kieli: stores.kieliStore.getSisaltoKieli.value || null,
        headerStyle: TileBackground[toteutus],
        julkaisupaikka: TiedoteJulkaisupaikka[toteutus],
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileOrganisaationHallinta,
      props: {
        headerStyle: TileBackground[toteutus],
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    },
    {
      component: TileUkk,
      props: {
        text: 'amosaa-vst-ukk-kuvaus',
        headerStyle: TileBackground[toteutus],
      },
    },
    {
      component: TileTilastot,
      props: {
        headerStyle: TileBackground[toteutus],
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
    perustetyyppi: 'tutkinto',
    salliEsikatselu: 'salli-toteutussuunnitelman-esikatselu',
    esikatselu: 'esikatsele-toteutussuunnitelmaa',
  },
  [Toteutus.VAPAASIVISTYSTYO]: {
    title: 'opetussuunnitelman-tiedot',
    nimi: 'opetussuunnitelman-nimi',
    perustetyyppi: 'peruste',
    salliEsikatselu: 'salli-opetussuunnitelman-esikatselu',
    esikatselu: 'esikatsele-opetussuunnitelmaa',
  },
  [OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA]: {
    title: 'pohjan-tiedot',
    nimi: 'pohjan-nimi',
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

export const ArkistointiTekstit = {
  arkistointi: {
    [OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA]: {
      text: 'arkistoi-pohja',
      meta: {
        title: 'arkistoi-pohja',
        confirm: 'arkistoi-pohja-vahvistus',
        tila: 'POISTETTU',
        reroute: 'opetussuunnitelmaPohjatListaus',
      },
    },
    [Toteutus.VAPAASIVISTYSTYO]: {
      text: 'arkistoi-opetussuunnitelma',
      meta: {
        title: 'arkistoi-opetussuunnitelma',
        confirm: 'arkistoi-opetussuunnitelma-vahvistus',
        tila: 'POISTETTU',
        reroute: 'opetussuunnitelmaListaus',
      },
    },
    [Toteutus.AMMATILLINEN]:
    {
      text: 'arkistoi-toteutussuunnitelma',
      meta: {
        title: 'arkistoi-toteutussuunnitelma',
        confirm: 'arkistoi-toteutussuunnitelma-vahvistus',
        tila: 'POISTETTU',
        reroute: 'toteutussuunnitelmat',
      },
    },
  },
  palautus: {
    [OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA]: {
      text: 'palauta-pohja',
      meta: {
        title: 'palauta-pohja',
        confirm: 'palauta-pohja-vahvistus',
        tila: 'LUONNOS',
      },
    },
    [Toteutus.VAPAASIVISTYSTYO]: {
      text: 'palauta-ops',
      meta: {
        title: 'palauta-ops',
        confirm: 'palauta-opetussuunnitelma-vahvistus',
        tila: 'LUONNOS',
      },
    },
    [Toteutus.AMMATILLINEN]:
    {
      text: 'palauta-toteutussuunnitelma',
      meta: {
        title: 'palauta-toteutussuunnitelma',
        confirm: 'palauta-toteutussuunnitelma-vahvistus',
        tila: 'LUONNOS',
      },
    },
  },
};

export const JulkaisuKielistykset = {
  [Toteutus.VAPAASIVISTYSTYO]: {
    julkaisuBtn: 'julkaise-opetussuunnitelma',
    julkaisuOnnistui: 'opetussuunnitelma-julkaistu',
    esikatselu: 'esikatsele-opetussuunnitelmaa',
  },
  [Toteutus.AMMATILLINEN]: {
    julkaisuBtn: 'julkaise-toteutussuunnitelma',
    julkaisuOnnistui: 'toteutussuunnitelma-julkaistu',
    esikatselu: 'esikatsele-toteutussuunnitelmaa',
  },
};

export const ToteutussuunnitelmaSiirtoKielistykset = {
  [Toteutus.VAPAASIVISTYSTYO]: {
    siirratoteutusystavaorganisaatiolle: 'siirra-opetussuunnitelma-ystavaorganisaatiolle',
    siirratoteutus: 'siirra-opetussuunnitelma',
  },
  [Toteutus.AMMATILLINEN]: {
    siirratoteutusystavaorganisaatiolle: 'siirra-toteutussuunnitelma-ystavaorganisaatiolle',
    siirratoteutus: 'siirra-toteutussuunnitelma',
  },
};

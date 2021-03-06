import TileToteutussuunnitelmat from '@/views/tiles/TileToteutussuunnitelmat.vue';
import TileOpetussuunnitelmaPohjat from '@/views/tiles/TileOpetussuunnitelmaPohjat.vue';
import TileKoulutustoimijanYhteinenOsuus from '@/views/tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from '@/views/tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from '@/views/tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from '@/views/tiles/TileTiedotteet.vue';
import TileUkk from '@/views/tiles/TileUkk.vue';
import TileTilastot from '@/views/tiles/TileTilastot.vue';
import TileOppaat from '@/views/tiles/TileOppaat.vue';

import { tileColors } from '@shared/utils/bannerIcons';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { EperusteetPalautekanava, Koulutustyyppi } from '@shared/tyypit';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { TuvaTekstikappaleStore } from '@/stores/TuvaTekstikappaleStore';

export enum Toteutus {
  VAPAASIVISTYSTYO = 'vapaasivistystyo',
  AMMATILLINEN = 'ammatillinen',
  TUTKINTOONVALMENTAVA = 'tutkintoonvalmentava',
};

export const ToteutuksenKoulutustyypit = {
  [Toteutus.VAPAASIVISTYSTYO]: EperusteetKoulutustyyppiRyhmat.vapaasivistystyo,
  [Toteutus.AMMATILLINEN]: EperusteetKoulutustyyppiRyhmat.ammatillinen,
  [Toteutus.TUTKINTOONVALMENTAVA]: EperusteetKoulutustyyppiRyhmat.tutkintoonvalmentava,
};

export const ToteutusSovellus = {
  [Toteutus.VAPAASIVISTYSTYO]: 'APP_EPERUSTEET_VST',
  [Toteutus.AMMATILLINEN]: 'APP_EPERUSTEET_AMOSAA',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'APP_EPERUSTEET_TUVA',
};

export const SovellusTitle = {
  [Toteutus.VAPAASIVISTYSTYO]: 'eperusteet-vst',
  [Toteutus.AMMATILLINEN]: 'eperusteet-amosaa',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'eperusteet-tuva',
};

export const TervetuloaTeksti = {
  [Toteutus.VAPAASIVISTYSTYO]: 'amosaa-vst-tervetuloa',
  [Toteutus.AMMATILLINEN]: 'amosaa-tervetuloa',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'amosaa-tuva-tervetuloa',
};

export const TervetuloaTekstiKuvaus = {
  [Toteutus.VAPAASIVISTYSTYO]: 'amosaa-vst-tervetuloa-kuvaus',
  [Toteutus.AMMATILLINEN]: 'amosaa-tervetuloa-kuvaus',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'amosaa-tuva-tervetuloa-kuvaus',
};

export const OpetussuunnitelmaTyyppi = {
  [Toteutus.VAPAASIVISTYSTYO]: 'opetussuunnitelma',
  [Toteutus.AMMATILLINEN]: 'toteutussuunnitelma',
  [OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA]: 'pohja',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'toteutussuunnitelma',
};

export const OpetussuunnitelmaOppilaitostyyppi = {
  [Toteutus.VAPAASIVISTYSTYO]: true,
  [Toteutus.AMMATILLINEN]: false,
  [Toteutus.TUTKINTOONVALMENTAVA]: false,
};

export const Tutkintorakennepalaute = {
  [Toteutus.VAPAASIVISTYSTYO]: false,
  [Toteutus.AMMATILLINEN]: true,
  [Toteutus.TUTKINTOONVALMENTAVA]: false,
};

export const PalauteKey = {
  [Toteutus.VAPAASIVISTYSTYO]: EperusteetPalautekanava.vst,
  [Toteutus.AMMATILLINEN]: EperusteetPalautekanava.amosaa,
  [Toteutus.TUTKINTOONVALMENTAVA]: EperusteetPalautekanava.tuva,
};

export const TileBackground = {
  [Toteutus.VAPAASIVISTYSTYO]: { 'background': 'linear-gradient(180deg, ' + tileColors[Toteutus.VAPAASIVISTYSTYO][0] + ' 0%, ' + tileColors[Toteutus.VAPAASIVISTYSTYO][1] + ' 100%)' },
  [Toteutus.TUTKINTOONVALMENTAVA]: { 'background': 'linear-gradient(180deg, ' + tileColors[Toteutus.TUTKINTOONVALMENTAVA][0] + ' 0%, ' + tileColors[Toteutus.TUTKINTOONVALMENTAVA][1] + ' 100%)' },
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
      component: TileOppaat,
      oikeustarkastelu: {
        oikeus: 'luku',
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
        kaannokset: {
          otsikko: 'opetussuunnitelmat',
          kuvaus: 'opetussuunnitelmat-kuvaus',
          arkistoidut: 'arkistoidut-opetussuunnitelmat',
          etsi: 'etsi-opetussuunnitelmia',
          keskeneraiset: 'keskeneraiset-opetussuunnitelmat',
          julkaistut: 'julkaistut-opetussuunnitelmat',
          eiJulkaistuja: 'ei-julkaistuja-opetussuunnitelmia',
          uusiRoute: 'opetussuunnitelmaLuonti',
          julkaisuTila: 'julkaistu',
        },
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
        oikeus: 'luku',
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
      component: TileOppaat,
      oikeustarkastelu: {
        oikeus: 'luku',
      },
      props: {
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

const tutkintoonvalmentavatiles = (stores, { koulutustoimijaId, toteutus }) => {
  return [
    ...(stores.kayttajaStore.ophSelected.value ? [] : [{
      component: TileToteutussuunnitelmat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        headerStyle: TileBackground[toteutus],
        title: 'toteutussuunnitelmat',
        route: 'opetussuunnitelmaListaus',
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    }]),
    ...(stores.kayttajaStore.ophSelected.value ? [{
      component: TileOpetussuunnitelmaPohjat,
      props: {
        kayttajaStore: stores.kayttajaStore,
        koulutustoimijaId,
        toteutus,
        headerStyle: TileBackground[toteutus],
        title: 'toteutussuunnitelmien-pohjat',
        route: 'opetussuunnitelmaPohjatListaus',
      },
      oikeustarkastelu: {
        oikeus: 'hallinta',
      },
    }] : []),
    {
      component: TileTiedotteet,
      props: {
        kieli: stores.kieliStore.getSisaltoKieli.value || null,
        headerStyle: TileBackground[toteutus],
        julkaisupaikka: TiedoteJulkaisupaikka[toteutus],
      },
      oikeustarkastelu: {
        oikeus: 'luku',
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
        text: 'amosaa-tuva-ukk-kuvaus',
        headerStyle: TileBackground[toteutus],
      },
    },
    {
      component: TileOppaat,
      oikeustarkastelu: {
        oikeus: 'luku',
      },
      props: {
        headerStyle: TileBackground[toteutus],
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
  [Toteutus.TUTKINTOONVALMENTAVA]: {
    title: 'rakenne',
    sisaltoviitetyypit: ['tekstikappale', 'koulutuksenosa'],
  },
};

export const ToteutussuunnitelmaTiedotKielistykset = {
  [Toteutus.AMMATILLINEN]: {
    title: 'toteutussuunnitelman-tiedot',
    nimi: 'toteutussuunnitelman-nimi',
    perustetyyppi: 'tutkinto',
    salliEsikatselu: 'salli-toteutussuunnitelman-esikatselu',
    esikatselu: 'esikatsele-toteutussuunnitelmaa',
    tiivistelma: 'tutkinnon-suorittaneen-osaaminen',
  },
  [Toteutus.VAPAASIVISTYSTYO]: {
    title: 'opetussuunnitelman-tiedot',
    nimi: 'opetussuunnitelman-nimi',
    perustetyyppi: 'peruste',
    salliEsikatselu: 'salli-opetussuunnitelman-esikatselu',
    esikatselu: 'esikatsele-opetussuunnitelmaa',
    tiivistelma: 'opetussuunnitelma-tiivistelma',
  },
  [OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA]: {
    title: 'pohjan-tiedot',
    nimi: 'pohjan-nimi',
  },
  [Toteutus.TUTKINTOONVALMENTAVA]: {
    title: 'toteutussuunnitelman-tiedot',
    nimi: 'toteutussuunnitelman-nimi',
    perustetyyppi: 'peruste',
    salliEsikatselu: 'salli-toteutussuunnitelman-esikatselu',
    esikatselu: 'esikatsele-toteutussuunnitelmaa',
    tiivistelma: 'tutkinnon-suorittaneen-osaaminen',
  },
};

export const ToteutusTiles = {
  [Toteutus.VAPAASIVISTYSTYO]: vapaasivistystyoTiles,
  [Toteutus.AMMATILLINEN]: ammatillinenTiles,
  [Toteutus.TUTKINTOONVALMENTAVA]: tutkintoonvalmentavatiles,
};

export const TiedoteJulkaisupaikka = {
  [Toteutus.VAPAASIVISTYSTYO]: 'vst',
  [Toteutus.AMMATILLINEN]: 'amosaa',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'tuva',
};

export const ToteutusTekstikappaleStore = {
  [Toteutus.VAPAASIVISTYSTYO]: new TekstikappaleStore(),
  [Toteutus.AMMATILLINEN]: new TekstikappaleStore(),
  [Toteutus.TUTKINTOONVALMENTAVA]: new TuvaTekstikappaleStore(),
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
    [Toteutus.TUTKINTOONVALMENTAVA]:
    {
      text: 'arkistoi-toteutussuunnitelma',
      meta: {
        title: 'arkistoi-toteutussuunnitelma',
        confirm: 'arkistoi-toteutussuunnitelma-vahvistus',
        tila: 'POISTETTU',
        reroute: 'opetussuunnitelmaListaus',
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
    [Toteutus.TUTKINTOONVALMENTAVA]:
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

export const OpetussuunnitelmalistausKielistykset = {
  [Toteutus.VAPAASIVISTYSTYO]: {
    ops: {
      otsikko: 'opetussuunnitelmat',
      kuvaus: 'opetussuunnitelmat-kuvaus',
      arkistoidut: 'arkistoidut-opetussuunnitelmat',
      etsi: 'etsi-opetussuunnitelmia',
      keskeneraiset: 'keskeneraiset-opetussuunnitelmat',
      julkaistut: 'julkaistut-opetussuunnitelmat',
      eiJulkaistuja: 'ei-julkaistuja-opetussuunnitelmia',
      uusiRoute: 'opetussuunnitelmaLuonti',
      julkaisuTila: 'julkaistu',
    },
    opspohja: {
      otsikko: 'pohjat',
      kuvaus: 'pohjat-kuvaus',
      arkistoidut: 'arkistoidut-pohjat',
      etsi: 'etsi',
      keskeneraiset: 'keskeneraiset-pohjat',
      julkaistut: 'valmiit-pohjat',
      eiJulkaistuja: 'ei-valmiita-pohjia',
      uusiRoute: 'opetussuunnitelmaPohjaLuonti',
      julkaisuTila: 'valmis',
    },
  },
  [Toteutus.TUTKINTOONVALMENTAVA]: {
    ops: {
      otsikko: 'toteutussuunnitelmat',
      kuvaus: 'toteutussuunnitelmat-kuvaus',
      arkistoidut: 'arkistoidut-toteutussuunnitelmat',
      etsi: 'etsi-toteutussuunnitelmia',
      keskeneraiset: 'keskeneraiset-toteutussuunnitelmat',
      julkaistut: 'julkaistut-toteutussuunnitelmat',
      eiJulkaistuja: 'ei-julkaistuja-toteutussuunnitelmia',
      uusiRoute: 'tuvatoteutussuunnitelmaLuonti',
      julkaisuTila: 'julkaistu',
    },
    opspohja: {
      otsikko: 'toteutussuunnitelmien-pohjat',
      kuvaus: 'toteutussuunnitelmien-pohjat-kuvaus',
      arkistoidut: 'arkistoidut-pohjat',
      etsi: 'etsi',
      keskeneraiset: 'keskeneraiset-pohjat',
      julkaistut: 'valmiit-pohjat',
      eiJulkaistuja: 'ei-valmiita-pohjia',
      uusiRoute: 'opetussuunnitelmaPohjaLuonti',
      julkaisuTila: 'valmis',
    },
  },
};

export const OpetussuunnitelmaLuontiKielistykset = {
  [Toteutus.VAPAASIVISTYSTYO]: {
    stepName: 'luo-uusi-opetussuunnitelma',
    peruste: {
      pohjaLabel: 'perusteprojekti',
      pohjaValintaPlaceHolder: 'valitse',
    },
    opsPohja: {
      pohjaLabel: 'opetussuunnitelman-pohja',
      pohjaValintaPlaceHolder: 'valitse',
    },
    toteutussuunnitelma: {
      pohjaLabel: 'toinen-opetussuunnitelma',
      pohjaValintaPlaceHolder: 'valitse',
    },
    nimiLabel: 'opetussuunnitelman-nimi',
    luoLabel: 'luo-opetussuunnitelma',
    radioButtons: [
      {
        value: 'peruste',
        text: 'perusteprojektia',
      },
      {
        value: 'opsPohja',
        text: 'opetussuunnitelman-pohjaa',
      },
      {
        value: 'toteutussuunnitelma',
        text: 'toista-opetussuunnitelmaa',
      },
      {
        value: 'pohjaton',
        text: 'luo-uusi-ilman-pohjaa',
      },
    ],
  },
  [Toteutus.TUTKINTOONVALMENTAVA]: {
    stepName: 'luo-uusi-toteutussuunnitelma',
    opsPohja: {
      pohjaLabel: 'oletuspohja',
      pohjaValintaPlaceHolder: 'valitse',
    },
    toteutussuunnitelma: {
      pohjaLabel: 'toteutussuunnitelma',
      pohjaValintaPlaceHolder: 'valitse',
    },
    nimiLabel: 'toteutussuunnitelman-nimi',
    luoLabel: 'luo-toteutussuunnitelma',
    radioButtons: [
      {
        value: 'opsPohja',
        text: 'oletuspohjaa',
      },
      {
        value: 'toteutussuunnitelma',
        text: 'toista-toteutussuunnitelmaa',
      },
    ],
  },
  [Toteutus.AMMATILLINEN]: {
    stepName: 'uusi-toteutussuunnitelma',
    peruste: {
      pohjaLabel: 'toteutussuunnitelman-pohja',
      pohjaValintaPlaceHolder: 'valitse-perusteprojekti',
    },
    toteutussuunnitelma: {
      pohjaLabel: 'toteutussuunnitelman-pohja',
      pohjaValintaPlaceHolder: 'valitse-toteutussuunnitelma',
    },
    nimiLabel: 'toteutussuunnitelman-nimi',
    luoLabel: 'luo-toteutussuunnitelma',
    radioButtons: [
      {
        value: 'peruste',
        text: 'perusteprojektia',
      },
      {
        value: 'toteutussuunnitelma',
        text: 'toista-toteutussuunnitelmaa',
      },
    ],
  },
};

export const OpetussuunnitelmaPohjaLuontiStepSetups = {
  [Toteutus.VAPAASIVISTYSTYO]: {
    stepName: 'luo-uusi-pohja',
    nimi: 'pohjan-nimi',
    perustevalinta: false,
    koulutustyyppi: Koulutustyyppi.vapaasivistystyo,
  },
  [Toteutus.TUTKINTOONVALMENTAVA]: {
    stepName: 'luo-uusi-pohja',
    nimi: 'pohjan-nimi',
    perustevalinta: true,
    koulutustyyppi: Koulutustyyppi.tutkintoonvalmentava,
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
  [Toteutus.TUTKINTOONVALMENTAVA]: {
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
  [Toteutus.TUTKINTOONVALMENTAVA]: {
    siirratoteutusystavaorganisaatiolle: 'siirra-toteutussuunnitelma-ystavaorganisaatiolle',
    siirratoteutus: 'siirra-toteutussuunnitelma',
  },
};

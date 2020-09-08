import _ from 'lodash';
import Vue from 'vue';
import { KayttajaApi, Koulutustoimijat, EtusivuDto, KoulutustoimijaBaseDto, Kayttajaoikeudet } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { IOikeusProvider } from '@shared/plugins/oikeustarkastelu';
import { getItem } from '@shared/utils/localstorage';

Vue.use(VueCompositionApi);

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export interface KoulutustoimijaOikeudet {[key: string]: Oikeus};
export interface ToteutussuunnitelmaOikeudet {[key: number]: Oikeus};
export interface OikeusKohde {koulutustoimijaId: string, toteutussuunnitelmaId?: number};

function getOikeusArvo(oikeus: Oikeus) {
  switch (oikeus) {
  case 'luku': return 1;
  case 'kommentointi': return 2;
  case 'muokkaus': return 3;
  case 'luonti': return 4;
  case 'poisto': return 5;
  case 'tilanvaihto': return 6;
  case 'hallinta': return 7;
  default: return 0;
  }
}

export function parsiEsitysnimi(tiedot: any): string {
  if (tiedot.kutsumanimi && tiedot.sukunimi) {
    return tiedot.kutsumanimi + ' ' + tiedot.sukunimi;
  }
  else {
    return tiedot.oid as string;
  }
}

const logger = createLogger('Kayttaja');

export class KayttajaStore implements IOikeusProvider {
  public state = reactive({
    organisaatiot: [] as any[],
    tiedot: {} as any,
    virkailijat: [] as any[],
    organisaatioOikeudet: {} as KoulutustoimijaOikeudet,
    toteutussuunnitelmaOikeudet: {} as ToteutussuunnitelmaOikeudet,
    etusivu: null as EtusivuDto | null,
    koulutustoimijat: null as KoulutustoimijaBaseDto[] | null,
  });

  public readonly etusivu = computed(() => this.state.etusivu);
  public readonly organisaatiot = computed(() => this.state.organisaatiot);
  public readonly tiedot = computed(() => this.state.tiedot);
  public readonly userOid = computed(() => this.state.tiedot.oidHenkilo);
  public readonly virkailijat = computed(() => this.state.virkailijat);
  public readonly organisaatioOikeudet = computed(() => this.state.organisaatioOikeudet);
  public readonly toteutussuunnitelmaOikeudet = computed(() => this.state.toteutussuunnitelmaOikeudet);
  public readonly nimi = computed(() => parsiEsitysnimi(this.state.tiedot));
  public readonly isAdmin = computed(() => _.includes(this.state.tiedot?.oikeudet || [], 'ROLE_EPERUSTEET_ADMIN'));
  public readonly koulutustoimijat = computed(() => this.state.koulutustoimijat);

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.state.tiedot = (await KayttajaApi.getKayttaja()).data;
      await KayttajaApi.updateKoulutustoimijat();
      this.state.koulutustoimijat = (await KayttajaApi.getKoulutustoimijat()).data;
      this.fetchOikeudet();
      logger.info('Käyttäjän tiedot', this.tiedot.value);
    }
    catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  private async fetchOikeudet() {
    const tyoryhmaOikeudet = (await Kayttajaoikeudet.getTyoryhmat()).data;
    _.forEach(tyoryhmaOikeudet, tyoryhmaOikeus => {
      this.state.toteutussuunnitelmaOikeudet[_.get(tyoryhmaOikeus, '_opetussuunnitelma')] = (tyoryhmaOikeus.oikeus as any);
    });

    const organisaatioOikeudet = (await Kayttajaoikeudet.getOikeudet()).data;

    const setOikeudet = (ktIds, oikeus) => {
      _.forEach(ktIds, ktId => {
        this.state.organisaatioOikeudet[ktId] = oikeus;
      });
    };

    setOikeudet(organisaatioOikeudet['READ'], 'luku');
    setOikeudet(organisaatioOikeudet['READ_UPDATE'], 'muokkaus');
    setOikeudet(organisaatioOikeudet['CRUD'], 'luonti');
    setOikeudet(organisaatioOikeudet['ADMIN'], 'hallinta');
  }

  public async clear() {
    try {
      this.state.organisaatioOikeudet = {};
      this.state.toteutussuunnitelmaOikeudet = {};
    }
    catch (err) {
      logger.error('Ei oikeuksia', err.message);
    }
  }

  public hasOikeus(oikeus: Oikeus, kohde: OikeusKohde) {
    const kt = kohde.koulutustoimijaId || getItem('koulutustoimija') as string;
    return this.vertaa(oikeus, kt, kohde.toteutussuunnitelmaId);
  }

  public getOikeus(kohde: string) {
    return this.organisaatioOikeudet.value[kohde];
  }

  public async fetchEtusivu(koulutustoimijaId: string | number) {
    this.state.etusivu = null;
    this.state.etusivu = (await Koulutustoimijat.getEtusivu(_.toString(koulutustoimijaId))).data;
  }

  private vertaa(oikeus: Oikeus, kohdeKt: string, kohdeOps?: number) {
    const haettu = getOikeusArvo(oikeus);
    if (haettu === 0) {
      return false;
    }
    else {
      const kohdeKtOikeusarvo = getOikeusArvo(this.organisaatioOikeudet.value[kohdeKt] as Oikeus) || 0;
      const kohdeOpsOikeusarvo = getOikeusArvo(this.toteutussuunnitelmaOikeudet.value[(kohdeOps || 0)] as Oikeus) || 0;
      return (_.max([kohdeKtOikeusarvo, kohdeOpsOikeusarvo]) || 0) >= haettu;
    }
  }

  public hasHallintaoikeus(kohdeKt: string, kohdeOps?: number) {
    return this.vertaa('hallinta', kohdeKt, kohdeOps);
  }
}

export const Kayttajat = new KayttajaStore();

import _ from 'lodash';
import Vue from 'vue';
import { KayttajaApi, EtusivuDto, KoulutustoimijaBaseDto } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { IOikeusProvider } from '@shared/plugins/oikeustarkastelu';

Vue.use(VueCompositionApi);

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export type OikeusKohde = 'perusteprojekti' | 'peruste' | 'pohja';
export interface Oikeudet { [kohde: string]: Oikeus[]; }

function getOikeusArvo(oikeus: Oikeus) {
  switch (oikeus) {
  case 'luku': return 1;
  case 'kommentointi': return 2;
  case 'muokkaus': return 3;
  case 'luonti': return 4;
  case 'poisto': return 5;
  case 'tilanvaihto': return 6;
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
    oikeudet: {
    } as Oikeudet,
    etusivu: null as EtusivuDto | null,
    koulutustoimijat: null as KoulutustoimijaBaseDto[] | null,
  });

  public readonly etusivu = computed(() => this.state.etusivu);
  public readonly organisaatiot = computed(() => this.state.organisaatiot);
  public readonly tiedot = computed(() => this.state.tiedot);
  public readonly userOid = computed(() => this.state.tiedot.oidHenkilo);
  public readonly virkailijat = computed(() => this.state.virkailijat);
  public readonly oikeudet = computed(() => this.state.oikeudet);
  public readonly nimi = computed(() => parsiEsitysnimi(this.state.tiedot));
  public readonly isAdmin = computed(() => _.includes(this.state.tiedot?.oikeudet || [], 'ROLE_EPERUSTEET_ADMIN'));
  public readonly koulutustoimijat = computed(() => this.state.koulutustoimijat);

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.state.tiedot = (await KayttajaApi.getKayttaja()).data;
      this.state.koulutustoimijat = (await KayttajaApi.getKoulutustoimijat()).data;
      logger.info('Käyttäjän tiedot', this.tiedot.value);
    }
    catch (err) {
      logger.error('Käyttäjän tietojen lataus epäonnistui', err.message);
    }
  }

  public async clear() {
    try {
      this.state.oikeudet = {};
    }
    catch (err) {
      logger.error('Ei oikeuksia', err.message);
    }
  }

  public hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'peruste') {
    return true;
  }

  public async fetchEtusivu() {
    this.state.etusivu = null;
    this.state.etusivu = (await KayttajaApi.getKayttajanEtusivu()).data;
  }

  private vertaa(oikeus: Oikeus, kohde: OikeusKohde = 'peruste') {
    const haettu = getOikeusArvo(oikeus);
    if (haettu === 0) {
      return false;
    }
    else {
      const korkein = _.max(_.map(this.oikeudet.value[kohde], getOikeusArvo)) || 0;
      return korkein >= haettu;
    }
  }

  private hasHallintaoikeus(kohde: any) {
    return _.includes(this.oikeudet.value[kohde], 'luonti');
  }
}

export const Kayttajat = new KayttajaStore();

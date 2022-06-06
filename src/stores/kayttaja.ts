import _ from 'lodash';
import Vue from 'vue';
import { KayttajaApi, Koulutustoimijat, EtusivuDto, KoulutustoimijaBaseDto, Kayttajaoikeudet, OpetussuunnitelmaDto, JulkinenApi, KoulutustoimijaJulkinenDto } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { getSovellusoikeudet, IOikeusProvider } from '@shared/plugins/oikeustarkastelu';
import { Debounced } from '@shared/utils/delay';
import { getCasKayttaja } from '@shared/api/common';
import { ToteutusSovellus } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';

Vue.use(VueCompositionApi);

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export interface KoulutustoimijaOikeudet {[key: string]: Oikeus};
export interface ToteutussuunnitelmaOikeudet {[key: number]: Oikeus};
export type OikeusKohde = 'koulutustoimija' | 'toteutussuunnitelma' | 'oph';
export const OphOrgOid = '1.2.246.562.10.00000000001';

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
    koulutustoimijaOikeudet: {} as { [key: string]: Array<KoulutustoimijaBaseDto>},
    tiedot: {} as any,
    virkailijat: [] as any[],
    organisaatioOikeudet: {} as KoulutustoimijaOikeudet,
    toteutussuunnitelmaOikeudet: {} as ToteutussuunnitelmaOikeudet,
    etusivu: null as EtusivuDto | null,
    koulutustoimijat: null as KoulutustoimijaBaseDto[] | null,
    koulutustoimijaId: null as string | null,
    toteutussuunnitelmaId: null as number | null,
    ophKoulutustoimija: null as KoulutustoimijaJulkinenDto | null,
    casKayttaja: null as any | null,
    toteutus: null as Toteutus | null,
  });

  public readonly etusivu = computed(() => this.state.etusivu);
  public readonly koulutustoimijaOikeudet = computed(() => this.state.koulutustoimijaOikeudet);
  public readonly tiedot = computed(() => this.state.tiedot);
  public readonly userOid = computed(() => this.state.tiedot.oidHenkilo);
  public readonly virkailijat = computed(() => this.state.virkailijat);
  public readonly organisaatioOikeudet = computed(() => this.state.organisaatioOikeudet);
  public readonly toteutussuunnitelmaOikeudet = computed(() => this.state.toteutussuunnitelmaOikeudet);
  public readonly nimi = computed(() => parsiEsitysnimi(this.state.tiedot));
  public readonly isAdmin = computed(() => _.includes(this.state.tiedot?.oikeudet || [], 'ROLE_EPERUSTEET_ADMIN'));
  public readonly koulutustoimijat = computed(() => this.state.koulutustoimijat);
  public readonly ophSelected = computed(() => this.state.koulutustoimijaId === this.getOphKtId());
  public readonly ophKtId = computed(() => this.state.ophKoulutustoimija?.id);
  public readonly koulutustoimija = computed(() => _.find(this.state.koulutustoimijat, kt => _.toString(kt.id) === this.state.koulutustoimijaId));
  public readonly casKayttaja = computed(() => this.state.casKayttaja);
  public readonly sovellusOikeudet = computed(() => getSovellusoikeudet(this.state.casKayttaja?.groups, ToteutusSovellus[this.state.toteutus || ToteutusSovellus.ammatillinen]));

  public async init() {
    try {
      logger.info('Haetaan käyttäjän tiedot');
      this.state.casKayttaja = await getCasKayttaja();
      this.state.tiedot = (await KayttajaApi.getKayttaja()).data;
      await KayttajaApi.updateKoulutustoimijat();
      this.state.koulutustoimijat = (await KayttajaApi.getKoulutustoimijat()).data;
      this.fetchOikeudet();
      logger.info('Käyttäjän tiedot', this.tiedot.value);
      this.state.ophKoulutustoimija = (await JulkinenApi.getKoulutustoimijaByOid(OphOrgOid)).data;
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

    this.state.koulutustoimijaOikeudet = (await Kayttajaoikeudet.getKoulutustoimijaOikeudet()).data;

    const setOikeudet = (koulutustoimijat, oikeus) => {
      _.forEach(koulutustoimijat, koulutustoimija => {
        this.state.organisaatioOikeudet[koulutustoimija.id] = oikeus;
      });
    };

    setOikeudet(this.state.koulutustoimijaOikeudet['READ'], 'luku');
    setOikeudet(this.state.koulutustoimijaOikeudet['READ_UPDATE'], 'muokkaus');
    setOikeudet(this.state.koulutustoimijaOikeudet['CRUD'], 'luonti');
    setOikeudet(this.state.koulutustoimijaOikeudet['ADMIN'], 'hallinta');
  }

  public async clear() {
    try {
      this.state.organisaatioOikeudet = {};
      this.state.toteutussuunnitelmaOikeudet = {};
      this.state.koulutustoimijaId = null;
      this.state.toteutussuunnitelmaId = null;
    }
    catch (err) {
      logger.error('Ei oikeuksia', err.message);
    }
  }

  public hasOikeus(oikeus: Oikeus, kohde: OikeusKohde = 'koulutustoimija') {
    let koulutustoimijaId = this.state.koulutustoimijaId!;
    if (kohde === 'oph') {
      koulutustoimijaId = this.getOphKtId() || '0';
    }

    return this.vertaa(oikeus, koulutustoimijaId, kohde === 'toteutussuunnitelma' ? this.state.toteutussuunnitelmaId! : 0);
  }

  public getOikeus(kohde: string) {
    return this.organisaatioOikeudet.value[kohde];
  }

  @Debounced(300)
  public async fetchEtusivu(koulutustoimijaId: string | number, koulutustyypit: string[]) {
    this.state.etusivu = null;
    this.state.etusivu = (await Koulutustoimijat.getEtusivu(koulutustyypit, _.toString(koulutustoimijaId))).data;
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

  private getOphKtId() {
    const oikeudet = _.chain(this.state.koulutustoimijaOikeudet)
      .keys()
      .map(oikeus => this.state.koulutustoimijaOikeudet[oikeus])
      .flatMap()
      .value();
    return _.toString(_.get(_.find(oikeudet, oikeus => oikeus.organisaatio === OphOrgOid), 'id'));
  }

  public setKoulutustoimijaId(koulutustoimijaId: string) {
    this.state.koulutustoimijaId = koulutustoimijaId;
  }

  public setToteutussuunnitelmaId(toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelmaId = toteutussuunnitelmaId;
  }

  public setToteutus(toteutus) {
    this.state.toteutus = toteutus;
  }
}

export const Kayttajat = new KayttajaStore();

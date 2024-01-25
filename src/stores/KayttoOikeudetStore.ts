import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { KoulutustoimijaYstavaDto, OpetussuunnitelmaDto, Koulutustoimijat, KayttajaDto, Opetussuunnitelmat, KayttajaoikeusDto, KayttajaoikeusDtoOikeusEnum } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { Toteutus } from '@shared/utils/perusteet';
import { ToteutusSovellusRole } from '@/utils/toteutustypes';

Vue.use(VueCompositionApi);

export class KayttoOikeudetStore {
  private state = reactive({
    kayttajat: null as KayttajaDto[] | null,
    kayttajaOikeudet: null as KayttajaoikeusDto[] | null,
    ktYstavat: null as KoulutustoimijaYstavaDto[] | null,
    toteutus: null as Toteutus | null,
  });

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.kayttajat = null;
    if (this.opetussuunnitelma.value) {
      await this.update();
    }
  });

  public readonly kayttajat = computed(() => this.state.kayttajat);
  public readonly kayttajaOikeudet = computed(() => this.state.kayttajaOikeudet);
  public readonly ktYstavat = computed(() => this.state.ktYstavat);

  public async paivitaKayttajat() {
    try {
      this.state.kayttajat = (await Koulutustoimijat.getYstavaOrganisaatioKayttajat(ToteutusSovellusRole(this.state.toteutus), this.opetussuunnitelma.value.koulutustoimija.id)).data;
    }
    catch (err) {
      this.state.kayttajat = [];
    }
  }

  public async paivitaOikeudet() {
    try {
      this.state.kayttajaOikeudet = (await Opetussuunnitelmat.getOpetussuunnitelmaOikeudet(this.opetussuunnitelma.value.id, this.opetussuunnitelma.value.koulutustoimija.id)).data;
    }
    catch (err) {
      this.state.kayttajaOikeudet = [];
    }
  }

  public async paivitaktYstavat() {
    try {
      this.state.ktYstavat = (await Koulutustoimijat.getOmatYstavat(this.opetussuunnitelma.value.koulutustoimija.id)).data;
    }
    catch (err) {
      this.state.ktYstavat = [];
    }
  }

  public async update() {
    if (this.opetussuunnitelma.value.koulutustoimija.id && this.opetussuunnitelma.value.id) {
      await this.paivitaKayttajat();
      await this.paivitaOikeudet();
      await this.paivitaktYstavat();
    }
  }

  public async updateOikeus(kayttajaId: number, kayttajaOikeus: KayttajaoikeusDto) {
    const tallennettu = (await Opetussuunnitelmat.updateOpetussuunnitelmaOikeus(this.opetussuunnitelma.value.id, kayttajaId, this.opetussuunnitelma.value.koulutustoimija.id, kayttajaOikeus)).data;
    this.state.kayttajaOikeudet = _.filter(kayttooikeus => _.toNumber(kayttooikeus._kayttaja) !== kayttajaId);

    if (kayttajaOikeus.oikeus !== _.toLower(KayttajaoikeusDtoOikeusEnum.ESTETTY)) {
      this.state.kayttajaOikeudet = [...this.state.kayttajaOikeudet as any, tallennettu];
    }
  }

  public setToteutus(toteutus) {
    this.state.toteutus = toteutus;
  }
}

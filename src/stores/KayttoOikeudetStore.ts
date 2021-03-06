import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { KoulutustoimijaYstavaDto, OpetussuunnitelmaDto, Koulutustoimijat, KayttajaDto, Opetussuunnitelmat, KayttajaoikeusDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';

Vue.use(VueCompositionApi);

export class KayttoOikeudetStore {
  private state = reactive({
    kayttajat: null as KayttajaDto[] | null,
    kayttajaOikeudet: null as KayttajaoikeusDto[] | null,
    ktYstavat: null as KoulutustoimijaYstavaDto[] | null,
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

  public async update() {
    if (this.opetussuunnitelma.value.koulutustoimija.id && this.opetussuunnitelma.value.id) {
      this.state.kayttajat = (await Koulutustoimijat.getKaikkiKayttajat(this.opetussuunnitelma.value.koulutustoimija.id)).data;
      this.state.kayttajaOikeudet = (await Opetussuunnitelmat.getOpetussuunnitelmaOikeudet(this.opetussuunnitelma.value.id, this.opetussuunnitelma.value.koulutustoimija.id)).data;
      this.state.ktYstavat = (await Koulutustoimijat.getOmatYstavat(this.opetussuunnitelma.value.koulutustoimija.id)).data;
    }
  }

  public async updateOikeus(kayttajaId: number, kayttajaOikeus: KayttajaoikeusDto) {
    const tallennettu = (await Opetussuunnitelmat.updateOpetussuunnitelmaOikeus(this.opetussuunnitelma.value.id, kayttajaId, this.opetussuunnitelma.value.koulutustoimija.id, kayttajaOikeus)).data;

    if (!_.includes(_.map(this.kayttajaOikeudet, 'id'), tallennettu.id)) {
      this.state.kayttajaOikeudet = [...this.state.kayttajaOikeudet as any, tallennettu];
    }
    else {
      this.state.kayttajaOikeudet = _.map(this.state.kayttajaOikeudet, kayttajaOikeus => {
        if (kayttajaOikeus.id === tallennettu.id) {
          return tallennettu;
        }

        return kayttajaOikeus;
      });
    }
  }
}

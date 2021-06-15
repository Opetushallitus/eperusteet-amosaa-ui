import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { Perusteet, OpetussuunnitelmaDto, SisaltoViiteKevytDto, Opetussuunnitelmat, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';

Vue.use(VueCompositionApi);

export class KoulutuksenOsatStore implements IEditoitava {
  private state = reactive({
    koulutuksenosat: null as any | null,
  })

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly koulutuksenosat = computed(() => this.state.koulutuksenosat);

  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.koulutuksenosat = null;
    if (this.opetussuunnitelma.value) {
      this.state.koulutuksenosat = (await Sisaltoviitteet.getSisaltoviitteeTyypilla(
        this.opetussuunnitelma.value.id,
        'koulutuksenosa',
        this.opetussuunnitelma.value.koulutustoimija.id,
      )).data;
    }
  });

  async load() {
    return this.koulutuksenosat;
  }

  async editAfterLoad() {
    return false;
  }
}

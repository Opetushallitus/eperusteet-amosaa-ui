import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { Perusteet, OpetussuunnitelmaDto, SisaltoViiteKevytDto, Opetussuunnitelmat, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';

Vue.use(VueCompositionApi);

export class TutkinnonOsatStore implements IEditoitava {
  private state = reactive({
    tutkinnonosat: null as any | null,
  })

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly tutkinnonosat = computed(() => this.state.tutkinnonosat);

  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.tutkinnonosat = null;
    if (this.opetussuunnitelma.value) {
      const tutkinnonosaViitteet = (await Sisaltoviitteet.getTutkinnonosat(this.opetussuunnitelma.value.id, this.opetussuunnitelma.value.koulutustoimija.id)).data;
      const perusteenTutkinnonosaViitteet = _.keyBy((await Perusteet.getTutkinnonOsaViitteet(this.opetussuunnitelma.value.peruste.id, 'reformi')).data as any[], '_tutkinnonOsa');

      this.state.tutkinnonosat = _.map(tutkinnonosaViitteet, (tutkinnonosaViite, index) => {
        return {
          jarjestysnro: index + 1,
          tutkinnonosaViite,
          perusteenTutkinnonosaViite: perusteenTutkinnonosaViitteet[tutkinnonosaViite.tosa?.perusteentutkinnonosa!],
        };
      });
    }
  });

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    return this.tutkinnonosat;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async start() {
  }
}

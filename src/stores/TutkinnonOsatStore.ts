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
    await this.refetch();
  });

  public async refetch() {
    this.state.tutkinnonosat = null;
    if (this.opetussuunnitelma.value) {
      const tutkinnonosaViitteet = (await Sisaltoviitteet.getTutkinnonosat(this.opetussuunnitelma.value.id, this.opetussuunnitelma.value.koulutustoimija.id)).data;
      const perusteIds = [this.opetussuunnitelma.value.peruste.id, ..._.uniq(_.map(_.filter(tutkinnonosaViitteet, 'linkattuPeruste'), 'linkattuPeruste'))];

      let perusteenTutkinnonosaViitteet = {};
      if (this.opetussuunnitelma.value.peruste && _.size(tutkinnonosaViitteet) > 0) {
        perusteenTutkinnonosaViitteet = _.chain(await Promise.all(_.map(perusteIds, async (perusteId) => (await Perusteet.getTutkinnonOsaViitteet(perusteId!, 'reformi')).data as any[])))
          .flatMap()
          .keyBy('_tutkinnonOsa')
          .value();
      }

      this.state.tutkinnonosat = _.map(tutkinnonosaViitteet, (tutkinnonosaViite, index) => {
        return {
          jarjestysnro: index + 1,
          tutkinnonosaViite,
          perusteenTutkinnonosaViite: perusteenTutkinnonosaViitteet[tutkinnonosaViite.tosa?.perusteentutkinnonosa!],
        };
      });
    }
  }

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

  public readonly validator = computed(() => {
    return {};
  });
}

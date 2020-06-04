import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { Tiedotteet, TiedoteDto } from '@shared/api/eperusteet';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaTiedotteetStore {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
  })

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    if (this.opetussuunnitelma.value) {
      this.state.tiedotteet = null;
      const res = (await Tiedotteet.findTiedotteetBy(
        0,
        99999,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        [this.opetussuunnitelma.value.perusteId]
      )).data as any;
      this.state.tiedotteet = res.data;
    }
  });
}

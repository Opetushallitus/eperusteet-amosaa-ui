import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Tiedotteet, TiedoteDto } from '@shared/api/eperusteet';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaTiedotteetStore {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
  })

  public readonly tiedotteet = computed(() => this.state.tiedotteet);

  public async init(perusteId: number) {
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
      [perusteId]
    )).data as any;
    this.state.tiedotteet = res.data;
  }
}

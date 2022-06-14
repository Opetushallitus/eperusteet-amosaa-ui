import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { ITPalauteProvider, Palaute } from '@shared/stores/types';
import { Api, PalauteDto, Palautteet } from '@shared/api/amosaa';
import { PalauteKey, Tutkintorakennepalaute } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';

Vue.use(VueCompositionApi);
export class PalautteetStore implements ITPalauteProvider {
  public state = reactive({
    toteutus: Toteutus.AMMATILLINEN as Toteutus,
  })

  public readonly tutkintorakennepalaute = computed(() => Tutkintorakennepalaute[this.state.toteutus]);

  public init(toteutus) {
    this.state.toteutus = toteutus;
  }

  async sendPalaute(palaute: Palaute) {
    palaute.key = PalauteKey[this.state.toteutus];
    await Palautteet.sendPalaute(palaute);
  }
}

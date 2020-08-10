import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaTilastoDto, Opetussuunnitelmat } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class TilastotStore {
  public state = reactive({
    opetussuunnitelmat: null as OpetussuunnitelmaTilastoDto[] | null,
  })

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);

  public async fetch() {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getOpetussuunnitelmaTilastot('0')).data as any;
  }
}

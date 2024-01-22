import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaTilastoDto, Opetussuunnitelmat } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class TilastotStore {
  public state = reactive({
    opetussuunnitelmat: null as OpetussuunnitelmaTilastoDto[] | null,
  });

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);

  public async fetch(koulutustyypit) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getOpetussuunnitelmaTilastot(koulutustyypit, '0')).data as any;
  }
}

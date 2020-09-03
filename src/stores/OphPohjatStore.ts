import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, OpetussuunnitelmaBaseDto } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class OphPohjatStore {
  private state = reactive({
    pohjat: null as OpetussuunnitelmaBaseDto[] | null,
  })

  public readonly pohjat = computed(() => this.state.pohjat);

  public async fetch() {
    this.state.pohjat = (await Opetussuunnitelmat.getPohjat()).data;
  }
}

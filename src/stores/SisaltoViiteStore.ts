import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { SisaltoViiteKevytDto, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class SisaltoViiteStore {
  private state = reactive({
    sisaltoviitteet: null as SisaltoViiteKevytDto[] | null,
  })

  public readonly sisaltoviitteet = computed(() => this.state.sisaltoviitteet);

  public async init(koulutustoimijaId: number, opetussuunnitelmaId: number) {
    // TODO koulutustoimijavalintahaku oikein
    this.state.sisaltoviitteet = (await Sisaltoviitteet.getOtsikot(opetussuunnitelmaId, _.toString(koulutustoimijaId))).data;
  }
}

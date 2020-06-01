import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
  })

  public readonly toteutussuunnitelma = computed(() => this.state.toteutussuunnitelma);

  public async init(koulutustoimijaId: number, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, _.toString(koulutustoimijaId))).data;
  }
}

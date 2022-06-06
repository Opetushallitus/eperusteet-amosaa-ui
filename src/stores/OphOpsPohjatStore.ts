import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, OpetussuunnitelmaBaseDto, PageOpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { Toteutus } from '@shared/utils/perusteet';

Vue.use(VueCompositionApi);

export class OphOpsPohjatStore {
  private state = reactive({
    opsPohjat: null as OpetussuunnitelmaBaseDto[] | null,
  })

  public readonly opsPohjat = computed(() => this.state.opsPohjat);

  public async fetch(koulutustyypit: string[]) {
    this.state.opsPohjat = (await Opetussuunnitelmat.getOphOpsPohjat(koulutustyypit)).data;
  }
}

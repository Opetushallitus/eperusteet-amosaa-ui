import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, OpetussuunnitelmaBaseDto, PageOpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { Toteutus } from '@/utils/toteutustypes';

Vue.use(VueCompositionApi);

export class OphPohjatStore implements IToteutussuunnitelmaProvider {
  private state = reactive({
    pohjat: null as OpetussuunnitelmaBaseDto[] | null,
    opsPohjat: null as OpetussuunnitelmaBaseDto[] | null,
    opetussuunnitelmat: null as PageOpetussuunnitelmaDto | null,
  })

  public readonly pohjat = computed(() => this.state.pohjat);
  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);
  public readonly opsPohjat = computed(() => this.state.opsPohjat);

  public async fetch(koulutustyypit: string[]) {
    this.state.pohjat = (await Opetussuunnitelmat.getPohjat()).data;
    this.state.opsPohjat = (await Opetussuunnitelmat.getOphOpsPohjat(koulutustyypit)).data;
  }

  public async updateQuery(koulutustoimijaId: number, toteutus: Toteutus, query: any) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatSivutettu(
      _.toString(koulutustoimijaId), undefined,
      {
        params: {
          ...query,
          tyyppi: ['pohja'],
        },
      }
    )).data;
  }
}

import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { PageOpetussuunnitelmaDto, Opetussuunnitelmat } from '@shared/api/amosaa';
import _ from 'lodash';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { EperusteetKoulutustyyppiRyhmat, Toteutus } from '@shared/utils/perusteet';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmatStore implements IToteutussuunnitelmaProvider {
  private state = reactive({
    opetussuunnitelmat: null as PageOpetussuunnitelmaDto | null,
  })

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);

  public async updateQuery(koulutustoimijaId: number, toteutus?: Toteutus, query?: any) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatSivutettu(
      _.toString(koulutustoimijaId), undefined,
      {
        params: {
          ...query,
          ...(toteutus && { koulutustyyppi: EperusteetKoulutustyyppiRyhmat[toteutus] }),
        },
      })).data;
  }
}

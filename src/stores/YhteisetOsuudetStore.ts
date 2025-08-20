import { PageOpetussuunnitelmaDto, Opetussuunnitelmat } from '@shared/api/amosaa';
import _ from 'lodash';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { Toteutus } from '@shared/utils/perusteet';
import { reactive } from 'vue';
import { computed } from 'vue';


export class YhteisetOsuudetStore implements IToteutussuunnitelmaProvider {
  private state = reactive({
    opetussuunnitelmat: null as PageOpetussuunnitelmaDto | null,
  });

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);

  public async updateQuery(koulutustoimijaId: number, toteutus: Toteutus, query: any) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatSivutettu(
      _.toString(koulutustoimijaId),
      {
        params: {
          ...query,
          tyyppi: ['yhteinen'],
        },
      },
    )).data;
  }
}

import Vue from 'vue';
import { Opetussuunnitelmat, OpetussuunnitelmaBaseDto, PageOpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { Toteutus } from '@shared/utils/perusteet';
import { reactive } from 'vue';
import { computed } from 'vue';

export class OphPohjatStore implements IToteutussuunnitelmaProvider {
  private state = reactive({
    pohjat: null as OpetussuunnitelmaBaseDto[] | null,
    opetussuunnitelmat: null as PageOpetussuunnitelmaDto | null,
  });

  public readonly pohjat = computed(() => this.state.pohjat);
  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);

  public async fetch() {
    this.state.pohjat = (await Opetussuunnitelmat.getPohjat()).data;
  }

  public async updateQuery(koulutustoimijaId: number, toteutus: Toteutus, query: any) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatSivutettu(
      _.toString(koulutustoimijaId),
      {
        params: {
          ...query,
          tyyppi: ['pohja'],
        },
      },
    )).data;
  }
}

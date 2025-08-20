import Vue from 'vue';
import { PageOpetussuunnitelmaDto, Opetussuunnitelmat, OpetussuunnitelmaDto, OpetussuunnitelmaBaseDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { EperusteetKoulutustyyppiRyhmat, Toteutus } from '@shared/utils/perusteet';
import { reactive } from 'vue';
import { computed } from 'vue';

export class OpetussuunnitelmaPohjatStore {
  private state = reactive({
    opetussuunnitelmat: null as OpetussuunnitelmaBaseDto[] | null,
  });

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);

  public async fetch(koulutustoimijaId: number, toteutus: Toteutus, tilat: string[], tyyppi: string) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getOpsPohjat(
      EperusteetKoulutustyyppiRyhmat[toteutus],
      tilat,
      tyyppi,
      _.toString(koulutustoimijaId),
    )).data;
  }
}

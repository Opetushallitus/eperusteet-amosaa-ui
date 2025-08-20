import Vue from 'vue';
import { Opetussuunnitelmat, OpetussuunnitelmaBaseDto, PageOpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { reactive } from 'vue';
import { computed } from 'vue';

export class OphOpsPohjatStore {
  private state = reactive({
    opsPohjat: null as OpetussuunnitelmaBaseDto[] | null,
  });

  public readonly opsPohjat = computed(() => this.state.opsPohjat);

  public async fetch(koulutustyypit: string[]) {
    this.state.opsPohjat = (await Opetussuunnitelmat.getOphOpsPohjat(koulutustyypit)).data;
  }
}

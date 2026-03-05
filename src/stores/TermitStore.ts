import { Termit } from '@shared/api/eperusteet';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Computed } from '@shared/utils/interfaces';
import { ITermi } from '@shared/components/EpContent/KasiteHandler';
import { reactive, computed, watch } from 'vue';
import _ from 'lodash';

export class TermitStore {
  private state = reactive({
    termit: [] as ITermi[],
  });

  constructor(private toteutussuunnitelma: Computed<OpetussuunnitelmaDto | null>) {
  }

  public readonly termit = computed(() => this.state.termit);

  public readonly fetch = watch([this.toteutussuunnitelma], async () => {
    this.state.termit = [];
    const perusteId = this.toteutussuunnitelma.value?.peruste?.perusteId;
    if (perusteId) {
      const data = (await Termit.getAllTermit(perusteId)).data;
      this.state.termit = (data || []) as ITermi[];
    }
  });

  public getTermi(avain: string): ITermi | undefined {
    return _.find(this.state.termit, { avain });
  }

  public getAllTermit(): ITermi[] {
    return this.state.termit;
  }
}

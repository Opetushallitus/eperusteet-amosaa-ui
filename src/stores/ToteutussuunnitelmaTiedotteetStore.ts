import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { OpetussuunnitelmaDto, Ulkopuoliset, TiedoteDto } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaTiedotteetStore {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
  })

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.tiedotteet = null;
    if (this.opetussuunnitelma.value) {
      const res = (await Ulkopuoliset.getTiedotteetHaku(
        0,
        99999,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.opetussuunnitelma.value.peruste.perusteId
      )).data as any;
      this.state.tiedotteet = res.data;
    }
  });
}

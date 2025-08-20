import Vue from 'vue';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { OpetussuunnitelmaDto, Ulkopuoliset, TiedoteDto } from '@shared/api/amosaa';
import { reactive } from 'vue';
import { computed } from 'vue';
import { watch } from 'vue';

export class ToteutussuunnitelmaTiedotteetStore {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
  });

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.tiedotteet = null;
    if (this.opetussuunnitelma.value) {
      if (this.opetussuunnitelma.value.peruste) {
        const res = (await Ulkopuoliset.getTiedotteetHaku(
          0,
          99999,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          this.opetussuunnitelma.value.peruste.perusteId,
        )).data as any;
        this.state.tiedotteet = res.data;
      }
      else {
        this.state.tiedotteet = [];
      }
    }
  });
}

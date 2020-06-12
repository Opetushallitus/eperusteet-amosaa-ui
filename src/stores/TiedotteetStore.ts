import _ from 'lodash';
import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { TiedoteDto, Tiedotteet } from '@shared/api/eperusteet';
import { ITiedotteetProvider } from '@shared/stores/types';

Vue.use(VueCompositionApi);

export class TiedotteetStore implements ITiedotteetProvider {
  private state = reactive({
    tiedotteet: null as TiedoteDto[] | null,
    perusteenTiedotteet: null as TiedoteDto[] | null,
    perusteId: null as number | null,
  })

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly perusteenTiedotteet = computed(() => this.state.perusteenTiedotteet);
  public readonly perusteId = computed(() => this.state.perusteId);

  async init(perusteId: number) {
    this.state.perusteId = perusteId;
    this.state.perusteenTiedotteet = null;
    const res = (await Tiedotteet.findTiedotteetBy(
      0,
      99999,
      undefined, // kieli
      undefined, // nimi
      undefined, // perusteId
      undefined, // perusteeton
      undefined, // julkinen
      undefined, // yleinen
      undefined, // julkaisupaikat
      [perusteId] // perusteet
    )).data as any;

    this.state.perusteenTiedotteet = res.data;
  }

  public async fetch() {
    const res = (await Tiedotteet.findTiedotteetBy(
      0,
      99999,
      undefined, // kieli
      undefined, // nimi
      undefined, // perusteId
      undefined, // perusteeton
      undefined, // julkinen
      undefined // yleinen
    )).data as any;

    this.state.tiedotteet = res.data;
  }

  public async save() {
    // todo
  }
  public async delete() {
    // todo
  }
}

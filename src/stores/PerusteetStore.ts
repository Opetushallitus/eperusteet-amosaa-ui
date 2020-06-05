import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { PerusteDto, Ulkopuoliset } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteetStore {
  private state = reactive({
    perusteet: null as PerusteDto[] | null,
  })

  public readonly perusteet = computed(() => this.state.perusteet);

  public async updateQuery() {
    this.state.perusteet = (await Ulkopuoliset.getJulkaistutPerusteet()).data;
  }
}

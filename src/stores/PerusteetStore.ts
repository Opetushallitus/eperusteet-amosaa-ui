import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { PerusteDto, Ulkopuoliset, PerusteDtoKoulutustyyppiEnum } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteetStore {
  private state = reactive({
    perusteet: null as PerusteDto[] | null,
  })

  public readonly perusteet = computed(() => _.filter(this.state.perusteet, peruste =>
    !_.includes([PerusteDtoKoulutustyyppiEnum.TELMA, PerusteDtoKoulutustyyppiEnum.VALMA], _.toUpper(peruste.koulutustyyppi))));

  public async updateQuery() {
    this.state.perusteet = (await Ulkopuoliset.getJulkaistutPerusteet()).data;
  }
}

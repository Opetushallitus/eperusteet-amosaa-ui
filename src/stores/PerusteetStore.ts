import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { PerusteDto, Ulkopuoliset, PerusteDtoKoulutustyyppiEnum, PerusteKevytDto } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PerusteetStore {
  private state = reactive({
    perusteetKevyt: null as PerusteKevytDto[] | null,
  })

  public readonly perusteetKevyt = computed(() => {
    if (this.state.perusteetKevyt) {
      return _.filter(this.state.perusteetKevyt, peruste =>
        !_.includes([PerusteDtoKoulutustyyppiEnum.TELMA, PerusteDtoKoulutustyyppiEnum.VALMA], _.toUpper(peruste.koulutustyyppi)));
    }
    return null;
  });

  public async fetchJulkaistutPerusteet() {
    this.state.perusteetKevyt = (await Ulkopuoliset.getJulkaistutPerusteetKevyt()).data;
  }
}

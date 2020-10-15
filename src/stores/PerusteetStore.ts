import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { PerusteDto, Ulkopuoliset, PerusteDtoKoulutustyyppiEnum, PerusteKevytDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';

Vue.use(VueCompositionApi);

export class PerusteetStore {
  private state = reactive({
    perusteetKevyt: null as PerusteKevytDto[] | null,
    toteutus: null as string | null,
  })

  public readonly perusteetKevyt = computed(() => {
    if (this.state.perusteetKevyt) {
      return _.filter(this.state.perusteetKevyt, peruste =>
        !_.includes([PerusteDtoKoulutustyyppiEnum.TELMA, PerusteDtoKoulutustyyppiEnum.VALMA], _.toUpper(peruste.koulutustyyppi)));
    }
    return null;
  });

  public readonly toteutus = computed(() => this.state.toteutus);

  public init(toteutus) {
    this.state.toteutus = toteutus;
  }

  public async fetchJulkaistutPerusteet() {
    this.state.perusteetKevyt = (await Ulkopuoliset.getJulkaistutPerusteetKevyt(EperusteetKoulutustyyppiRyhmat[this.toteutus.value!])).data;
  }
}

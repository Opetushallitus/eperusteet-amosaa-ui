import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto, OpetussuunnitelmaLuontiDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { createLogger } from '@shared/utils/logger';
import { Virheet } from '@shared/stores/virheet';

Vue.use(VueCompositionApi);

const logger = createLogger('Toteutussuunnitelma');

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
    navigation: null as NavigationNodeDto | null,
  })

  public readonly toteutussuunnitelma = computed(() => this.state.toteutussuunnitelma);
  public readonly navigation = computed(() => this.state.navigation);

  public async init(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelma = null;
    try {
      this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
      await this.initNavigation(koulutustoimijaId, toteutussuunnitelmaId);
    }
    catch (e) {
      logger.error(e);
      Virheet.lisaaVirhe({});
    }
  }

  public async create(ktId: string, toteutussuunnitelma: OpetussuunnitelmaLuontiDto) {
    return (await Opetussuunnitelmat.addOpetussuunnitelma(ktId, toteutussuunnitelma)).data;
  }

  public async initNavigation(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.navigation = (await Opetussuunnitelmat.getOpetussuunnitelmaNavigation(toteutussuunnitelmaId, koulutustoimijaId)).data;
  }
}

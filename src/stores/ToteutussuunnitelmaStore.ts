import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto, OpetussuunnitelmaLuontiDto } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
    navigation: null as NavigationNodeDto | null,
  })

  public readonly toteutussuunnitelma = computed(() => this.state.toteutussuunnitelma);
  public readonly navigation = computed(() => this.state.navigation);

  public async init(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelma = null;
    this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
    await this.initNavigation(koulutustoimijaId, toteutussuunnitelmaId);
  }

  public async create(ktId: string, toteutussuunnitelma: OpetussuunnitelmaLuontiDto) {
    return (await Opetussuunnitelmat.addOpetussuunnitelma(ktId, toteutussuunnitelma)).data;
  }

  public async initNavigation(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.navigation = (await Opetussuunnitelmat.getOpetussuunnitelmaNavigation(toteutussuunnitelmaId, koulutustoimijaId)).data;
  }
}

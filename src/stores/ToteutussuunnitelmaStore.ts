import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
    navigation: null as NavigationNodeDto | null,
    // koulutustoimijaId: null as number | null,
    // toteutussuunnitelmaId: null as number | null,
    // perusteId: null as number | null,
  })

  public readonly toteutussuunnitelma = computed(() => this.state.toteutussuunnitelma);
  public readonly navigation = computed(() => this.state.navigation);
  // public readonly koulutustoimijaId = computed(() => this.state.koulutustoimijaId);
  // public readonly toteutussuunnitelmaId = computed(() => this.state.toteutussuunnitelmaId);
  // public readonly perusteId = computed(() => this.state.perusteId);

  public async init(koulutustoimijaId: number, toteutussuunnitelmaId: number) {
    // this.state.koulutustoimijaId = koulutustoimijaId;
    // this.state.toteutussuunnitelmaId = toteutussuunnitelmaId;
    this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, _.toString(koulutustoimijaId))).data;
    // this.state.perusteId = this.state.toteutussuunnitelma.perusteId as number;
    this.state.navigation = (await Opetussuunnitelmat.getOpetussuunnitelmaNavigation(toteutussuunnitelmaId, _.toString(koulutustoimijaId))).data;
  }
}

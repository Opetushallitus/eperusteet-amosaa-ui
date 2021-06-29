import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto, OpetussuunnitelmaLuontiDto, Validointi, JulkaisuBaseDto, Julkaisut } from '@shared/api/amosaa';
import _ from 'lodash';
import { createLogger } from '@shared/utils/logger';
import { Virheet } from '@shared/stores/virheet';

Vue.use(VueCompositionApi);

const logger = createLogger('Toteutussuunnitelma');

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
    navigation: null as NavigationNodeDto | null,
    toteutussuunnitelmaStatus: null as Validointi | null,
    julkaisut: null as JulkaisuBaseDto[] | null,
  })

  public readonly toteutussuunnitelma = computed(() => this.state.toteutussuunnitelma);
  public readonly navigation = computed(() => this.state.navigation);
  public readonly toteutussuunnitelmaStatus = computed(() => this.state.toteutussuunnitelmaStatus);
  public readonly julkaisut = computed(() => this.state.julkaisut);

  public async init(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelma = null;
    this.state.julkaisut = null;
    this.state.toteutussuunnitelmaStatus = null;
    this.state.navigation = null;
    try {
      this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
      this.state.julkaisut = (await Julkaisut.getJulkaisut(toteutussuunnitelmaId, koulutustoimijaId)).data;
      await this.initNavigation(koulutustoimijaId, toteutussuunnitelmaId);
      await this.updateValidation(koulutustoimijaId, toteutussuunnitelmaId);
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

  public async updateValidation(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelmaStatus = (await Opetussuunnitelmat.validoiOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
  }

  public async julkaise(julkaisu: JulkaisuBaseDto) {
    const uusiJulkaisu = (await Julkaisut.teeJulkaisu(
      this.toteutussuunnitelma.value?.id!,
      this.toteutussuunnitelma.value?.koulutustoimija?.id as any,
      julkaisu
    )).data;
    this.state.julkaisut?.unshift(uusiJulkaisu);
  }

  public async palautaJulkaisu(revision: number) {
    const uusiJulkaisu = (await Julkaisut.aktivoiJulkaisu(
      this.toteutussuunnitelma.value?.id!,
      revision,
      this.toteutussuunnitelma.value?.koulutustoimija?.id as any,
    )).data;
    this.state.julkaisut?.unshift(uusiJulkaisu);
  }
}

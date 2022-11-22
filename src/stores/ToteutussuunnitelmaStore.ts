import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto, OpetussuunnitelmaLuontiDto, Validointi, JulkaisuBaseDto, Julkaisut, VanhentunutPohjaperusteDto, OpetussuunnitelmaBaseDto, JulkaisuBaseDtoTilaEnum } from '@shared/api/amosaa';
import _ from 'lodash';
import { createLogger } from '@shared/utils/logger';
import { Virheet } from '@shared/stores/virheet';

Vue.use(VueCompositionApi);

const logger = createLogger('Toteutussuunnitelma');

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
    pohja: null as OpetussuunnitelmaBaseDto | null,
    navigation: null as NavigationNodeDto | null,
    toteutussuunnitelmaStatus: null as Validointi | null,
    julkaisut: null as JulkaisuBaseDto[] | null,
    vanhentunutPohjaperusteDto: null as VanhentunutPohjaperusteDto | null,
    julkaisemattomiaMuutoksia: null as boolean | null,
    viimeisinJulkaisuTila: null as string | null,
    tilaPolling: null as any | null,
  })

  public readonly toteutussuunnitelma = computed(() => this.state.toteutussuunnitelma);
  public readonly pohja = computed(() => this.state.pohja);
  public readonly navigation = computed(() => this.state.navigation);
  public readonly toteutussuunnitelmaStatus = computed(() => this.state.toteutussuunnitelmaStatus);
  public readonly julkaisut = computed(() => this.state.julkaisut);
  public readonly vanhentunutPohjaperusteDto = computed(() => this.state.vanhentunutPohjaperusteDto);
  public readonly julkaisemattomiaMuutoksia = computed(() => this.state.julkaisemattomiaMuutoksia);
  public readonly viimeisinJulkaisuTila = computed(() => this.state.viimeisinJulkaisuTila);

  public async init(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelma = null;
    this.state.julkaisut = null;
    this.state.toteutussuunnitelmaStatus = null;
    this.state.navigation = null;
    this.state.julkaisemattomiaMuutoksia = null;
    try {
      this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
      if (_.get(this.state.toteutussuunnitelma, '_pohja')) {
        this.state.pohja = (await Opetussuunnitelmat.getOpetussuunnitelmaPohjaKevyt(toteutussuunnitelmaId, koulutustoimijaId)).data;
      }
      this.state.julkaisut = (await Julkaisut.getJulkaisut(toteutussuunnitelmaId, koulutustoimijaId)).data;
      await this.initNavigation(koulutustoimijaId, toteutussuunnitelmaId);
      await this.updateValidation();
      await this.fetchJulkaisut();
      this.state.vanhentunutPohjaperusteDto = (await Opetussuunnitelmat.getPaivitettavaOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
    }
    catch (e) {
      logger.error(e);
      Virheet.lisaaVirhe({});
    }
  }

  public async fetchJulkaisemattomiaMuutoksia() {
    this.state.julkaisemattomiaMuutoksia = (await Julkaisut.onkoMuutoksia(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
  }

  public async create(ktId: string, toteutussuunnitelma: OpetussuunnitelmaLuontiDto) {
    return (await Opetussuunnitelmat.addOpetussuunnitelma(ktId, toteutussuunnitelma)).data;
  }

  public async initNavigation(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.navigation = (await Opetussuunnitelmat.getOpetussuunnitelmaNavigation(toteutussuunnitelmaId, koulutustoimijaId)).data;
  }

  public async updateValidation() {
    this.state.toteutussuunnitelmaStatus = (await Opetussuunnitelmat.validoiOpetussuunnitelma(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
    await this.fetchJulkaisemattomiaMuutoksia();
  }

  async updateCurrent() {
    this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
    await this.updateValidation();
  }

  async fetchJulkaisut() {
    this.state.julkaisut = (await Julkaisut.getJulkaisut(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
    if (_.includes(_.map(this.state.julkaisut, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
      await this.fetchViimeisinJulkaisuTila();
      await this.pollTila();
    }
  }

  async fetchViimeisinJulkaisuTila() {
    this.state.viimeisinJulkaisuTila = (await Julkaisut.viimeisinJulkaisuTila(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;

    if (this.state.viimeisinJulkaisuTila !== JulkaisuBaseDtoTilaEnum.KESKEN) {
      clearInterval(this.state.tilaPolling);
      this.state.tilaPolling = null;
      this.state.julkaisut = (await Julkaisut.getJulkaisut(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
      await this.updateCurrent();
    }
  }

  async pollTila() {
    if (this.state.viimeisinJulkaisuTila === JulkaisuBaseDtoTilaEnum.KESKEN) {
      this.state.tilaPolling = setInterval(() => this.fetchViimeisinJulkaisuTila(), 2500);
    }
  }

  public async julkaise(julkaisu: JulkaisuBaseDto) {
    await Julkaisut.teeJulkaisu(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id));
    await this.fetchJulkaisut();
  }

  public async paiviteOpetussunnitelmanPeruste() {
    await Opetussuunnitelmat.paivitaOpetussuunnitelmanPeruste(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id));
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

import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto, OpetussuunnitelmaLuontiDto, Validointi, JulkaisuBaseDto, Julkaisut, VanhentunutPohjaperusteDto, OpetussuunnitelmaBaseDto, JulkaisuBaseDtoTilaEnum } from '@shared/api/amosaa';
import _ from 'lodash';
import { createLogger } from '@shared/utils/logger';
import { delay } from '@shared/utils/delay';

Vue.use(VueCompositionApi);

const logger = createLogger('Toteutussuunnitelma');

export class ToteutussuunnitelmaStore {
  private state = reactive({
    toteutussuunnitelma: null as OpetussuunnitelmaDto | null,
    pohja: null as OpetussuunnitelmaBaseDto | null,
    navigation: null as NavigationNodeDto | null,
    toteutussuunnitelmaStatus: null as Array<Validointi> | null,
    julkaisut: null as JulkaisuBaseDto[] | null,
    vanhentunutPohjaperusteDto: null as VanhentunutPohjaperusteDto | null,
    julkaisemattomiaMuutoksia: null as boolean | null,
    viimeisinJulkaisuTila: null as string | null,
    tilaPolling: null as any | null,
  });

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
      await this.fetchOpetussuunnitelma(koulutustoimijaId, toteutussuunnitelmaId);
      this.state.julkaisut = (await Julkaisut.getJulkaisut(toteutussuunnitelmaId, koulutustoimijaId)).data;
      this.initNavigation();
      this.updateValidation();
      this.fetchJulkaisut();
      this.state.vanhentunutPohjaperusteDto = (await Opetussuunnitelmat.getPaivitettavaOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
    }
    catch (e) {
      logger.error(e);
    }
  }

  public async fetchOpetussuunnitelma(koulutustoimijaId: string, toteutussuunnitelmaId: number) {
    this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
    if (_.get(this.state.toteutussuunnitelma, '_pohja')) {
      this.state.pohja = (await Opetussuunnitelmat.getOpetussuunnitelmaPohjaKevyt(toteutussuunnitelmaId, koulutustoimijaId)).data;
    }
  }

  public async fetchJulkaisemattomiaMuutoksia() {
    this.state.julkaisemattomiaMuutoksia = (await Julkaisut.julkaisemattomiaMuutoksia(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
  }

  public async create(ktId: string, toteutussuunnitelma: OpetussuunnitelmaLuontiDto) {
    return (await Opetussuunnitelmat.addOpetussuunnitelma(ktId, toteutussuunnitelma)).data;
  }

  public async initNavigation() {
    this.state.navigation = (await Opetussuunnitelmat.getOpetussuunnitelmaNavigation(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
  }

  public async updateValidation() {
    if (this.toteutussuunnitelma.value) {
      this.state.toteutussuunnitelmaStatus = null;
      this.state.toteutussuunnitelmaStatus = (await Opetussuunnitelmat.validoiOpetussuunnitelma(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id))).data;
      await this.fetchJulkaisemattomiaMuutoksia();
    }
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
      await delay(2000);
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
    await Julkaisut.teeJulkaisu(this.toteutussuunnitelma.value?.id!, _.toString(this.toteutussuunnitelma.value?.koulutustoimija?.id), julkaisu);
    await this.fetchJulkaisut();
    if (!_.includes(_.map(this.state.julkaisut, 'tila'), JulkaisuBaseDtoTilaEnum.KESKEN)) {
      await this.updateCurrent();
    }
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

  public naviFind(navitype: string) {
    const stack = [] as any[];
    stack.push(...(this.state!.navigation!.children || []));

    while (!_.isEmpty(stack)) {
      const head = stack.pop();
      if (head.type === navitype) {
        return head;
      }

      if (head.children) {
        stack.push(...head.children);
      }
    }
  }
}

import Vue from 'vue';
import { OpetussuunnitelmaDto, Opetussuunnitelmat, NavigationNodeDto, OpetussuunnitelmaLuontiDto, Validointi, JulkaisuBaseDto, Julkaisut, VanhentunutPohjaperusteDto, OpetussuunnitelmaBaseDto, JulkaisuBaseDtoTilaEnum } from '@shared/api/amosaa';
import _ from 'lodash';
import { createLogger } from '@shared/utils/logger';
import { delay } from '@shared/utils/delay';
import { reactive } from 'vue';
import { computed } from 'vue';

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
      await this.fetchJulkaisut();
      this.initNavigation();
      this.updateValidation();
      this.seuraaKeskenJulkaisuJosTarvetta();
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
    this.state.julkaisemattomiaMuutoksia = (await Julkaisut.julkaisemattomiaMuutoksia(this.state.toteutussuunnitelma!.id!, _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id))).data;
  }

  public async create(ktId: string, toteutussuunnitelma: OpetussuunnitelmaLuontiDto) {
    return (await Opetussuunnitelmat.addOpetussuunnitelma(ktId, toteutussuunnitelma)).data;
  }

  public async initNavigation() {
    this.state.navigation = (await Opetussuunnitelmat.getOpetussuunnitelmaNavigation(this.state.toteutussuunnitelma!.id!, _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id))).data;
  }

  public async updateValidation() {
    if (this.toteutussuunnitelma.value) {
      this.state.toteutussuunnitelmaStatus = null;
      this.state.toteutussuunnitelmaStatus = (await Opetussuunnitelmat.validoiOpetussuunnitelma(this.state.toteutussuunnitelma!.id!, _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id))).data;
      await this.fetchJulkaisemattomiaMuutoksia();
    }
  }

  async updateCurrent() {
    this.state.toteutussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(this.state.toteutussuunnitelma!.id!, _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id))).data;
    await this.updateValidation();
  }

  async fetchJulkaisut() {
    const opsId = this.state.toteutussuunnitelma!.id!;
    const ktId = _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id);
    this.state.julkaisut = (await Julkaisut.getJulkaisut(opsId, ktId)).data;
  }

  private seuraaKeskenJulkaisuJosTarvetta() {
    if (!this.state.julkaisut || !_.some(this.state.julkaisut, { tila: JulkaisuBaseDtoTilaEnum.KESKEN })) {
      return;
    }
    const opsId = this.state.toteutussuunnitelma!.id!;
    const ktId = _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id);
    void this.pollJulkaisuUntilValmis(opsId, ktId);
  }

  private async pollJulkaisuUntilValmis(opsId: number, ktId: string) {
    while (true) {
      this.state.viimeisinJulkaisuTila = (await Julkaisut.viimeisinJulkaisuTila(opsId, ktId)).data;
      await delay(2500);
      if (this.state.viimeisinJulkaisuTila !== JulkaisuBaseDtoTilaEnum.KESKEN) {
        break;
      }
    }

    this.state.julkaisut = (await Julkaisut.getJulkaisut(opsId, ktId)).data;
    await this.updateCurrent();
  }

  public async julkaise(julkaisu: JulkaisuBaseDto) {
    const opsId = this.state.toteutussuunnitelma!.id!;
    const ktId = _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id);
    await Julkaisut.teeJulkaisu(opsId, ktId, julkaisu);
    await this.fetchJulkaisut();
    await this.pollJulkaisuUntilValmis(opsId, ktId);
  }

  public async paiviteOpetussunnitelmanPeruste() {
    await Opetussuunnitelmat.paivitaOpetussuunnitelmanPeruste(this.state.toteutussuunnitelma!.id!, _.toString(this.state.toteutussuunnitelma!.koulutustoimija!.id));
  }

  public async palautaJulkaisu(revision: number) {
    const uusiJulkaisu = (await Julkaisut.aktivoiJulkaisu(
      this.state.toteutussuunnitelma!.id!,
      revision,
      this.state.toteutussuunnitelma!.koulutustoimija!.id as any,
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

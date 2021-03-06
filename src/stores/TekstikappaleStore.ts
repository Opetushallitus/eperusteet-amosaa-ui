import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko, Koulutustyyppi } from '@shared/tyypit';
import { Computed } from '@shared/utils/interfaces';

Vue.use(VueCompositionApi);

export interface ITekstikappale {
  create(opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoviiteId: number,
    versionumero: number,
    el: any,
    updateNavigation: Function,
    opetussuunnitelma: Computed<OpetussuunnitelmaDto>): TekstikappaleStore
}

export class TekstikappaleStore implements IEditoitava, ITekstikappale {
  constructor(
    public opetussuunnitelmaId?: number,
    public koulutustoimijaId?: string,
    public sisaltoviiteId?: number,
    public versionumero?: number,
    public el?: any,
    public updateNavigation?: Function,
    public opetussuunnitelma?: Computed<OpetussuunnitelmaDto>,
  ) {
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    if (this.versionumero) {
      const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId!, this.sisaltoviiteId!, rev.numero, this.koulutustoimijaId!)).data;
    }
    else {
      return (await Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!)).data;
    }
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!, data);
  }

  async restore(rev: number) {
    const restoring = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId!, this.sisaltoviiteId!, rev, this.koulutustoimijaId!)).data;
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!, restoring);
  }

  async revisions() {
    const data = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!)).data;
    return data as Revision[];
  }

  async start() {
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!);
    await this.updateNavigation!();
    this.el.$router.replace({
      name: 'toteutussuunnitelma',
    });
  }
  public readonly validator = computed(() => {
    return {};
  });

  public async lock() {
    try {
      const res = await SisaltoviiteLukko.getLock(_.toNumber(this.koulutustoimijaId), this.opetussuunnitelmaId!, this.sisaltoviiteId!);
      return res.data as ILukko;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await SisaltoviiteLukko.lock(_.toNumber(this.koulutustoimijaId), this.opetussuunnitelmaId!, this.sisaltoviiteId!);
    return res.data as ILukko;
  }

  public async release() {
    await SisaltoviiteLukko.unlock(_.toNumber(this.koulutustoimijaId), this.opetussuunnitelmaId!, this.sisaltoviiteId!);
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: true,
        removable: true,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }

  public static async add(opsId: number, svId: number, ktId: string, tekstikappale: SisaltoviiteMatalaDto, el: any, updateNavigation: Function) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, tekstikappale)).data;
    await updateNavigation();

    el.$router.push({
      name: 'tekstikappale',
      params: {
        sisaltoviiteId: '' + added.id,
      },
    });
  }

  create(opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoviiteId: number,
    versionumero: number,
    el: any,
    updateNavigation: Function,
    opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
    return new TekstikappaleStore(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, el, updateNavigation, opetussuunnitelma);
  }
}

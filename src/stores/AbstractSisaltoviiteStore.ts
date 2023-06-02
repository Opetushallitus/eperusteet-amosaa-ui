import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { Sisaltoviitteet, SisaltoViiteDto, Perusteet, SisaltoViiteDtoTyyppiEnum, SisaltoviiteLukko } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { ILukko, Revision } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class AbstractSisaltoviiteStore {
  constructor(
    public opetussuunnitelmaId?: number,
    public koulutustoimijaId?: string,
    public sisaltoviiteId?: number,
    public versionumero?: number,
    public el?: any,
    public updateNavigation?: Function) {
  }

  async fetchSisaltoviite() {
    if (this.versionumero) {
      const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId!, this.sisaltoviiteId!, rev.numero, this.koulutustoimijaId!)).data;
    }
    else {
      return (await Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!)).data;
    }
  }

  async restore(rev: number) {
    const restoring = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId!, this.sisaltoviiteId!, rev, this.koulutustoimijaId!)).data;
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!, restoring);
  }

  async revisions() {
    const data = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!)).data;
    return data as Revision[];
  }

  public async lock() {
    try {
      const res = await SisaltoviiteLukko.getLock(_.toNumber(this.koulutustoimijaId!), this.opetussuunnitelmaId!, this.sisaltoviiteId!);
      return res.data as ILukko;
    }
    catch (err) {
      return null;
    }
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!);
    await this.updateNavigation?.();
    this.el?.$router.replace({
      name: 'toteutussuunnitelma',
    });
  }

  public async acquire() {
    const res = await SisaltoviiteLukko.lock(_.toNumber(this.koulutustoimijaId!), this.opetussuunnitelmaId!, this.sisaltoviiteId!);
    return res.data as ILukko;
  }

  public async release() {
    await SisaltoviiteLukko.unlock(_.toNumber(this.koulutustoimijaId!), this.opetussuunnitelmaId!, this.sisaltoviiteId!);
  }

  async saveSisaltoviite(sisaltoviite) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!, sisaltoviite);
  }
}

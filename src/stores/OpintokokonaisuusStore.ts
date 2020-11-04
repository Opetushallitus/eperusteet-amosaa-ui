import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';

import _ from 'lodash';
import { minLength, required, minValue } from 'vuelidate/lib/validators';

import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { translated } from '@shared/validators/required';

Vue.use(VueCompositionApi);

export class OpintokokonaisuusStore implements IEditoitava {
  private opintokokonaisuus: SisaltoviiteMatalaDto | undefined = undefined;

  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private sisaltoviiteId: number,
    private versionumero: number,
    private el: any,
    private updateNavigation: Function,
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
    let content: SisaltoviiteMatalaDto;

    if (this.versionumero) {
      const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      content = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoviiteId, rev.numero, this.koulutustoimijaId)).data as SisaltoviiteMatalaDto;
      this.opintokokonaisuus = content;
      return content;
    }
    else {
      content = (await Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId)).data;
      this.opintokokonaisuus = content;
      return content;
    }
  }

  async save(data: any) {
    const filteredData = {
      ...data,
      opintokokonaisuus: {
        ...data.opintokokonaisuus,
        tavoitteet: data.opintokokonaisuus.tavoitteet.filter(tavoite => !!tavoite.tavoiteKoodi),
        arvioinnit: data.opintokokonaisuus.arvioinnit.filter(arviointi => !!arviointi.arviointi),
      },
    };
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, filteredData);
  }

  async restore(rev: number) {
    const restoring = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoviiteId, rev, this.koulutustoimijaId)).data;
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, restoring);
  }

  async revisions() {
    const data = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId)).data;
    return data as Revision[];
  }

  async start() {
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId);
    await this.updateNavigation();
    this.el.$router.replace({
      name: 'toteutussuunnitelma',
    });
  }

  public readonly validator = computed(() => {
    const kieli = [Kielet.getSisaltoKieli.value];
    return {
      tekstiKappale: {
        nimi: translated(kieli),
      },
      opintokokonaisuus: {
        laajuus: {
          required,
          'min-length': minValue(this.opintokokonaisuus?.opintokokonaisuus?.minimilaajuus || 0),
        },
        kuvaus: translated(kieli),
        opetuksenTavoiteOtsikko: translated(kieli),
        tavoitteet: {
          'min-length': minLength(1),
          required,
        },
        arvioinnit: {
          'min-length': minLength(1),
          required,
        },
      },
    };
  });

  public async lock() {
    try {
      const res = await SisaltoviiteLukko.getLock(_.toNumber(this.koulutustoimijaId), this.opetussuunnitelmaId, this.sisaltoviiteId);
      return res.data as ILukko;
    }
    catch (err) {
      return null;
    }
  }

  public async acquire() {
    const res = await SisaltoviiteLukko.lock(_.toNumber(this.koulutustoimijaId), this.opetussuunnitelmaId, this.sisaltoviiteId);
    return res.data as ILukko;
  }

  public async release() {
    await SisaltoviiteLukko.unlock(_.toNumber(this.koulutustoimijaId), this.opetussuunnitelmaId, this.sisaltoviiteId);
  }

  public features(_data: any) {
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

  public static async add(opsId: number, svId: number, ktId: string, opintokokonaisuus: SisaltoviiteMatalaDto, el: any, updateNavigation: Function) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, opintokokonaisuus)).data;
    await updateNavigation();

    el.$router.push({
      name: 'opintokokonaisuus',
      params: {
        sisaltoviiteId: '' + added.id,
      },
    });
  }
}

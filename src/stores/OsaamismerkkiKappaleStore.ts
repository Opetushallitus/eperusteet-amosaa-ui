import Vue from 'vue';
import _ from 'lodash';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, SisaltoviiteLukko, SisaltoviiteMatalaDto, Sisaltoviitteet } from '@shared/api/amosaa';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { ILukko, Revision } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { Computed } from '@shared/utils/interfaces';
import { translated } from '@shared/validators/required';
import { minLength, required } from 'vuelidate/lib/validators';

Vue.use(VueCompositionApi);

export class OsaamismerkkiKappaleStore implements IEditoitava {
  private osaamismerkkiKappale: SisaltoviiteMatalaDto | undefined = undefined;

  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private sisaltoviiteId: number,
    private versionumero: number,
    private el: any,
    private opetussuunnitelma: Computed<OpetussuunnitelmaDto>,
    private updateNavigation: Function,
  ) {
  }

  async load() {
    let content: SisaltoviiteMatalaDto;

    if (this.versionumero) {
      const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      content = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoviiteId, rev.numero, this.koulutustoimijaId)).data as SisaltoviiteMatalaDto;
      this.osaamismerkkiKappale = content;
      return content;
    }
    else {
      content = (await Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId)).data;
      this.osaamismerkkiKappale = content;
      return content;
    }
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, data);
    await this.updateNavigation();
  }

  async restore(rev: number) {
    const restoring = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoviiteId, rev, this.koulutustoimijaId)).data;
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, restoring);
  }

  async revisions() {
    const data = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId)).data;
    return data as Revision[];
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId);
    await this.updateNavigation();
    this.el.$router.replace({
      name: 'toteutussuunnitelma',
    });
  }

  public readonly validator = computed(() => {
    return {
      osaamismerkkiKappale: {
        kuvaus: translated([Kielet.getSisaltoKieli.value]),
        osaamismerkkiKoodit: {
          'min-length': minLength(1),
          required,
        },
      },
    } as any;
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

  public static async add(opsId: number, svId: number, ktId: string, osaamismerkkiKappale: SisaltoviiteMatalaDto, el: any, updateNavigation: Function) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, osaamismerkkiKappale)).data;
    await updateNavigation();

    el.$router.push({
      name: 'osaamismerkkikappale',
      params: {
        sisaltoviiteId: '' + added.id,
      },
    });
  }

  async start() {
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }
}

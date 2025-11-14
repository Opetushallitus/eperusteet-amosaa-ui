import Vue from 'vue';
import { OpetussuunnitelmaDto, SisaltoviiteMatalaDto, Sisaltoviitteet } from '@shared/api/amosaa';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Revision } from '@shared/tyypit';
import { Computed } from '@shared/utils/interfaces';
import { minLength, required } from '@vuelidate/validators';
import { AbstractSisaltoviiteStore } from '@/stores/AbstractSisaltoviiteStore';
import { computed } from 'vue';

export class OsaamismerkkiKappaleStore extends AbstractSisaltoviiteStore implements IEditoitava {
  private osaamismerkkiKappale: SisaltoviiteMatalaDto | undefined = undefined;

  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public versionumero: number,
    public opetussuunnitelma: Computed<OpetussuunnitelmaDto>,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero);
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
    await OsaamismerkkiKappaleStore.config.updateNavigation;
  }

  public readonly validator = computed(() => {
    return {
      osaamismerkkiKappale: {
        osaamismerkkiKoodit: {
          'min-length': minLength(1),
          required,
        },
      },
    } as any;
  });

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

  public static async add(opsId: number, svId: number, ktId: string, osaamismerkkiKappale: SisaltoviiteMatalaDto) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, osaamismerkkiKappale)).data;
    await OsaamismerkkiKappaleStore.config.updateNavigation;

    OsaamismerkkiKappaleStore.config.router.push({
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

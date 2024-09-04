import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Perusteet, Opetussuunnitelmat, PerusteDto } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision } from '@shared/tyypit';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import { minValue, maxValue, requiredIf } from 'vuelidate/lib/validators';
import { Toteutus } from '@shared/utils/perusteet';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { KuvaStore } from './KuvaStore';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaTiedotStore implements IEditoitava {
  private peruste: PerusteDto | null = null;

  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private versionumero: number,
    private toteutus: Toteutus,
    private toteutussuunnitelmaStore: ToteutussuunnitelmaStore) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    const opetussuunnitelma = (await this.getOpetussuunnitelmaVersion()) as OpetussuunnitelmaDto;

    if (opetussuunnitelma.peruste) {
      this.peruste = (await Perusteet.getPeruste(opetussuunnitelma.peruste?.id!)).data;
    }

    return {
      opetussuunnitelma: {
        ...opetussuunnitelma,
      },
      peruste: this.peruste,
    };
  }

  async getOpetussuunnitelmaVersion() {
    if (this.versionumero) {
      const revisions = (await Opetussuunnitelmat.getOpetussuunnitelmaRevisions(this.opetussuunnitelmaId, this.koulutustoimijaId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return (await Opetussuunnitelmat.getOpetussuunnitelmaRevision(this.opetussuunnitelmaId, rev.numero, this.koulutustoimijaId)).data;
    }
    else {
      return (await Opetussuunnitelmat.getOpetussuunnitelma(this.opetussuunnitelmaId, this.koulutustoimijaId)).data;
    }
  }

  async save(data: any) {
    const kuvat = (await new KuvaStore(this.opetussuunnitelmaId, this.koulutustoimijaId).getAllKuvat()).data;
    data.opetussuunnitelma = {
      ...data.opetussuunnitelma,
      liitteet: kuvat,
    };

    await Opetussuunnitelmat.updateOpetussuunnitelma(this.opetussuunnitelmaId, this.koulutustoimijaId, data.opetussuunnitelma);
    this.toteutussuunnitelmaStore?.fetchOpetussuunnitelma(this.koulutustoimijaId, this.opetussuunnitelmaId);
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore(rev: number) {
    await Opetussuunnitelmat.revertOpetussuunnitelmaToRevision(this.opetussuunnitelmaId, rev, this.koulutustoimijaId);
  }

  async revisions() {
    const data = (await Opetussuunnitelmat.getOpetussuunnitelmaRevisions(this.opetussuunnitelmaId, this.koulutustoimijaId)).data;
    return data as Revision[];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    const peruste = this.peruste as PerusteDto;
    return {
      opetussuunnitelma: {
        nimi: {
          ...requiredLokalisoituTeksti(),
        },
        voimaantulo: {
          'min-value': peruste && peruste.voimassaoloAlkaa ? minValue(peruste.voimassaoloAlkaa) : '',
          required: requiredIf(() => {
            return this.toteutus === Toteutus.VAPAASIVISTYSTYO;
          }),
        },
        paatospaivamaara: {
          'max-value': peruste && peruste.voimassaoloLoppuu ? maxValue(peruste.voimassaoloLoppuu) : '',
        },
        jotpatyyppi: {
          required: requiredIf((value) => {
            return !!value.jotpa;
          }),
        },
      },
    };
  });

  public features(data: any) {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        recoverable: true,
      } as EditoitavaFeatures;
    });
  }
}

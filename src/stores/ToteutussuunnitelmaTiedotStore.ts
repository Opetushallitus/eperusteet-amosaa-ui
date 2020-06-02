import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Perusteet, Opetussuunnitelmat, PerusteDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { Revision, Kieli } from '@shared/tyypit';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import { required, minValue, maxValue } from 'vuelidate/lib/validators';

Vue.use(VueCompositionApi);

export class ToteutussuunnitelmaTiedotStore implements IEditoitava {
  private peruste: PerusteDto | null = null;

  constructor(private opetussuunnitelmaId: number, private koulutustoimijaId: string, private versionumero: number) {
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
    this.peruste = (await Perusteet.getPeruste(opetussuunnitelma.peruste?.id!)).data;

    return {
      opetussuunnitelma: {
        ...opetussuunnitelma,
        toteutussuunnitelmaUrl: buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/toteutussuunnitelma/${opetussuunnitelma.id}`),
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
    await Opetussuunnitelmat.updateOpetussuunnitelma(this.opetussuunnitelmaId, this.koulutustoimijaId, data.opetussuunnitelma);
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
          'min-value': peruste.voimassaoloAlkaa ? minValue(peruste.voimassaoloAlkaa) : '',
        },
        paatospaivamaara: {
          'max-value': peruste.voimassaoloLoppuu ? maxValue(peruste.voimassaoloLoppuu) : '',
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

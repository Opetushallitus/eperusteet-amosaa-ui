import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';

import _ from 'lodash';
import { minLength, required, minValue } from 'vuelidate/lib/validators';

import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { translated } from '@shared/validators/required';
import { Validations } from 'vuelidate-property-decorators';
import { Computed } from '@shared/utils/interfaces';

Vue.use(VueCompositionApi);

export class OpintokokonaisuusStore implements IEditoitava {
  private opintokokonaisuus: SisaltoviiteMatalaDto | undefined = undefined;

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
    const kieli = Kielet.getSisaltoKieli.value;

    let validations = {
      tekstiKappale: {
        nimi: translated([kieli]),
      },
      opintokokonaisuus: {
        laajuus: {
          required,
          'min-length': minValue(this.opintokokonaisuus?.opintokokonaisuus?.minimilaajuus || 0),
        },
        laajuusYksikko: {
          required,
        },
        kuvaus: translated([kieli]),
        tavoitteet: {
          'min-length': minLength(0),
          $each: {
            tavoite: {
              [kieli]: {
                required,
              },
            },
          },
        },
        arvioinnit: {
          'min-length': minLength(0),
          $each: {
            arviointi: {
              [kieli]: {
                required,
              },
            },
          },
        },
      },
    } as any;

    if (this.opetussuunnitelma?.value?.tyyppi !== _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA)) {
      validations = {
        ...validations,
        opintokokonaisuus: {
          ...validations.opintokokonaisuus,
          opetuksenTavoiteOtsikko: translated([kieli]),
          tavoitteet: {
            'min-length': minLength(1),
            required,
            $each: {
              tavoite: {
                [kieli]: {
                  required,
                },
              },
            },
          },
          arvioinnit: {
            'min-length': minLength(1),
            required,
            $each: {
              arviointi: {
                [kieli]: {
                  required,
                },
              },
            },
          },
        },
      };
    }

    return validations;
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

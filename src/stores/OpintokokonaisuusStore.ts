import Vue from 'vue';
import _ from 'lodash';
import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures, EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko, Kieli } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { langMinLength, translated, langStrictCodeValidator, minValue } from '@shared/validators/required';
import { Computed } from '@shared/utils/interfaces';
import { computed } from 'vue';
import { Router, useRouter } from 'vue-router';
import { App } from 'vue';
import { required, minLength, requiredIf, helpers } from '@vuelidate/validators';

interface OpintokokonaisuusStoreConfig {
  router: Router;
  updateNavigation: () => Promise<void>;
}

export class OpintokokonaisuusStore implements IEditoitava {
  protected static config: OpintokokonaisuusStoreConfig;

  public static install(app: App, config: OpintokokonaisuusStoreConfig) {
    OpintokokonaisuusStore.config = config;
  }

  private opintokokonaisuus: SisaltoviiteMatalaDto | undefined = undefined;

  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private sisaltoviiteId: number,
    private versionumero: number,
    private opetussuunnitelma: Computed<OpetussuunnitelmaDto>,
    private editointiStore: EditointiStore,
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
    await OpintokokonaisuusStore.config.updateNavigation();
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
    await OpintokokonaisuusStore.config.updateNavigation();
    OpintokokonaisuusStore.config.router.replace({
      name: 'toteutussuunnitelma',
    });
  }

  public readonly validator = computed(() => {
    const kieli = Kielet.getSisaltoKieli.value;

    let validations = {
      tekstiKappale: {
        nimi: {
          [kieli]: {
            required: requiredIf((value, parent) => {
              return !parent?.koodiArvo;
            }),
          },
        },
      },
      opintokokonaisuus: {
        laajuus: {
          required: requiredIf((value, parent) => {
            return !!parent?.laajuusYksikko;
          }),
          'min-value': (value: any, parent: any) => {
            if (!parent?.laajuusYksikko) return true;
            if (value == null || value === '' || value === undefined) return true;
            const numValue = Number(value);
            return !isNaN(numValue) && numValue >= 0.5 && numValue % 0.5 === 0;
          },
        },
        laajuusYksikko: {
          required: requiredIf((value, parent) => {
            const laajuus = parent?.laajuus;
            return laajuus != null && laajuus !== '' && !isNaN(Number(laajuus)) && Number(laajuus) > 0;
          }),
        },
        kuvaus: translated([kieli]),
        ...this.tavoiteArviointiValidations(),
      },
    } as any;

    if (this.opetussuunnitelma?.value?.tyyppi !== _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA)) {
      validations = {
        ...validations,
        opintokokonaisuus: {
          ...validations.opintokokonaisuus,
          opetuksenTavoiteOtsikko: translated([kieli]),
        },
      };
    }

    return validations;
  });

  private tavoiteArviointiValidations() {

    const skipIfKoodi = (validatorFn: (value: any) => boolean) => {
      return (value: any, siblings: any) => {
        if (siblings.koodi) return true;
        return validatorFn(value);
      };
    };

    return {
      tavoitteet: {
        required,
        $each: helpers.forEach({
          tavoite: {
            required: requiredIf((value, parent) => {
              return !parent.koodi;
            }),
            'min-length-3': skipIfKoodi(langMinLength(3)['min-length-3']),
            'strict-code-validator': skipIfKoodi(langStrictCodeValidator()['strict-code-validator']),
          },
        }),
      },
      arvioinnit: {
        required,
        $each: helpers.forEach({
          arviointi: {
            required,
            ...langMinLength(3),
          },
        }),
      },
    };
  };

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

  public static async add(opsId: number, svId: number, ktId: string, opintokokonaisuus: SisaltoviiteMatalaDto) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, opintokokonaisuus)).data;
    await OpintokokonaisuusStore.config.updateNavigation();

    OpintokokonaisuusStore.config.router.push({
      name: 'opintokokonaisuus',
      params: {
        sisaltoviiteId: '' + added.id,
      },
    });
  }
}

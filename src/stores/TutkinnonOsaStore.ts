import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto, Perusteet, Opetussuunnitelmat, PerusteDto, Sisaltoviitteet, Koodistot, Arviointiasteikot } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { Revision, Kieli } from '@shared/tyypit';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import { required, minValue, maxValue } from 'vuelidate/lib/validators';
import { Matala } from '@shared/generated/amosaa';

Vue.use(VueCompositionApi);

export class TutkinnonOsaStore implements IEditoitava {
  constructor(private opetussuunnitelmaId: number, private koulutustoimijaId: string, private tutkinnonosaId: number, private perusteId: number) {
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
    let tutkinnonosaViite: any;
    let peruste: any;
    let arviointiasteikot: any;
    [tutkinnonosaViite, peruste, arviointiasteikot] = _.map(await (Promise.all([
      Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId),
      Perusteet.getPeruste(this.perusteId),
      Arviointiasteikot.getAllArviointiasteikot(),
    ])), 'data');
    const perusteenTutkinnonosaViite = (await Perusteet.getTutkinnonOsaViite(this.perusteId, 'reformi', tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data;
    const perusteenTutkinnonosa = (await Perusteet.getPerusteTutkinnonOsa(this.perusteId, tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data as any;

    const tutkintonimikeKoodit = _.map(await Promise.all(_.chain(peruste.tutkintonimikkeet)
      .map('tutkintonimikeUri')
      .map((tutkintonimikeUri: string) => Koodistot.getKoodistoKoodiByUri(tutkintonimikeUri))
      .value()), 'data');

    if (perusteenTutkinnonosa.arviointi) {
      perusteenTutkinnonosa.arviointi.arvioinninKohdealueet = _.map(perusteenTutkinnonosa.arviointi.arvioinninKohdealueet, arvKohdealue => {
        return {
          ...arvKohdealue,
          arvioinninKohteet: _.map(arvKohdealue.arvioinninKohteet, arvioinninKohde => {
            const arviointiAsteikko = _.keyBy(arviointiasteikot, 'id')[arvioinninKohde._arviointiAsteikko];
            const osaamistasot = _.keyBy(arviointiAsteikko.osaamistasot, 'id');
            return {
              ...arvioinninKohde,
              osaamistasonKriteerit: _.sortBy(_.map(arvioinninKohde.osaamistasonKriteerit, osaamistasonKriteeri => {
                return {
                  ...osaamistasonKriteeri,
                  osaamistaso: osaamistasot[osaamistasonKriteeri._osaamistaso],
                };
              }), '_osaamistaso'),
            };
          }),
        };
      });
    }

    if (perusteenTutkinnonosa.geneerinenArviointiasteikko) {
      const arviointiAsteikko = _.keyBy(arviointiasteikot, 'id')[perusteenTutkinnonosa.geneerinenArviointiasteikko._arviointiAsteikko];
      const osaamistasot = _.keyBy(arviointiAsteikko.osaamistasot, 'id');
      perusteenTutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit = _.map(perusteenTutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit, otKriteeri => {
        return {
          ...otKriteeri,
          osaamistaso: osaamistasot[otKriteeri._osaamistaso],
        };
      });
    }

    return {
      tutkinnonosaViite,
      perusteenTutkinnonosaViite,
      perusteenTutkinnonosa,
      osaamisalat: peruste.osaamisalat,
      tutkintonimikkeet: tutkintonimikeKoodit,
    };
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId, data.tutkinnonosaViite);
  }

  async release() {
  }

  async lock() {
    return null;
  }

  // async restore(rev: number) {
  // await Opetussuunnitelmat.revertOpetussuunnitelmaToRevision(this.opetussuunnitelmaId, rev, this.koulutustoimijaId);
  // }

  // async revisions() {
  // const data = (await Opetussuunnitelmat.getOpetussuunnitelmaRevisions(this.opetussuunnitelmaId, this.koulutustoimijaId)).data;
  // return data as Revision[];
  // }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
    // const peruste = this.peruste as PerusteDto;
    // return {
    //   opetussuunnitelma: {
    //     nimi: {
    //       ...requiredLokalisoituTeksti(),
    //     },
    //     voimaantulo: {
    //       'min-value': peruste && peruste.voimassaoloAlkaa ? minValue(peruste.voimassaoloAlkaa) : '',
    //     },
    //     paatospaivamaara: {
    //       'max-value': peruste && peruste.voimassaoloLoppuu ? maxValue(peruste.voimassaoloLoppuu) : '',
    //     },
    //   },
    // };
  });

  public features(data: any) {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }
}

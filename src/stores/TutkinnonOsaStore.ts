import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Perusteet, Sisaltoviitteet, Koodistot, Arviointiasteikot } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, Kieli } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class TutkinnonOsaStore implements IEditoitava {
  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private tutkinnonosaId: number,
    private perusteId: number,
    private versionumero: number,
    private el: any) {
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
      this.getTutkinnonosaViite(),
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

  async getTutkinnonosaViite() {
    if (this.versionumero) {
      const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.tutkinnonosaId, rev.numero, this.koulutustoimijaId);
    }
    else {
      return Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId);
    }
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId, data.tutkinnonosaViite);
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore(rev: number) {
    const restoring = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.tutkinnonosaId, rev, this.koulutustoimijaId)).data;
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId, restoring);
  }

  async revisions() {
    const data = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId)).data;
    return data as Revision[];
  }

  async start() {
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId, this.tutkinnonosaId, this.koulutustoimijaId);
    this.el.$router.push({
      name: 'tutkinnonosat',
    });
  }
  public readonly validator = computed(() => {
    return {};
  });

  public features(data: any) {
    return computed(() => {
      return {
        editable: true,
        removable: true,
        hideable: false,
        recoverable: true,
      } as EditoitavaFeatures;
    });
  }
}

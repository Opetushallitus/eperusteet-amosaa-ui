import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Perusteet, Sisaltoviitteet, Koodistot, Arviointiasteikot, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
import * as _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, Kieli } from '@shared/tyypit';
import { koodiValidator } from '@shared/validators/required';

Vue.use(VueCompositionApi);

export class TutkinnonOsaStore implements IEditoitava {
  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private tutkinnonosaId: number,
    private perusteId: number,
    private versionumero: number,
    private el: any,
    private uusi: boolean) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.uusi;
  }

  async history() {
  }

  async load() {
    let tutkinnonosaViite: any;
    let arviointiasteikot: any;
    let perusteenTutkinnonosaViite;
    let perusteenTutkinnonosa;

    [tutkinnonosaViite, arviointiasteikot] = _.map(await (Promise.all([
      this.getTutkinnonosaViite(),
      Arviointiasteikot.getAllArviointiasteikot(),
    ])), 'data');

    let perusteId = tutkinnonosaViite.peruste ? tutkinnonosaViite.peruste.id : this.perusteId;
    const peruste = (await Perusteet.getPeruste(perusteId)).data;

    if (tutkinnonosaViite.tosa.tyyppi === 'perusteesta') {
      perusteenTutkinnonosaViite = (await Perusteet.getTutkinnonOsaViite(perusteId, 'reformi', tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data;
      perusteenTutkinnonosa = (await Perusteet.getPerusteTutkinnonOsa(perusteId, tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data as any;
      this.setArvioinnit(perusteenTutkinnonosa, arviointiasteikot);
    }
    else {
      this.setArvioinnit(tutkinnonosaViite.tosa.omatutkinnonosa, arviointiasteikot);
    }

    if (tutkinnonosaViite.perusteentutkinnonosa) {
      perusteenTutkinnonosaViite = (await Perusteet.getTutkinnonOsaViite(this.perusteId, 'reformi', tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data;
      perusteenTutkinnonosa = (await Perusteet.getPerusteTutkinnonOsa(this.perusteId, tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data as any;
    }

    const tutkintonimikeKoodit = _.map(await Promise.all(_.chain(peruste.tutkintonimikkeet)
      .map('tutkintonimikeUri')
      .map((tutkintonimikeUri: string) => Koodistot.getKoodistoKoodiByUri(tutkintonimikeUri))
      .value()), 'data');

    return {
      tutkinnonosaViite: {
        ...tutkinnonosaViite,
        tosa: {
          ...tutkinnonosaViite.tosa,
          ...(tutkinnonosaViite.tosa.tyyppi === 'oma' && !_.has(tutkinnonosaViite.tosa, 'omatutkinnonosa') && { omatutkinnonosa: {} }),
        },
      },
      perusteenTutkinnonosaViite,
      perusteenTutkinnonosa,
      omaTutkinnonosa: tutkinnonosaViite.tosa.omatutkinnonosa,
      osaamisalat: peruste.osaamisalat,
      tutkintonimikkeet: tutkintonimikeKoodit,
      arviointiasteikot,
    };
  }

  setArvioinnit(tutkinnonosa, arviointiasteikot) {
    if (tutkinnonosa && tutkinnonosa.geneerinenArviointiasteikko) {
      const arviointiAsteikko = _.keyBy(arviointiasteikot, 'id')[tutkinnonosa.geneerinenArviointiasteikko._arviointiAsteikko];
      const osaamistasot = _.keyBy(arviointiAsteikko.osaamistasot, 'id');
      tutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit = _.map(tutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit, otKriteeri => {
        return {
          ...otKriteeri,
          osaamistaso: osaamistasot[otKriteeri._osaamistaso],
        };
      });
    }
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
    if (data.tutkinnonosaViite.tosa.omatutkinnonosa) {
      data.tutkinnonosaViite.tosa.omatutkinnonosa = data.omaTutkinnonosa;
    }
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

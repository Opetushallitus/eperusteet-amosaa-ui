import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import Vue from 'vue';
import { Perusteet, Sisaltoviitteet, Koodistot, Arviointiasteikot, SisaltoviiteMatalaDto, OmaOsaAlueDtoTyyppiEnum } from '@shared/api/amosaa';
import * as _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, Kieli } from '@shared/tyypit';
import { requiredOneLang } from '@shared/validators/required';
import { Kielet } from '@shared/stores/kieli';

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
    let tutkinnonosaViite: any = {};
    let arviointiasteikot: any = {};
    let perusteenTutkinnonosaViite;
    let perusteenTutkinnonosa;

    [tutkinnonosaViite, arviointiasteikot] = _.map(await (Promise.all([
      this.getTutkinnonosaViite(),
      Arviointiasteikot.getAllArviointiasteikot(),
    ])), 'data');

    if (tutkinnonosaViite.linkattuPeruste) {
      this.perusteId = tutkinnonosaViite.linkattuPeruste;
    }

    const perusteId = tutkinnonosaViite.peruste ? tutkinnonosaViite.peruste.id : this.perusteId;
    const peruste = (await Perusteet.getPeruste(perusteId)).data;

    if (tutkinnonosaViite.tosa.tyyppi === 'perusteesta' || tutkinnonosaViite.perusteentutkinnonosa) {
      try {
        perusteenTutkinnonosaViite = (await Perusteet.getTutkinnonOsaViite(perusteId, 'reformi', tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data;
        perusteenTutkinnonosa = (await Perusteet.getPerusteTutkinnonOsa(perusteId, tutkinnonosaViite.tosa!.perusteentutkinnonosa!)).data as any;
        this.setArvioinnit(perusteenTutkinnonosa, arviointiasteikot);
      }
      catch (e) {
        this.el.$warning('perusteen-tutkinnon-osaa-ei-loydy');
        perusteenTutkinnonosaViite = {};
        perusteenTutkinnonosa = {};
      }
    }
    else {
      this.setArvioinnit(tutkinnonosaViite.tosa.omatutkinnonosa, arviointiasteikot);
    }

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
      omaTutkinnonosa: {
        koodi: null,
        laajuus: null,
        geneerinenarviointi: null,
        ammattitaitovaatimukset: {},
        ammattitaidonOsoittamistavat: null,
        ...tutkinnonosaViite.tosa.omatutkinnonosa,
        arviointi: tutkinnonosaViite.tosa.omatutkinnonosa?.arviointi ? tutkinnonosaViite.tosa.omatutkinnonosa.arviointi : {
          arvioinninKohdealueet: [],
        },
      },
      arviointiasteikot,
    };
  }

  setArvioinnit(tutkinnonosa, arviointiasteikot) {
    const asteikko = _.get(tutkinnonosa, '.geneerinenArviointiasteikko.arviointiAsteikko');
    const asteikkoId = _.get(tutkinnonosa, '.geneerinenArviointiasteikko._arviointiAsteikko');

    if (!asteikko && asteikkoId) {
      const arviointiAsteikko = _.keyBy(arviointiasteikot, 'id')[asteikkoId];
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
    await this.el.updateNavigation();
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
    await this.el.updateNavigation();
    this.el.$router.push({
      name: 'tutkinnonosat',
    });
  }

  public readonly validator = computed(() => {
    return {
      tutkinnonosaViite: {
        tekstiKappale: {
          nimi: {
            ...requiredOneLang(),
          },
        },
        tosa: {
          toteutukset: {
            $each: {
              otsikko: {
                ...requiredOneLang(),
              },
            },
          },
        },
      },
    };
  });

  async copy(data) {
    const kopioituViite = (await Sisaltoviitteet.kopioiLinkattuSisalto(this.opetussuunnitelmaId, this.koulutustoimijaId, data.tutkinnonosaViite.id)).data;
    await this.el.updateNavigation();
    this.el.$router.push({
      name: 'tutkinnonosa',
      params: {
        sisaltoviiteId: kopioituViite.id,
      },
    });
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: data.tutkinnonosaViite.tyyppi !== 'linkki',
        removable: true,
        hideable: false,
        recoverable: data.tutkinnonosaViite.tyyppi !== 'linkki',
        copyable: data.tutkinnonosaViite.tyyppi === 'linkki',
      } as EditoitavaFeatures;
    });
  }

  public static async lisaaOsaAlue(opetussuunnitelmaId, tutkinnonosaId, koulutustoimijaId, el) {
    const sisaltoviite = (await (Sisaltoviitteet.getSisaltoviiteTekstit(opetussuunnitelmaId, tutkinnonosaId, koulutustoimijaId))).data;
    const aiemmatIdt = _.map(sisaltoviite.osaAlueet, 'id');
    sisaltoviite.osaAlueet = [
      ...(sisaltoviite.osaAlueet || []),
      {
        tyyppi: _.toLower(OmaOsaAlueDtoTyyppiEnum.PAIKALLINEN),
        nimi: { [Kielet.getSisaltoKieli.value]: el.$t('nimeton-osa-alue') },
      } as any,
    ];

    await Sisaltoviitteet.updateTekstiKappaleViite(opetussuunnitelmaId, tutkinnonosaId, koulutustoimijaId, sisaltoviite as any);
    return _.get(_.find((await (Sisaltoviitteet.getSisaltoviiteTekstit(opetussuunnitelmaId, tutkinnonosaId, koulutustoimijaId))).data.osaAlueet, osaalue => !_.includes(aiemmatIdt, osaalue.id)), 'id');
  }
}

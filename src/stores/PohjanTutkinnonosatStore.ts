import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, Perusteet, SisaltoViiteKevytDtoTyyppiEnum, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PohjanTutkinnonosatStore {
  private state = reactive({
    tutkinnonosat: null as any[] | null,
    tutkinnonosaLaajuudet: null as any[] | null,
    peruste: null as any | null,
  })

  public readonly tutkinnonosat = computed(() => this.state.tutkinnonosat);
  public readonly peruste = computed(() => this.state.peruste);

  public async fetchPerusteesta(perusteId) {
    this.state.tutkinnonosat = null;
    this.state.peruste = (await Perusteet.getPerusteByPerusteId(perusteId)).data as any;
    const perusteenTutkinnonosaViitteet = _.chain(this.state.peruste.suoritustavat)
      .map(suoritustapa => suoritustapa.tutkinnonOsaViitteet)
      .flatMap()
      .keyBy('_tutkinnonOsa')
      .value();
    this.state.tutkinnonosat = _.map(_.get((await Perusteet.getPerusteByPerusteId(perusteId)).data, 'tutkinnonOsat'), tutkinnonosa => {
      return {
        ...tutkinnonosa,
        laajuus: this.getPerusteenTutkinnonosaViitteenLaajuus(perusteenTutkinnonosaViitteet[tutkinnonosa.id]),
        koodi: tutkinnonosa.koodi.uri,
      };
    });
  }

  public async fetchToteutussuunnitelmasta(koulutustoimijaId, toteutussuunnitelmaId) {
    this.state.tutkinnonosat = null;

    const opetussuunnitelma = (await Opetussuunnitelmat.getOpetussuunnitelma(toteutussuunnitelmaId, koulutustoimijaId)).data;
    const tutkinnonosaViitteetById = _.keyBy((await Sisaltoviitteet.getTutkinnonosat(toteutussuunnitelmaId, koulutustoimijaId)).data, 'id');
    const sisaltoviitteet = (await Sisaltoviitteet.getOtsikot(toteutussuunnitelmaId, koulutustoimijaId)).data;
    const tutkinnonosaViitteet = _.chain(sisaltoviitteet)
      .filter(sisaltoviite => sisaltoviite.tyyppi === _.toLower(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSAT))
      .map(tutkinnonosatViite => tutkinnonosatViite.lapset as any)
      .flatMap()
      .map(tutkinnonosaId => tutkinnonosaViitteetById[tutkinnonosaId])
      .value();

    const perusteIds = _.uniq([
      opetussuunnitelma.peruste!.id,
      ..._.chain(tutkinnonosaViitteet)
        .filter('peruste')
        .map('peruste.id')
        .uniq()
        .value(),
    ]);

    const perusteidenTutkinnonosaViitteet = _.chain(await Promise.all(_.map(perusteIds, perusteId => Perusteet.getTutkinnonOsaViitteet(perusteId, opetussuunnitelma.suoritustapa!))))
      .map('data')
      .flatMap()
      .value();

    const perusteenTutkinnonosaViitteet = _.keyBy(perusteidenTutkinnonosaViitteet, '_tutkinnonOsa');

    this.state.tutkinnonosat = _.map(tutkinnonosaViitteet, tutkinnonosaViite => {
      let laajuus;
      if (perusteenTutkinnonosaViitteet[tutkinnonosaViite.tosa?.perusteentutkinnonosa!]) {
        laajuus = this.getPerusteenTutkinnonosaViitteenLaajuus(perusteenTutkinnonosaViitteet[tutkinnonosaViite.tosa?.perusteentutkinnonosa!]);
      }
      else if (tutkinnonosaViite.tosa?.omatutkinnonosa) {
        laajuus = tutkinnonosaViite.tosa.omatutkinnonosa.laajuus;
      }

      return {
        nimi: tutkinnonosaViite.tekstiKappale?.nimi,
        laajuus,
        koodi: tutkinnonosaViite.tosa?.koodi,
      };
    });
  }

  private getPerusteenTutkinnonosaViitteenLaajuus(perusteenTutkinnonosaViite) {
    const laajuus = _.get(perusteenTutkinnonosaViite, 'laajuus');
    const laajuusMaksimi = _.get(perusteenTutkinnonosaViite, 'laajuusMaksimi');
    return laajuus && laajuusMaksimi ? laajuus + ' - ' + laajuusMaksimi : !laajuus ? laajuusMaksimi : laajuus;
  }
}

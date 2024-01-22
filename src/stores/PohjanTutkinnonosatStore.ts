import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, Perusteet, SisaltoViiteKevytDtoTyyppiEnum, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class PohjanTutkinnonosatStore {
  private state = reactive({
    tutkinnonosat: null as any[] | null,
    peruste: null as any | null,
  });

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
    this.state.tutkinnonosat = _.map(_.get((await Perusteet.getPerusteByPerusteId(perusteId)).data, 'tutkinnonOsat'), (tutkinnonosa: any) => {
      return {
        ...tutkinnonosa,
        laajuus: this.getPerusteenTutkinnonosaViitteenLaajuus(perusteenTutkinnonosaViitteet[tutkinnonosa.id]),
        koodi: tutkinnonosa.koodi.uri,
      };
    });
  }

  private getPerusteenTutkinnonosaViitteenLaajuus(perusteenTutkinnonosaViite) {
    const laajuus = _.get(perusteenTutkinnonosaViite, 'laajuus');
    const laajuusMaksimi = _.get(perusteenTutkinnonosaViite, 'laajuusMaksimi');
    return laajuus && laajuusMaksimi ? laajuus + ' - ' + laajuusMaksimi : !laajuus ? laajuusMaksimi : laajuus;
  }
}

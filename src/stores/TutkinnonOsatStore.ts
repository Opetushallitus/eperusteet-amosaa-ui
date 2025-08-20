import Vue from 'vue';
import { Perusteet, OpetussuunnitelmaDto, SisaltoViiteKevytDto, Opetussuunnitelmat, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';
import { reactive } from 'vue';
import { computed } from 'vue';

export class TutkinnonOsatStore {
  private state = reactive({
    tutkinnonosat: null as any | null,
  });

  public readonly tutkinnonosat = computed(() => this.state.tutkinnonosat);

  public async fetch(toteutussuunnitelmaId: number, koulutustoimijaId: string, perusteId: number) {
    this.state.tutkinnonosat = null;
    const tutkinnonosaViitteet = (await Sisaltoviitteet.getTutkinnonosat(toteutussuunnitelmaId, koulutustoimijaId)).data;
    const perusteIds = [perusteId, ..._.uniq(_.map(_.filter(tutkinnonosaViitteet, 'linkattuPeruste'), 'linkattuPeruste'))];

    let perusteenTutkinnonosaViitteet = {};
    if (_.size(perusteIds) > 0 && _.size(tutkinnonosaViitteet) > 0) {
      perusteenTutkinnonosaViitteet = _.chain(await Promise.all(_.map(perusteIds, async (perusteId) => (await Perusteet.getTutkinnonOsaViitteet(perusteId!, 'reformi')).data as any[])))
        .flatMap()
        .keyBy('_tutkinnonOsa')
        .value();
    }

    this.state.tutkinnonosat = _.map(tutkinnonosaViitteet, (tutkinnonosaViite, index) => {
      return {
        jarjestysnro: index + 1,
        tutkinnonosaViite,
        perusteenTutkinnonosaViite: perusteenTutkinnonosaViitteet[tutkinnonosaViite.tosa!.perusteentutkinnonosa!],
      };
    });
  }
}

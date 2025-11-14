import Vue from 'vue';
import { Perusteet, Sisaltoviitteet, Koodistot, Arviointiasteikot, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
import * as _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, Kieli } from '@shared/tyypit';
import { koodiValidator } from '@shared/validators/required';
import { reactive } from 'vue';
import { computed } from 'vue';

export class PerusteDataStore {
  constructor(private perusteId: number,
              private tutkinnonOsaId: number) {
  }

  private state = reactive({
    loading: true,
    viite: null as any,
    data: null as any,
  });

  public readonly isLoading = computed(() => {
    return this.state.loading;
  });

  async init() {
    // PerusteDataStore.arviointiAsteikot = await Arviointiasteikot.getAllArviointiasteikot();

    // let perusteId = tutkinnonosaViite.peruste;
    // const peruste = (await Perusteet.getPeruste(perusteId)).data;
    this.state.viite = (await Perusteet.getTutkinnonOsaViite(this.perusteId, 'reformi', this.tutkinnonOsaId)).data;
    this.state.data = (await Perusteet.getPerusteTutkinnonOsa(this.perusteId, this.tutkinnonOsaId)).data as any;
    // this.setArvioinnit(perusteenTutkinnonosa, arviointiasteikot);

    // const tutkintonimikeKoodit = _.map(await Promise.all(_.chain(peruste.tutkintonimikkeet)
    //   .map('tutkintonimikeUri')
    //   .map((tutkintonimikeUri: string) => Koodistot.getKoodistoKoodiByUri(tutkintonimikeUri))
    //   .value()), 'data');
    this.state.loading = false;
  }

  // setArvioinnit(tutkinnonosa, arviointiasteikot) {
  //   if (tutkinnonosa && tutkinnonosa.geneerinenArviointiasteikko) {
  //     const arviointiAsteikko = tutkinnonosa.geneerinenArviointiasteikko.arviointiAsteikko;
  //     const osaamistasot = _.keyBy(arviointiAsteikko.osaamistasot, 'id');
  //     tutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit = _.map(tutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit, otKriteeri => {
  //       return {
  //         ...otKriteeri,
  //         osaamistaso: osaamistasot[otKriteeri._osaamistaso],
  //       };
  //     });
  //   }
  // }
}

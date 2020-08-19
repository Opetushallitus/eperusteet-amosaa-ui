import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, OpetussuunnitelmaDto, Sisaltoviitteet, PageSisaltoviiteLaajaDto, Perusteet, SisaltoviiteLaajaDto } from '@shared/api/amosaa';
import { Debounced } from '@shared/utils/delay';
import { perusteenSuoritustapa } from '@shared/utils/perusteet';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class TutkinnonosatTuontiStore {
  public state = reactive({
    toteutussuunnitelmat: null as OpetussuunnitelmaDto[] | null,
    tutkinnonosatPage: null as Page<SisaltoviiteLaajaDto> | null,
  })

  constructor(private opetusuunnitelmaId: number, private koulutustoimijaId: string) {
  }

  public readonly tutkinnonosatPage = computed(() => this.state.tutkinnonosatPage);
  public readonly toteutussuunnitelmat = computed(() => this.state.toteutussuunnitelmat);

  public async fetchOpetussuunnitelmat() {
    this.state.toteutussuunnitelmat = (await Opetussuunnitelmat.getKoulutustoimijaOpetussuunnitelmat(this.koulutustoimijaId)).data;
  }

  @Debounced(300)
  public async fetch(query) {
    this.state.tutkinnonosatPage = null;
    const sisaltoviitteet = (await Sisaltoviitteet.getSisaltoviitteet(this.opetusuunnitelmaId, this.koulutustoimijaId, undefined, { params: query })).data as Page<SisaltoviiteLaajaDto>;

    const perusteIdt = _.chain(_.get(sisaltoviitteet, 'data'))
      .map(tutkinnonosa => {
        if (tutkinnonosa.peruste) {
          return tutkinnonosa.peruste.id;
        }
        return tutkinnonosa.opetussuunnitelma!.peruste!.id;
      })
      .uniq()
      .value();

    const perusteetById = _.keyBy(_.map(await Promise.all(_.chain(perusteIdt)
      .map(async (perusteId) => (
        {
          perusteId,
          peruste: await Perusteet.getPeruste(perusteId!),
        }
      ))
      .value()
    ), perusteData => ({ ...perusteData, peruste: _.get(perusteData.peruste, 'data') })), 'perusteId');

    const perusteidentutkinnonosatByTutkinnonosa = _.keyBy(await Promise.all(_.map(_.get(sisaltoviitteet, 'data'), async (tutkinnonosa) => {
      let perusteId = tutkinnonosa.opetussuunnitelma!.peruste!.id;
      if (tutkinnonosa.peruste) {
        perusteId = tutkinnonosa.peruste.id;
      }
      const peruste = perusteetById[perusteId!];

      try {
        return _.get(await Perusteet.getTutkinnonOsaViite(perusteId!, _.toLower(perusteenSuoritustapa(peruste.peruste)), tutkinnonosa.tosa!.perusteentutkinnonosa!), 'data');
      }
      catch (e) {
        return null;
      }
    })), '_tutkinnonOsa');

    this.state.tutkinnonosatPage = {
      ...sisaltoviitteet,
      data: _.map(_.get(sisaltoviitteet, 'data'), tutkinnonosa => ({
        ...tutkinnonosa,
        perusteenTutkinnonosa: perusteidentutkinnonosatByTutkinnonosa[tutkinnonosa.tosa!.perusteentutkinnonosa!],
      })),
    } as any;
  }

  public async tuoSisaltoa(sisaltoIdt: number[]) {
    await Sisaltoviitteet.copyMultipleSisaltoviite(this.opetusuunnitelmaId, this.koulutustoimijaId, sisaltoIdt);
  }

  clear() {
    this.state.toteutussuunnitelmat = null;
    this.state.tutkinnonosatPage = null;
  }
}

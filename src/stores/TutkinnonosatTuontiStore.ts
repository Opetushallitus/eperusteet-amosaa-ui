import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, OpetussuunnitelmaDto, Sisaltoviitteet, Perusteet, SisaltoviiteLaajaDto, OpetussuunnitelmaDtoTilaEnum } from '@shared/api/amosaa';
import { Debounced } from '@shared/utils/delay';
import { AmmatillisetKoulutustyypit, perusteenSuoritustapa } from '@shared/utils/perusteet';
import * as _ from 'lodash';
import { Page } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class TutkinnonosatTuontiStore {
  public state = reactive({
    toteutussuunnitelmat: null as OpetussuunnitelmaDto[] | null,
    tutkinnonosatPage: null as Page<SisaltoviiteLaajaDto> | null,
  });

  public readonly tutkinnonosatPage = computed(() => this.state.tutkinnonosatPage);
  public readonly toteutussuunnitelmat = computed(() => this.state.toteutussuunnitelmat);

  public async fetchOpetussuunnitelmat(koulutustoimijaId: string) {
    this.state.toteutussuunnitelmat = (await Opetussuunnitelmat.getKoulutustoimijaOpetussuunnitelmat(
      AmmatillisetKoulutustyypit,
      [OpetussuunnitelmaDtoTilaEnum.LUONNOS, OpetussuunnitelmaDtoTilaEnum.VALMIS, OpetussuunnitelmaDtoTilaEnum.JULKAISTU],
      koulutustoimijaId,
    )).data;
  }

  @Debounced(300)
  public async fetch(toteutussuunnitelmaId: number, koulutustoimijaId: string, query) {
    this.state.tutkinnonosatPage = null;
    const sisaltoviitteet = (await Sisaltoviitteet.getSisaltoviitteet(toteutussuunnitelmaId, koulutustoimijaId, { params: query })).data as Page<SisaltoviiteLaajaDto>;

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
      .value(),
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

  public async tuoSisaltoa(toteutussuunnitelmaId: number, koulutustoimijaId: string, sisaltoIdt: number[]) {
    await Sisaltoviitteet.linkkaaUusiSisalto(toteutussuunnitelmaId, koulutustoimijaId, sisaltoIdt);
  }

  clear() {
    this.state.toteutussuunnitelmat = null;
    this.state.tutkinnonosatPage = null;
  }
}

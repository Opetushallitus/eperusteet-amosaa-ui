import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import { Sisaltoviitteet, SisaltoViiteDto, Perusteet, SisaltoViiteDtoTyyppiEnum, SisaltoviiteLukko } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { ILukko, Revision } from '@shared/tyypit';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';

Vue.use(VueCompositionApi);

export class SuorituspolutStore extends AbstractSisaltoviiteStore implements IEditoitava {
  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    private perusteId: number,
    private opsSuoritustapa: string,
    public versionumero: number) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero);
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    const perusteRakenteet = (await Perusteet.getPerusteRakenteet(this.perusteId)).data as any;
    const suorituspolkuViitteet = (await Sisaltoviitteet.getSuorituspolut(this.opetussuunnitelmaId, this.koulutustoimijaId)).data;
    const suorituspolkuViiteRoot = await this.fetchSisaltoviite();

    const suoritustapa = this.suoritustapa(perusteRakenteet, this.opsSuoritustapa);
    const perusteLaajuus = _.get(suoritustapa, 'rakenne.muodostumisSaanto.laajuus');

    return {
      suorituspolkuViitteet: _.map(suorituspolkuViitteet, suorituspolkuViite => {
        return {
          ...suorituspolkuViite,
          laajuus: this.laajuus(suorituspolkuViite, perusteLaajuus),
        };
      }),
      suorituspolkuViiteRoot,
    };
  }

  suoritustapa(perusteRakenteet, opsSuoritustapa) {
    if (_.size(perusteRakenteet) === 1) {
      return _.head(perusteRakenteet);
    }

    return _.find(perusteRakenteet, { suoritustapakoodi: opsSuoritustapa });
  }

  laajuus(suorituspolkuViite: SisaltoViiteDto, perusteLaajuus) {
    if (suorituspolkuViite.tyyppi === _.toLower(SisaltoViiteDtoTyyppiEnum.OSASUORITUSPOLKU)) {
      return suorituspolkuViite.suorituspolku!.osasuorituspolkuLaajuus;
    }

    return perusteLaajuus.minimi !== perusteLaajuus.maksimi ? perusteLaajuus.minimi + ' - ' + perusteLaajuus.maksimi : perusteLaajuus.minimi;
  }

  async save(data) {
    await this.saveSisaltoviite(data.suorituspolkuViiteRoot);
  }

  async start() {
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
        lockable: true,
      } as EditoitavaFeatures;
    });
  }
}

import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Sisaltoviitteet, SisaltoViiteKevytDto, SisaltoViiteRakenneDto, SisaltoViiteKevytDtoTyyppiEnum } from '@shared/api/amosaa';
import { Toteutus } from '@/utils/toteutustypes';

Vue.use(VueCompositionApi);

const ToteutusPerusrakenneOtsikko = {
  [Toteutus.AMMATILLINEN]: 'tekstikappaleet',
  [Toteutus.VAPAASIVISTYSTYO]: 'rakenne',
  [Toteutus.TUTKINTOONVALMENTAVA]: 'rakenne',
};

export class RakenneStore implements IEditoitava {
  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private updateNavigation: Function,
    private toteutus: Toteutus,
  ) {
  }

  async cancel() {
  }

  async editAfterLoad() {
    return true;
  }

  async history() {
  }

  async load() {
    const otsikot = (await Sisaltoviitteet.getOtsikot(this.opetussuunnitelmaId, this.koulutustoimijaId)).data;
    const root = _.find(otsikot, otsikko => _.isNil(_.get(otsikko, '_vanhempi'))) as SisaltoViiteRakenneDto;
    const rakenne = _.map(this.lapsetRakenteesta(otsikot, root.lapset), sisaltoviite => this.sisaltoviiteLapsilla(sisaltoviite, otsikot));
    return {
      otsikot,
      rakenne,
    };
  }

  sisaltoviiteLapsilla(sisaltoviite, rakenteet) {
    return {
      ...sisaltoviite,
      lapset: _.chain(sisaltoviite.lapset)
        .map(sisaltoviite => this.sisaltoviiteLapsilla(_.find(rakenteet, { id: _.toNumber(sisaltoviite) }), rakenteet))
        .value(),
    };
  }

  lapsetRakenteesta(otsikot, lapset, tyypit?: SisaltoViiteKevytDtoTyyppiEnum[]) {
    return _.chain(lapset)
      .map(lapsi => _.find(otsikot, { id: _.toNumber(lapsi) }))
      .filter(rakenne => (!tyypit || _.includes(_.map(tyypit, tyyppi => _.toLower(tyyppi)), rakenne!.tyyppi)) && _.isObject(rakenne!.tekstiKappale))
      .value();
  }

  async save(data: any) {
    const root = _.find(data.otsikot, otsikko => _.isNil(otsikko._vanhempi)) as SisaltoViiteRakenneDto;
    root.lapset = data.rakenne;
    await Sisaltoviitteet.updateSisaltoViiteRakenne(this.opetussuunnitelmaId, root.id!, this.koulutustoimijaId, root);
    await this.updateNavigation();
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        recoverable: false,
        lockable: false,
      } as EditoitavaFeatures;
    });
  }
}

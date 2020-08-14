import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Sisaltoviitteet, SisaltoViiteKevytDto, SisaltoViiteRakenneDto, SisaltoViiteKevytDtoTyyppiEnum } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class RakenneStore implements IEditoitava {
  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private updateNavigation: Function,
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

    const tekstikappaleet = _.map(this.lapsetRakenteesta(otsikot, root.lapset, SisaltoViiteKevytDtoTyyppiEnum.TEKSTIKAPPALE),
      tekstikappale => this.tekstikappaleLapsilla(tekstikappale, otsikot));

    const suorituspolutRoot = _.find(otsikot, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLUT) as any });
    const suorituspolut = [
      ...this.lapsetRakenteesta(otsikot, suorituspolutRoot?.lapset),
      ...this.lapsetRakenteesta(otsikot, root?.lapset, SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLKU),
      ...this.lapsetRakenteesta(otsikot, root?.lapset, SisaltoViiteKevytDtoTyyppiEnum.OSASUORITUSPOLKU),
    ];

    const tutkinnonosatRoot = _.find(otsikot, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSAT) as any });
    const tutkinnonosat = [
      ...this.lapsetRakenteesta(otsikot, tutkinnonosatRoot?.lapset),
      ...this.lapsetRakenteesta(otsikot, root?.lapset, SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA),
    ];

    return {
      otsikot,
      rakenteet: [{
        otsikko: 'tekstikappaleet',
        sisalto: tekstikappaleet,
        lapset: 'lapset',

      }, {
        otsikko: 'suorituspolut',
        sisalto: suorituspolut,

      }, {
        otsikko: 'tutkinnonosat',
        sisalto: tutkinnonosat,
      }],
    };
  }

  tekstikappaleLapsilla(tekstikappale, rakenteet) {
    return {
      ...tekstikappale,
      lapset: _.chain(tekstikappale.lapset)
        .map(tekstikappale => this.tekstikappaleLapsilla(_.find(rakenteet, { id: _.toNumber(tekstikappale) }), rakenteet))
        .value(),
    };
  }

  lapsetRakenteesta(otsikot, lapset, tyyppi?: SisaltoViiteKevytDtoTyyppiEnum) {
    return _.chain(lapset)
      .map(lapsi => _.find(otsikot, { id: _.toNumber(lapsi) }))
      .filter(rakenne => (!tyyppi || rakenne!.tyyppi as any === _.toLower(tyyppi)) && _.isObject(rakenne!.tekstiKappale))
      .value();
  }

  async save(data: any) {
    const root = _.find(data.otsikot, otsikko => _.isNil(otsikko._vanhempi)) as SisaltoViiteRakenneDto;

    const suorituspolut = _.find(data.otsikot, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLUT) as any }) as SisaltoViiteRakenneDto;
    const tutkinnonosat = _.find(data.otsikot, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSAT) as any }) as SisaltoViiteRakenneDto;

    root.lapset = [
      {
        ...suorituspolut,
        lapset: _.get(_.find(data.rakenteet, { otsikko: 'suorituspolut' }), 'sisalto'),
      },
      {
        ...tutkinnonosat,
        lapset: _.get(_.find(data.rakenteet, { otsikko: 'tutkinnonosat' }), 'sisalto'),
      },
      ..._.get(_.find(data.rakenteet, { otsikko: 'tekstikappaleet' }), 'sisalto'),
    ];

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

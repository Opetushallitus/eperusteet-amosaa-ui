import { EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { SisaltoEditStore } from './SisaltoEditStore';
import _ from 'lodash';
import { Sisaltoviitteet } from '@shared/api/amosaa';
import { computed } from 'vue';

export class OsaAlueStore extends SisaltoEditStore {
  constructor(
    opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoViiteId: number,
    perusteId: number,
    versionumero: number,
    uusi: boolean,
    private osaAlueId: number) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoViiteId, perusteId, versionumero, uusi);
  }

  public features(data: any) {
    const osaAlue = _.find(data.osaAlueet, { id: this.osaAlueId });
    return computed(() => {
      return {
        editable: data.tyyppi !== 'linkki',
        removable: data.tyyppi !== 'linkki' && osaAlue?.tyyppi === 'paikallinen',
        hideable: data.tyyppi !== 'linkki' && osaAlue?.tyyppi !== 'paikallinen',
        isHidden: osaAlue?.piilotettu,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }

  async remove(data) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, {
      ...data,
      osaAlueet: _.filter(data.osaAlueet, osaAlue => osaAlue.id !== this.osaAlueId),
    });
    OsaAlueStore.config.router.push({
      name: 'tutkinnonosa',
      params: {
        sisaltoviiteId: this.sisaltoViiteId,
      },
    });

    await OsaAlueStore.config.updateNavigation();
  }

  async hide(data) {
    data.osaAlueet = _.map(data.osaAlueet, osaAlue => {
      return {
        ...osaAlue,
        piilotettu: osaAlue.id === this.osaAlueId ? true : osaAlue.piilotettu,
      };
    });
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, data);
  }

  async unHide(data) {
    data.osaAlueet = _.map(data.osaAlueet, osaAlue => {
      return {
        ...osaAlue,
        piilotettu: osaAlue.id === this.osaAlueId ? false : osaAlue.piilotettu,
      };
    });
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, data);
  }
}

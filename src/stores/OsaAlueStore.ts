import { EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from '@vue/composition-api';
import { SisaltoEditStore } from './SisaltoEditStore';
import _ from 'lodash';
import { Sisaltoviitteet } from '@shared/api/amosaa';

export class OsaAlueStore extends SisaltoEditStore {
  constructor(
    opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoViiteId: number,
    perusteId: number,
    versionumero: number,
    el: any,
    uusi: boolean,
    private osaAlueId: number) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoViiteId, perusteId, versionumero, el, uusi);
  }

  public features(data: any) {
    const osaAlue = _.find(data.osaAlueet, { id: this.osaAlueId });
    return computed(() => {
      return {
        editable: true,
        removable: osaAlue?.tyyppi === 'paikallinen',
        hideable: osaAlue?.tyyppi !== 'paikallinen',
        isHidden: osaAlue.piilotettu,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }

  async remove(data) {
    data.osaAlueet = _.filter(data.osaAlueet, osaAlue => osaAlue.id !== this.osaAlueId);
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, data);
    this.el.$router.push({
      name: 'tutkinnonosa',
      params: {
        sisaltoviiteId: this.sisaltoViiteId,
      },
    });
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

import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko, Koulutustyyppi } from '@shared/tyypit';
import { Computed } from '@shared/utils/interfaces';
import { TekstikappaleStore } from './TekstikappaleStore';

Vue.use(VueCompositionApi);

export class TuvaTekstikappaleStore extends TekstikappaleStore {
  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public versionumero: number,
    public el: any,
    public updateNavigation: Function,
    public opetussuunnitelma: Computed<OpetussuunnitelmaDto>,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, el, updateNavigation, opetussuunnitelma);
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: this.opetussuunnitelma.value?.tyyppi !== 'opspohja' || !data?.perusteteksti,
        removable: !data?.pohjanTekstikappale?.teksti,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }
}

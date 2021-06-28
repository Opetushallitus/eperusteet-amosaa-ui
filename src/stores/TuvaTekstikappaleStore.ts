import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Computed } from '@shared/utils/interfaces';
import { TekstikappaleStore, ITekstikappale } from './TekstikappaleStore';

Vue.use(VueCompositionApi);

export class TuvaTekstikappaleStore extends TekstikappaleStore implements ITekstikappale {
  constructor(
    public opetussuunnitelmaId?: number,
    public koulutustoimijaId?: string,
    public sisaltoviiteId?: number,
    public versionumero?: number,
    public el?: any,
    public updateNavigation?: Function,
    public opetussuunnitelma?: Computed<OpetussuunnitelmaDto>,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, el, updateNavigation, opetussuunnitelma);
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: this.opetussuunnitelma!.value?.tyyppi !== 'opspohja' || !data?.perusteteksti,
        removable: !data?.pohjanTekstikappale?.teksti,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }

  create(opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoviiteId: number,
    versionumero: number,
    el: any,
    updateNavigation: Function,
    opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
    return new TuvaTekstikappaleStore(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, el, updateNavigation, opetussuunnitelma);
  }
}

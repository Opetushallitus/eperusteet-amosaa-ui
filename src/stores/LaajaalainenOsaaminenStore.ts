import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';

Vue.use(VueCompositionApi);

export class LaajaalainenOsaaminenStore extends AbstractSisaltoviiteStore implements IEditoitava {
  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public versionumero: number,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero);
  }

  async load() {
    return this.fetchSisaltoviite();
  }

  async editAfterLoad() {
    return false;
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: false,
        removable: true,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }
}

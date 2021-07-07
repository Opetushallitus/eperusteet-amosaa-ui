import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';
import { Computed } from '@shared/utils/interfaces';
import { OpetussuunnitelmaDto, Sisaltoviitteet } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class LaajaalainenOsaaminenStore extends AbstractSisaltoviiteStore implements IEditoitava {
  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public versionumero: number,
    public opetussuunnitelma: Computed<OpetussuunnitelmaDto>,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero);
  }

  async load() {
    return this.fetchSisaltoviite();
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!, data);
  }

  async editAfterLoad() {
    return false;
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: this.opetussuunnitelma!.value?.tyyppi !== 'opspohja',
        removable: true,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }
}

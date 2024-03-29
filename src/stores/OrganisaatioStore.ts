import _ from 'lodash';
import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';

import { Koulutustoimijat, KoulutustoimijaDto } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';

Vue.use(VueCompositionApi);

export class OrganisaatioStore implements IEditoitava {
  constructor(
    private koulutustoimijaId: string,
  ) {}

  async load() {
    return (await Koulutustoimijat.getKoulutustoimija(this.koulutustoimijaId)).data;
  }

  async save(data: any) {
    return Koulutustoimijat.updateKoulutustoimija(_.toString(data.id), data);
  }

  async editAfterLoad() {
    return false;
  }
}

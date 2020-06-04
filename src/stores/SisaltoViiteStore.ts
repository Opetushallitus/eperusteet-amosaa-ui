import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { SisaltoViiteKevytDto, Sisaltoviitteet, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';

Vue.use(VueCompositionApi);

export class SisaltoViiteStore {
  private state = reactive({
    sisaltoviitteet: null as SisaltoViiteKevytDto[] | null,
  })

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly sisaltoviitteet = computed(() => this.state.sisaltoviitteet);
  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    if (this.opetussuunnitelma.value) {
      this.state.sisaltoviitteet = null;
      this.state.sisaltoviitteet = (await Sisaltoviitteet.getOtsikot(this.opetussuunnitelma.value.id, _.toString(this.opetussuunnitelma.value.koulutustoimija.id))).data;
    }
  });
}

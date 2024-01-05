import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { SisaltoViiteKevytDto, Sisaltoviitteet, OpetussuunnitelmaDto, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';

Vue.use(VueCompositionApi);

export class SisaltoViiteStore {
  private state = reactive({
    sisaltoviitteet: null as SisaltoViiteKevytDto[] | null,
  });

  public readonly sisaltoviitteet = computed(() => this.state.sisaltoviitteet);

  async fetch(opetussuunnitelmaId: number, koulutustoimijaId: string) {
    this.state.sisaltoviitteet = null;
    this.state.sisaltoviitteet = (await Sisaltoviitteet.getOtsikot(opetussuunnitelmaId, koulutustoimijaId)).data;
  }

  public static async add(opsId: number, svId: number, ktId: string, sisaltoviite: SisaltoviiteMatalaDto, el: any, updateNavigation: Function) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, sisaltoviite)).data;
    await updateNavigation();

    el.$router.push({
      name: _.toLower(sisaltoviite.tyyppi),
      params: {
        sisaltoviiteId: '' + added.id,
      },
      query: {
        uusi: true,
      },
    });
  }
}

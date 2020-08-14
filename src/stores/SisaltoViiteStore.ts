import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { SisaltoViiteKevytDto, Sisaltoviitteet, OpetussuunnitelmaDto, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
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
    this.state.sisaltoviitteet = null;
    if (this.opetussuunnitelma.value) {
      this.state.sisaltoviitteet = (await Sisaltoviitteet.getOtsikot(this.opetussuunnitelma.value.id, _.toString(this.opetussuunnitelma.value.koulutustoimija.id))).data;
    }
  });

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

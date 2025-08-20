import Vue from 'vue';
import { SisaltoViiteKevytDto, Sisaltoviitteet, OpetussuunnitelmaDto, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { reactive } from 'vue';
import { computed } from 'vue';
import { App } from 'vue';

export interface SisaltoViiteStoreConfig {
  router: any;
  updateNavigation: () => Promise<void>;
}

export class SisaltoViiteStore {
  private state = reactive({
    sisaltoviitteet: null as SisaltoViiteKevytDto[] | null,
  });

  public static install(app: App, config: SisaltoViiteStoreConfig) {
    SisaltoViiteStore.config = config;
  }

  public static config: SisaltoViiteStoreConfig;

  public readonly sisaltoviitteet = computed(() => this.state.sisaltoviitteet);

  async fetch(opetussuunnitelmaId: number, koulutustoimijaId: string) {
    this.state.sisaltoviitteet = null;
    this.state.sisaltoviitteet = (await Sisaltoviitteet.getOtsikot(opetussuunnitelmaId, koulutustoimijaId)).data;
  }

  public static async add(opsId: number, svId: number, ktId: string, sisaltoviite: SisaltoviiteMatalaDto) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, sisaltoviite)).data;
    await SisaltoViiteStore.config.updateNavigation();

    SisaltoViiteStore.config.router.push({
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

import _ from 'lodash';
import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { TiedoteDto } from '@shared/api/eperusteet';
import { ITiedotteetProvider } from '@shared/stores/types';
import { TiedoteQuery } from '@shared/api/types';
import { Ulkopuoliset } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class TiedotteetStore implements ITiedotteetProvider {
  private state = reactive({
    options: null as TiedoteQuery | null,
    tiedotteet: null as TiedoteDto[] | null,
    kokonaismaara: null as number | null,
    isLoading: true,
  });

  public readonly tiedotteet = computed(() => this.state.tiedotteet);
  public readonly kokonaismaara = computed(() => this.state.kokonaismaara);
  public readonly options = computed(() => this.state.options);
  public readonly isLoading = computed(() => this.state.isLoading);

  async init(options: TiedoteQuery) {
    this.state.options = options;
    this.fetch();
  }

  public async changePage(sivu) {
    if (this.state.options) {
      this.state.options!.sivu = sivu;
      await this.fetch();
    }
  }

  public async changeLang(kieli) {
    if (this.state.options) {
      this.state.options!.sivu = 0;
      this.state.options!.kieli = kieli;
      await this.fetch();
    }
  }

  public async changeNimiFilter(nimi) {
    if (this.state.options) {
      this.state.options!.nimi = nimi;
      await this.fetch();
    }
  }

  public async fetch() {
    this.state.isLoading = true;
    this.state.tiedotteet = null;
    const res = (await Ulkopuoliset.getTiedotteetHaku(
      this.state.options!.sivu,
      this.state.options!.sivukoko,
      this.state.options!.kieli,
      this.state.options!.nimi,
      this.state.options!.perusteId,
      this.state.options!.perusteeton,
      this.state.options!.julkinen,
      this.state.options!.yleinen,
      this.state.options!.perusteIds,
      this.state.options!.tiedoteJulkaisuPaikka,
      this.state.options!.koulutusTyyppi,
    )).data;
    this.state.tiedotteet = (res as any).data;
    this.state.kokonaismaara = (res as any).kokonaismäärä;
    this.state.isLoading = false;
  }
}

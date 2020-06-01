import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { OpetussuunnitelmaMuokkaustietoDto, Muokkaustiedot } from '@shared/api/amosaa';
import { IMuokkaustietoProvider } from '@shared/components/EpViimeaikainenToiminta/types';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class MuokkaustietoStore implements IMuokkaustietoProvider {
  private state = reactive({
    muokkaustiedot: null as OpetussuunnitelmaMuokkaustietoDto[] | null,
    viimeinenHaku: null as OpetussuunnitelmaMuokkaustietoDto[] | null,
    ktId: null as number | null,
    opsId: null as number | null,
    hakuLukumaara: 8 as number,
  });

  async init(ktId: number, opsId: number) {
    this.state.ktId = ktId;
    this.state.opsId = opsId;
    this.state.muokkaustiedot = null;
    await this.update();
  }

  public readonly muokkaustiedot = computed(() => this.state.muokkaustiedot);
  public readonly viimeinenHaku = computed(() => this.state.viimeinenHaku);
  public readonly hakuLukumaara = computed(() => this.state.hakuLukumaara);

  public async update() {
    if (this.state.ktId && this.state.opsId) {
      if (this.state.muokkaustiedot && !_.isEmpty(this.state.muokkaustiedot)) {
        this.state.viimeinenHaku = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(this.state.ktId, this.state.opsId, (_.last(this.state.muokkaustiedot) as any).luotu, this.state.hakuLukumaara) as any).data;

        if (this.state.viimeinenHaku) {
          this.state.muokkaustiedot = [
            ...this.state.muokkaustiedot,
            ...this.state.viimeinenHaku,
          ];
        }
      }
      else {
        this.state.muokkaustiedot = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(this.state.ktId, this.state.opsId, undefined, this.state.hakuLukumaara) as any).data;
      }
    }
  }
}

import Vue from 'vue';
import VueCompositionApi, { reactive, computed, watch } from '@vue/composition-api';
import { OpetussuunnitelmaMuokkaustietoDto, Muokkaustiedot, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { IMuokkaustietoProvider } from '@shared/components/EpViimeaikainenToiminta/types';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { delay } from '@shared/utils/delay';

Vue.use(VueCompositionApi);

export class MuokkaustietoStore implements IMuokkaustietoProvider {
  private state = reactive({
    muokkaustiedot: null as OpetussuunnitelmaMuokkaustietoDto[] | null,
    viimeinenHaku: null as OpetussuunnitelmaMuokkaustietoDto[] | null,
    hakuLukumaara: 8 as number,
  });

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.muokkaustiedot = null;
    if (this.opetussuunnitelma.value) {
      await this.update();
    }
  });

  public readonly muokkaustiedot = computed(() => this.state.muokkaustiedot);
  public readonly viimeinenHaku = computed(() => this.state.viimeinenHaku);
  public readonly hakuLukumaara = computed(() => this.state.hakuLukumaara);

  public async refetch() {
    this.state.muokkaustiedot = null;
    await this.update();
  }

  public async update() {
    if (this.opetussuunnitelma.value.koulutustoimija.id && this.opetussuunnitelma.value.id) {
      if (this.state.muokkaustiedot && !_.isEmpty(this.state.muokkaustiedot)) {
        this.state.viimeinenHaku = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(this.opetussuunnitelma.value.koulutustoimija.id, this.opetussuunnitelma.value.id, (_.last(this.state.muokkaustiedot) as any).luotu, this.state.hakuLukumaara) as any).data;

        if (this.state.viimeinenHaku) {
          this.state.muokkaustiedot = [
            ...this.state.muokkaustiedot,
            ...this.state.viimeinenHaku,
          ];
        }
      }
      else {
        this.state.muokkaustiedot = (await Muokkaustiedot.getPerusteenMuokkausTiedotWithLuomisaika(this.opetussuunnitelma.value.koulutustoimija.id, this.opetussuunnitelma.value.id, undefined, this.state.hakuLukumaara) as any).data;
      }
    }
  }
}

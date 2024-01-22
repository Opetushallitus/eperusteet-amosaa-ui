import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Opetussuunnitelmat, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Page } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class OpetussuunnitelmatStore {
  private state = reactive({
    opetussuunnitelmat: null as Page<OpetussuunnitelmaDto> | null,
    julkaistutOpetussuunnitelmat: null as Page<OpetussuunnitelmaDto> | null,
    ystavienOpetussuunnitelmat: null as OpetussuunnitelmaDto[] | null,
    arkistoidutOpetussuunnitelmat: null as OpetussuunnitelmaDto[] | null,
  });

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);
  public readonly julkaistutOpetussuunnitelmat = computed(() => this.state.julkaistutOpetussuunnitelmat);
  public readonly ystavienOpetussuunnitelmat = computed(() => this.state.ystavienOpetussuunnitelmat);
  public readonly arkistoidutOpetussuunnitelmat = computed(() => this.state.arkistoidutOpetussuunnitelmat);

  public async init(ktId, query, admin) {
    this.state.opetussuunnitelmat = null;
    this.state.julkaistutOpetussuunnitelmat = null;
    this.state.ystavienOpetussuunnitelmat = null;
    this.state.arkistoidutOpetussuunnitelmat = null;

    await Promise.all([
      this.fetchKeskeneraiset(ktId, query),
      this.fetchJulkaistut(ktId, query),
      this.fetchPoistetut(ktId, query),
      ...(!admin ? this.fetchYstavien(ktId, query) : []) as any,
    ]);
  }

  public async fetchKeskeneraiset(ktId, query: any) {
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getKaikkiOpetussuunnitelmat(ktId, undefined, { params: { ...query, julkaistuTaiValmis: false, sivukoko: 9 } })).data as Page<OpetussuunnitelmaDto>;
  }

  public async fetchPoistetut(ktId, query: any) {
    this.state.arkistoidutOpetussuunnitelmat = ((await Opetussuunnitelmat.getKaikkiOpetussuunnitelmat(ktId, undefined, { params: { ...query, poistunut: true, sivukoko: 999, sivu: 0 } })).data as Page<OpetussuunnitelmaDto>).data;
  }

  public async fetchJulkaistut(ktId, query: any) {
    this.state.julkaistutOpetussuunnitelmat = (await Opetussuunnitelmat.getKaikkiOpetussuunnitelmat(ktId, undefined, { params: { ...query, julkaistuTaiValmis: true, sivukoko: 10 } })).data as Page<OpetussuunnitelmaDto>;
  }

  public async fetchYstavien(ktId, query: any) {
    this.state.ystavienOpetussuunnitelmat = (await Opetussuunnitelmat.getAllOtherOrgsOpetussuunnitelmat(ktId, query.koulutustyypit)).data;
  }
}

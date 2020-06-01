import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Tapahtuma } from '@shared/utils/aikataulu';
import _ from 'lodash';
import { Aikataulut, OpetussuunnitelmaAikatauluDto } from '@shared/api/amosaa';

Vue.use(VueCompositionApi);

export class AikatauluStore {
  private state = reactive({
    aikataulutapahtumat: null as OpetussuunnitelmaAikatauluDto[] | null,
    koulutustoimijaId: null as number | null,
    toteutussuunnitelmaId: null as number | null,
  })

  public readonly aikataulutapahtumat = computed(() => this.state.aikataulutapahtumat);

  async init(koulutustoimijaId:number, toteutussuunnitelmaId: number) {
    this.state.koulutustoimijaId = koulutustoimijaId;
    this.state.toteutussuunnitelmaId = toteutussuunnitelmaId;
    this.state.aikataulutapahtumat = (await Aikataulut.getOpetussuunnitelmanAikataulut(this.state.koulutustoimijaId, toteutussuunnitelmaId)).data;
  }

  async saveAikataulut(aikataulut: Tapahtuma[]) {
    const tallennetut = await Aikataulut.updateOpetussuunnitelmanAikataulut(this.state.koulutustoimijaId!, this.state.toteutussuunnitelmaId!, aikataulut as any);
    this.state.aikataulutapahtumat = tallennetut.data;
  }
}

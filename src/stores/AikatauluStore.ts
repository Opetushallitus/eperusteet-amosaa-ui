import Vue from 'vue';
import { Tapahtuma } from '@shared/utils/aikataulu';
import _ from 'lodash';
import { Aikataulut, OpetussuunnitelmaAikatauluDto, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Computed } from '@shared/utils/interfaces';
import { reactive } from 'vue';
import { computed } from 'vue';
import { watch } from 'vue';

export class AikatauluStore {
  private state = reactive({
    aikataulutapahtumat: null as OpetussuunnitelmaAikatauluDto[] | null,
  });

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly aikataulutapahtumat = computed(() => this.state.aikataulutapahtumat);
  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    this.state.aikataulutapahtumat = null;
    if (this.opetussuunnitelma.value) {
      this.state.aikataulutapahtumat = (await Aikataulut.getOpetussuunnitelmanAikataulut(this.opetussuunnitelma.value.koulutustoimija.id, this.opetussuunnitelma.value.id)).data;
    }
  });

  async saveAikataulut(aikataulut: Tapahtuma[]) {
    const tallennetut = await Aikataulut.updateOpetussuunnitelmanAikataulut(this.opetussuunnitelma.value.koulutustoimija.id, this.opetussuunnitelma.value.id, aikataulut as any);
    this.state.aikataulutapahtumat = tallennetut.data;
  }
}

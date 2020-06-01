<template>
  <div class="content">

    <div class="d-flex justify-content-between">
      <h3>{{$t('aikataulu')}}</h3>
      <ep-aikataulu-modal ref="aikataulumodal" :rootModel="toteutussuunnitelma" :aikataulut="aikataulut" @tallenna="tallenna">
        <span slot="luomispaiva-topic" v-html="$t('suunnitelman-luomispaiva-br')"></span>
        <span slot="julkaisupaiva-topic" v-html="$t('suunnitelma-astuu-voimaan-br')"></span>
      </ep-aikataulu-modal>
    </div>

    <ep-spinner v-if="!aikataulut" />

    <div v-else-if="aikataulut.length === 0" class="text-center">
      <ep-button @click="otaAikatauluKayttoon" buttonClass="pl-5 pr-5">
        <span>{{ $t('ota-kayttoon') }}</span>
      </ep-button>
    </div>

    <ep-aikataulu v-else :aikataulut="aikataulut">
      <span slot="luomispaiva-topic" v-html="$t('suunnitelman-luomispaiva-br')"></span>
      <span slot="julkaisupaiva-topic" v-html="$t('suunnitelma-astuu-voimaan-br')"></span>
    </ep-aikataulu>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { PerusteprojektiDto, PerusteDto } from '@shared/api/eperusteet';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { Kielet } from '@shared/stores/kieli';
import * as _ from 'lodash';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Tapahtuma } from '@shared/utils/aikataulu';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpAikataulu,
    EpAikatauluModal,
  },
})
export default class EpToteutussuunnitelmaAikataulu extends Vue {
  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  @Prop({ required: true })
  private toteutussuunnitelma!: OpetussuunnitelmaDto;

  get aikataulut() {
    return this.aikatauluStore.aikataulutapahtumat.value;
  }

  async otaAikatauluKayttoon() {
    (this as any).$refs.aikataulumodal.openModal();
  }

  async tallenna(aikataulut: Tapahtuma[]) {
    await this.aikatauluStore.saveAikataulut(aikataulut);
    this.$success(this.$t('aikataulu-tallennettu') as string);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

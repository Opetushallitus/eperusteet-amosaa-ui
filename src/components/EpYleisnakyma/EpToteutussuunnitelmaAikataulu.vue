<template>
  <div class="content">
    <div class="d-flex justify-content-between">
      <h3>{{ $t('aikataulu') }}</h3>
      <EpAikatauluModal
        ref="aikataulumodalRef"
        :root-model="toteutussuunnitelma"
        :aikataulut="aikataulut"
        @tallenna="tallenna"
      >
        <template #luomispaiva-topic>
          <span v-html="$t('suunnitelman-luomispaiva-br')" />
        </template>
      </EpAikatauluModal>
    </div>

    <ep-spinner v-if="!aikataulut" />

    <div
      v-else-if="aikataulut.length === 0"
      class="text-center"
    >
      <ep-button
        v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
        button-class="pl-5 pr-5"
        @click="otaAikatauluKayttoon"
      >
        <span>{{ $t('ota-kayttoon') }}</span>
      </ep-button>
    </div>

    <ep-aikataulu
      v-else
      :aikataulut="aikataulut"
    >
      <template #luomispaiva-topic>
        <span v-html="$t('suunnitelman-luomispaiva-br')" />
      </template>
    </ep-aikataulu>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAikataulu from '@shared/components/EpAikataulu/EpAikataulu.vue';
import EpAikatauluModal from '@shared/components/EpAikataulu/EpAikatauluModal.vue';
import { AikatauluStore } from '@/stores/AikatauluStore';
import * as _ from 'lodash';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Tapahtuma } from '@shared/utils/aikataulu';
import { $t, $success } from '@shared/utils/globals';

const props = defineProps<{
  aikatauluStore: AikatauluStore;
  toteutussuunnitelma: OpetussuunnitelmaDto;
}>();

const aikataulumodalRef = useTemplateRef('aikataulumodalRef');

const aikataulut = computed(() => {
  return props.aikatauluStore.aikataulutapahtumat.value;
});

const otaAikatauluKayttoon = async () => {
  aikataulumodalRef.value?.openModal();
};

const tallenna = async (aikataulutValue: Tapahtuma[]) => {
  await props.aikatauluStore.saveAikataulut(aikataulutValue);
  $success($t('aikataulu-tallennettu') as string);
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

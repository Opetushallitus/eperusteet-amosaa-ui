<template>
  <div class="content">
    <div class="d-flex justify-content-between">
      <h3 class="mb-4">
        {{ $t('tiedotteet') }}
      </h3>
      <ep-tiedote-modal
        ref="eptiedotemodal"
        :tiedotteet-store="tiedotteetStore"
        :editable="false"
      />
    </div>

    <ep-spinner v-if="!tiedotteet" />

    <ep-julki-lista
      v-else
      :tiedot="tiedotteet"
      @avaaTieto="avaaTiedote"
    >
      <template #eiTietoja>
        <span>{{ $t('ei-tiedotteita') }}</span>
      </template>
    </ep-julki-lista>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import { ToteutussuunnitelmaTiedotteetStore } from '@/stores/ToteutussuunnitelmaTiedotteetStore';
import { PerusteDto, TiedoteDto } from '@shared/api/eperusteet';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  tiedotteetStore: ToteutussuunnitelmaTiedotteetStore;
}>();

const eptiedotemodal = useTemplateRef('eptiedotemodal');

const tiedotteet = computed(() => {
  return props.tiedotteetStore.tiedotteet.value;
});

const avaaTiedote = (tiedote: TiedoteDto) => {
  eptiedotemodal.value?.muokkaa(tiedote);
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

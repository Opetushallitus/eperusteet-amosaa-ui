<template>
  <ep-tiedote-view :tiedotteet="tiedotteet">
    <template #search>
      <ep-search
        v-model="nimiFilter"
        :is-loading="isLoading"
        @update:model-value="nimiFilterChanged"
      />
    </template>
    <template #pagination>
      <EpPagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        align="center"
        @update:model-value="pageChanged"
      />
    </template>
  </ep-tiedote-view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import _ from 'lodash';

import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTiedoteView from '@shared/components/EpTiedoteView/EpTiedoteView.vue';

import { KieliStore } from '@shared/stores/kieli';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { TiedoteJulkaisupaikka } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

const props = defineProps<{
  tiedotteetStore: TiedotteetStore;
  kieliStore: KieliStore;
  toteutus: Toteutus;
}>();

const nimiFilter = ref('');
const currentPage = ref(1);

const sisaltoKieli = computed(() => {
  return props.kieliStore.getSisaltoKieli.value || null;
});

const perPage = computed(() => {
  return props.tiedotteetStore.options.value?.sivukoko;
});

const totalRows = computed(() => {
  return props.tiedotteetStore.kokonaismaara.value;
});

const tiedotteet = computed(() => {
  return props.tiedotteetStore.tiedotteet.value;
});

const isLoading = computed(() => {
  return props.tiedotteetStore.isLoading.value;
});

const nimiFilterChanged = _.debounce(async (value: any) => {
  nimiFilter.value = value;
  props.tiedotteetStore.changeNimiFilter(nimiFilter.value);
}, 300);

const pageChanged = (value: any) => {
  currentPage.value = value;
  props.tiedotteetStore.changePage(currentPage.value - 1);
};

onMounted(async () => {
  props.tiedotteetStore.init({
    sivu: currentPage.value - 1,
    sivukoko: 10,
    tiedoteJulkaisuPaikka: [
      TiedoteJulkaisupaikka[props.toteutus],
    ],
  });
});

watch(sisaltoKieli, async (newValue: string, oldValue: string) => {
  if (newValue && newValue !== oldValue) {
    currentPage.value = 1;
    props.tiedotteetStore.changeLang(newValue);
  }
}, { immediate: true });
</script>

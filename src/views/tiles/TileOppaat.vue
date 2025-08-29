<template>
  <EpHomeTile
    icon="menu_book"
    :route="{ name: 'oppaat' }"
    :header-bg-color="{ top: '#009700', bottom: '#007500' }"
  >
    <template #header>
      <span>{{ $t('tile-ohjeet-ja-materiaalit') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-ohjeet-ja-materiaalit-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  headerStyle?: string;
}>();

provide('tileHeaderStyle', props.headerStyle);
</script>

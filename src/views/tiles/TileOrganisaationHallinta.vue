<template>
  <EpHomeTile
    icon="groups"
    :route="{ name: 'organisaatio' }"
    :header-bg-color="{ top: '#009700', bottom: '#007500' }"
  >
    <template #header>
      <span>{{ $t('tile-organisaation-hallinta') }}</span>
    </template>
    <template #content>
      <p>{{ $t('tile-organisaatio-yhteistyo-kuvaus') }}</p>
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

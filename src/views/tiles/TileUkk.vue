<template>
  <EpHomeTile
    icon="quiz"
    :route="{ name: 'ukk' }"
    :header-bg-color="{ top: '#009700', bottom: '#007500' }"
  >
    <template #header>
      <span>{{ $t('tile-usein-kysytyt-kysymykset') }}</span>
    </template>
    <template #content>
      <p>{{ $t(text) }}</p>
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
  text?: string;
}>();

provide('tileHeaderStyle', props.headerStyle);
</script>

<template>
  <EpHomeTile
    icon="description"
    :route="{ name: 'tiedotteet' }"
    :count="uudetTiedotteetCount"
  >
    <template #header>
      <span>{{ $t('tile-tiedotteet') }}</span>
    </template>
    <template #content>
      <ep-spinner v-if="!tiedotteet" />
      <div v-else>
        <div v-if="tiedotteet && tiedotteet.length > 0">
          <div
            v-for="(tiedote, idx) in tiedotteetFormatted"
            :key="idx"
            class="tiedote row justify-content-center text-left"
          >
            <div class="col-3">
              {{ $sd(tiedote.luotu) }}
            </div>
            <div
              class="col-7 otsikko"
              :class="{'font-weight-bold': tiedote.uusi}"
            >
              {{ $kaanna(tiedote.otsikko) }}
            </div>
          </div>
        </div>
        <p v-else>
          {{ $t('tile-tiedotteet-kuvaus') }}
        </p>
      </div>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue';
import _ from 'lodash';

import { TiedotteetStore } from '@/stores/TiedotteetStore';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { onkoUusi } from '@shared/utils/tiedote';
import { $t, $sd, $kaanna } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  kieli: string;
  headerStyle?: string;
  julkaisupaikka?: string;
}>(), {
  julkaisupaikka: 'amosaa',
});


provide('tileHeaderStyle', props.headerStyle);

const tiedotteetStore = ref<TiedotteetStore | null>(null);

const fetch = _.debounce(async () => {
  await tiedotteetStore.value!.init({
    sivu: 0,
    sivukoko: 3,
    kieli: [_.toUpper(props.kieli)],
    tiedoteJulkaisuPaikka: [props.julkaisupaikka],
  });
},300);

const tiedotteet = computed(() => {
  return tiedotteetStore.value?.tiedotteet;
});

const tiedotteetFormatted = computed(() => {
  return _.map(tiedotteet.value, tiedote => {
    return {
      ...tiedote,
      uusi: onkoUusi(tiedote.luotu),
    };
  });
});

const uudetTiedotteetCount = computed(() => {
  return _.size(_.filter(tiedotteetFormatted.value, 'uusi'));
});

onMounted(async () => {
  tiedotteetStore.value = new TiedotteetStore();
  await fetch();
});

watch(() => props.kieli, async (newValue: string, oldValue: string) => {
  if (newValue && newValue !== oldValue) {
    await fetch();
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
.tiedotteet {
  text-align: left;
  display: grid;
  padding: 1rem;
  padding-bottom: 0;
  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    small {
      color: #071A58;
    }
  }

  .otsikko {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>

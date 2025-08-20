<template>
  <EpHomeTile
    icon="article"
    :route="{ name: 'paivitettavat' }"
    :header-bg-color="{ top: '#009700', bottom: '#007500' }"
    :count="vanhatJaHistoriaToteutussuunnitelmatCount"
  >
    <template #header>
      <span>{{ $t('tile-paivitettavat-ja-siirrettavat-toteutussuunnitelmat') }}</span>
    </template>
    <template #content>
      <ep-spinner v-if="!vanhatJaHistoriaToteutussuunnitelmat" />

      <div
        v-else-if="vanhatJaHistoriaToteutussuunnitelmatCount === 0"
        class="disabled-text"
      >
        {{ $t('ei-paivitettavia-tai-siirrettavia-toteutussuunnitelmia') }}
      </div>

      <div
        v-else
        class="text-left ml-5"
      >
        <div
          v-for="(vanhaJaHistoria, index) in rajatut"
          :key="'tot'+index"
        >
          <span>{{ $kaanna(vanhaJaHistoria.opetussuunnitelma.nimi) }}</span>
        </div>

        <ep-button
          v-if="rajatut.length < vanhatJaHistoriaToteutussuunnitelmatCount"
          variant="link"
        >
          {{ vanhatJaHistoriaToteutussuunnitelmatCount - rajatut.length }} {{ $t('muuta-toteutussuunnitelmaa') }}
        </ep-button>
      </div>
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { PaivitettavatJaSiirrettavatTotsStore } from '../../stores/PaivitettavatJaSiirrettavatTotsStore';
import * as _ from 'lodash';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  paivitettavatJaSiirrettavatTotsStore: PaivitettavatJaSiirrettavatTotsStore;
  koulutustoimijaId: string;
}>();

const limit = ref(3);

const vanhatJaHistoriaToteutussuunnitelmat = computed((): any[] | null => {
  if (props.paivitettavatJaSiirrettavatTotsStore.vanhentuneetToteutussuunnitelmat.value
    && props.paivitettavatJaSiirrettavatTotsStore.historialiitoksienToteutussuunnitelmat.value) {
    return [
      ...props.paivitettavatJaSiirrettavatTotsStore.vanhentuneetToteutussuunnitelmat.value,
      ...props.paivitettavatJaSiirrettavatTotsStore.historialiitoksienToteutussuunnitelmat.value,
    ];
  }

  return null;
});

const vanhatJaHistoriaToteutussuunnitelmatCount = computed(() => {
  return vanhatJaHistoriaToteutussuunnitelmat.value?.length || 0;
});

const rajatut = computed(() => {
  return _.take(vanhatJaHistoriaToteutussuunnitelmat.value, limit.value);
});

onMounted(async () => {
  await props.paivitettavatJaSiirrettavatTotsStore.fetch(props.koulutustoimijaId);
});
</script>

<style scoped lang="scss">
  :deep(.ep-button .teksti), :deep(.ep-button .btn-link) {
    padding-left: 0px !important;
  }
</style>

<template>
  <EpMainView>
    <EpToteutussuunnitelmaListaus
      :provider="storeProvider"
      :koulutustoimija-id="koulutustoimijaId"
      :tyypit="tyypit"
      :filters="['voimassaolo','tila']"
      :field-keys="tableFields"
      :kayttaja-store="kayttajaStore"
    >
      <template #header>
        <div class="d-flex justify-content-between">
          <h2>{{ $t('koulutustoimijan-yhteinen-osuus') }}</h2>

          <div>
            <router-link :to="{name: 'yhteinenLuonti'}">
              <ep-button
                variant="outline-primary"
                icon="add"
              >
                {{ $t('lisaa-uusi') }}
              </ep-button>
            </router-link>
          </div>
        </div>
      </template>
    </EpToteutussuunnitelmaListaus>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpToteutussuunnitelmaListaus from '@/components/EpToteutussuunnitelmaListaus/EpToteutussuunnitelmaListaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { KayttajaStore } from '@/stores/kayttaja';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  storeProvider: IToteutussuunnitelmaProvider;
  koulutustoimijaId: string | number;
  tyypit: string[];
  kayttajaStore: KayttajaStore;
}>();

const tableFields = computed(() => {
  return ['nimi', 'tila', 'muokattu', 'voimaantulo', 'paatospaivamaara'];
});
</script>

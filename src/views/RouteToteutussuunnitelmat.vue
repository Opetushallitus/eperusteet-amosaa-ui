<template>
  <EpMainView>
    <EpToteutussuunnitelmaListaus
      :provider="toteutussuunnitelmatStore"
      :koulutustoimija-id="koulutustoimijaId"
      :tyypit="tyypit"
      :filters="filters"
      :field-keys="tableFields"
      name-label="nimi-tai-koulutuskoodi"
      :kayttaja-store="kayttajaStore"
    >
      <template #header>
        <div class="d-flex justify-content-between">
          <h2>{{ $t(topic) }}</h2>

          <div>
            <router-link
              v-oikeustarkastelu="{ oikeus: 'luonti'}"
              :to="luontiRoute"
            >
              <ep-button
                variant="outline-primary"
                icon="add"
              >
                {{ $t(lisaaBtnText) }}
              </ep-button>
            </router-link>

            <router-link
              v-if="!isOrganisaatioRyhma"
              v-oikeustarkastelu="{ oikeus: 'luonti'}"
              :to="{name: 'jaettuosaLuonti'}"
            >
              <ep-button
                variant="outline-primary"
                icon="add"
              >
                {{ $t('lisaa-jaettu-osa') }}
              </ep-button>
            </router-link>
          </div>
        </div>
      </template>
    </EpToteutussuunnitelmaListaus>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpToteutussuunnitelmaListaus from '@/components/EpToteutussuunnitelmaListaus/EpToteutussuunnitelmaListaus.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { ToteutussuunnitelmatStore } from '@/stores/ToteutussuunnitelmatStore';
import { KayttajaStore } from '@/stores/kayttaja';
import { Murupolku } from '@shared/stores/murupolku';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  toteutussuunnitelmatStore: ToteutussuunnitelmatStore;
  kayttajaStore: KayttajaStore;
  koulutustoimijaId: string | number;
}>();

const isOrganisaatioRyhma = computed(() => {
  return props.kayttajaStore.koulutustoimija.value?.organisaatioRyhma;
});

const topic = computed(() => {
  return isOrganisaatioRyhma.value ? 'oppimisympariston-tunnistamisraportit' : 'toteutussuunnitelmat';
});

const lisaaBtnText = computed(() => {
  return isOrganisaatioRyhma.value ? 'lisaa-uusi' : 'lisaa-toteutussuunnitelma';
});

const filters = computed(() => {
  if (isOrganisaatioRyhma.value) {
    return ['voimassaolo', 'tila'];
  }

  return ['tyyppi', 'voimassaolo', 'tila'];
});

const tyypit = computed(() => {
  if (isOrganisaatioRyhma.value) {
    return ['ops'];
  }

  return ['ops', 'yleinen'];
});

const tableFields = computed(() => {
  if (isOrganisaatioRyhma.value) {
    return ['nimi', 'tila', 'muokattu'];
  }

  return undefined;
});

const luontiRoute = computed(() => {
  if (isOrganisaatioRyhma.value) {
    return { name: 'tunnistamisraporttiLuonti' };
  }

  return { name: 'toteutussuunnitelmaLuonti' };
});

watch(isOrganisaatioRyhma, () => {
  Murupolku.aseta('toteutussuunnitelmat', $t(topic.value));
}, { immediate: true });
</script>

<template>
  <div id="scroll-anchor">
    <EpEditointi :store="editointiStore">
      <template #header>
        <h2 class="my-1">
          {{ $t('koulutuksen-osat') }}
        </h2>
      </template>
      <template #default>
        <div
          v-if="yhteisetKoulutuksenosat.length > 0"
          class="mb-4"
        >
          <h3>{{ $t('yhteiset-opinnot') }}</h3>

          <EpKoulutuksenOsaKortti
            v-for="koulutuksenosaViite in yhteisetKoulutuksenosat"
            :key="'koulutuksenosa'+koulutuksenosaViite.id"
            :koulutuksenosa="koulutuksenosaViite.koulutuksenosa"
            :route="{name: 'koulutuksenosa', params: {'sisaltoviiteId': koulutuksenosaViite.id}}"
          />
        </div>

        <template v-if="valinnaisetKoulutuksenosat.length > 0">
          <h3>{{ $t('valinnaiset-opinnot') }}</h3>

          <EpKoulutuksenOsaKortti
            v-for="koulutuksenosaViite in valinnaisetKoulutuksenosat"
            :key="'koulutuksenosa'+koulutuksenosaViite.id"
            :koulutuksenosa="koulutuksenosaViite.koulutuksenosa"
            :route="{name: 'koulutuksenosa', params: {'sisaltoviiteId': koulutuksenosaViite.id}}"
          />
        </template>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';

import { KoulutuksenOsatStore } from '@/stores/KoulutuksenOsatStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpKoulutuksenOsaKortti from '@shared/components/EpKoulutuksenosa/EpKoulutuksenOsaKortti.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { KoulutuksenOsaDtoKoulutusOsanTyyppiEnum, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const editointiStore = ref<EditointiStore | null>(null);

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const koulutuksenosat = computed(() => {
  return editointiStore.value?.data.koulutuksenosat;
});

const yhteisetKoulutuksenosat = computed(() => {
  return _.filter(koulutuksenosat.value, koulutuksenosaViite =>
    koulutuksenosaViite.koulutuksenosa.koulutusOsanTyyppi === _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.YHTEINEN));
});

const valinnaisetKoulutuksenosat = computed(() => {
  return _.filter(koulutuksenosat.value, koulutuksenosaViite =>
    koulutuksenosaViite.koulutuksenosa.koulutusOsanTyyppi === _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.VALINNAINEN));
});

const fetch = async () => {
  editointiStore.value = new EditointiStore(
    new KoulutuksenOsatStore(
      props.toteutussuunnitelmaId,
      props.koulutustoimijaId,
      props.sisaltoviiteId,
      toteutussuunnitelma.value as OpetussuunnitelmaDto,
    ),
  );
};

// Initialize the store
fetch();
</script>

<style scoped lang="scss">

</style>

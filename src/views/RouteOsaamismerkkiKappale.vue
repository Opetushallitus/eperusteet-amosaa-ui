<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
    >
      <template #header>
        <h2 class="m-0">
          {{ $t('kansalliset-perustaitojen-osaamismerkit') }}
        </h2>
      </template>
      <template #default="{ isEditing, data }">
        <EpOsaamismerkkiKappale
          v-model="data.osaamismerkkiKappale"
          :toteutussuunnitelma-id="toteutussuunnitelmaId"
          :koulutustoimija-id="koulutustoimijaId"
          :is-editing="isEditing"
        />
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpOsaamismerkkiKappale from '@/components/EpOsaamismerkkiKappale/EpOsaamismerkkiKappale.vue';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OsaamismerkkiKappaleStore } from '@/stores/OsaamismerkkiKappaleStore';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const route = useRoute();
const instance = getCurrentInstance();

const editointiStore = ref<EditointiStore | null>(null);

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const fetch = () => {
  editointiStore.value = new EditointiStore(
    new OsaamismerkkiKappaleStore(
      props.toteutussuunnitelmaId,
      props.koulutustoimijaId,
      props.sisaltoviiteId,
      versionumero.value,
      instance,
      props.toteutussuunnitelmaStore.toteutussuunnitelma,
      () => props.toteutussuunnitelmaStore.initNavigation()));
};

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
</style>

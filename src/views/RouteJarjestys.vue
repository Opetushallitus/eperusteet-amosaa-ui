<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
    >
      <template #header>
        <h2 class="m-0">
          {{ $t('muokkaa-jarjestysta') }}
        </h2>
      </template>

      <template #default="{ data, isEditing }">
        <ep-jarjesta
          v-if="data.rakenne"
          v-model="data.rakenne"
          :is-editable="isEditing"
          :group="'rakenne'"
          child-field="lapset"
        >
          <template #default="{ node }">
            <span>
              {{ $kaanna(node.nimi) }}
            </span>
          </template>
          <template #chapter />
        </ep-jarjesta>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import _ from 'lodash';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { RakenneStore } from '@/stores/RakenneStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Toteutus } from '@shared/utils/perusteet';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  toteutus: Toteutus;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const editointiStore = ref<EditointiStore | null>(null);

onMounted(async () => {
  editointiStore.value = new EditointiStore(
    new RakenneStore(
      props.toteutussuunnitelmaId,
      props.koulutustoimijaId,
      props.toteutus,
    ));
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

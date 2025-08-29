<template>
  <div>
    <ep-button
      variant="outline-primary"
      icon="add"
      @click="openModal"
    >
      {{ $t('tuo-oletustoteutus') }}
    </ep-button>
    <b-modal
      id="tuoOletusotteutus"
      size="lg"
      centered
      hide-footer
    >
      <template #modal-title>
        <slot name="title">
          {{ $t('tuo-oletustoteutus-tutkinnon-osaan') }}
        </slot>
      </template>

      <ep-spinner v-if="!oletustoteutukset" />

      <div v-else>
        <b-table
          responsive
          striped
          hover
          :per-page="10"
          :current-page="page"
          :fields="fields"
          :items="oletustoteutukset"
          @row-clicked="selectRow"
        >
          <template #head(lahde)>
            <slot name="luotu">
              {{ $t('luotu-tutkinnon-osassa') }}
            </slot>
          </template>
        </b-table>
        <ep-pagination
          v-if="oletustoteutukset"
          v-model="page"
          :total-rows="oletustoteutukset.length"
          :per-page="10"
          align="center"
          aria-controls="tuo-oletustoteutus"
        />
      </div>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import * as _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

import { OletusToteutusDto } from '@shared/api/amosaa';
import { $t, $kaanna, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  fetch: () => Promise<OletusToteutusDto[]>;
}>();

const emit = defineEmits(['lisaaOletustoteutus']);

const page = ref(1);
const oletustoteutukset = ref<OletusToteutusDto[] | null>(null);

const fields = computed(() => {
  return [
    {
      key: 'toteutus',
      label: $t('toteutuksen-nimi'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return $kaanna(item.otsikko);
      },
    }, {
      key: 'lahde',
      label: $t('luotu-tutkinnon-osassa'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return $kaanna(item.lahdeNimi);
      },
    }];
});

const selectRow = (toteutus: any) => {
  emit('lisaaOletustoteutus', {
    ..._.omit(toteutus, ['id']),
    tavatjaymparisto: { ..._.omit(toteutus.tavatjaymparisto, ['id']) },
    arvioinnista: { ..._.omit(toteutus.arvioinnista, ['id']) },
    vapaat: _.map(toteutus.vapaat, obj => _.omit(obj, 'id')),
  });
  $bvModal.hide('tuoOletusotteutus');
};

const openModal = async () => {
  $bvModal.show('tuoOletusotteutus');
  oletustoteutukset.value = await props.fetch();
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

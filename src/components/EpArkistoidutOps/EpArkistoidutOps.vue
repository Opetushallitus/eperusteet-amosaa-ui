<template>
  <div>
    <EpButton
      v-b-modal.arkistoidutopetussuunnitelmatmodal
      variant="link"
    >
      <EpMaterialIcon class="mr-2">
        folder
      </EpMaterialIcon>
      <span>{{ $t(title) }}</span>
    </EpButton>
    <b-modal
      id="arkistoidutopetussuunnitelmatmodal"
      ref="arkistoidutOpsModal"
      size="lg"
      :title="$t(title) + ' (' + arkistoidut.length + ')'"
      :hide-footer="true"
    >
      <div class="search">
        <EpSearch v-model="query" />
      </div>
      <b-table
        responsive
        borderless
        striped
        :items="arkistoidut"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
      >
        <template #cell(nimi)="data">
          {{ $kaanna(data.value) }}
        </template>
        <template #cell(muokattu)="data">
          {{ $sdt(data.value) }}
        </template>
        <template #cell(siirtyminen)="data">
          <EpButton
            v-if="$hasOikeus('luonti') || $isAdmin()"
            variant="link"
            icon="keyboard_return"
            @click="emit('restore', data.item)"
          >
            {{ $t('palauta') }}
          </EpButton>
        </template>
      </b-table>
      <ep-pagination
        v-model="currentPage"
        :total-rows="arkistoidut.length"
        :per-page="perPage"
        aria-controls="arkistoidut-opetussuunnitelmat"
        align="center"
      />
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { $t, $kaanna, $sdt, $hasOikeus, $isAdmin } from '@shared/utils/globals';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

const props = defineProps<{
  opetussuunnitelmat?: OpetussuunnitelmaDto[];
  title?: string;
}>();

const emit = defineEmits(['restore']);

const query = ref('');
const currentPage = ref(1);
const perPage = ref(10);

const arkistoidut = computed(() => {
  return _.chain(props.opetussuunnitelmat)
    .filter(ops => Kielet.search(query.value, ops.nimi))
    .orderBy('muokattu', 'desc')
    .value();
});

const fields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('ops-nimi'),
  }, {
    key: 'muokattu',
    label: $t('poistettu'),
    sortable: true,
  }, {
    key: 'siirtyminen',
    label: '',
  }];
});
</script>

<style lang="scss" scoped>
:deep(.b-table.table-borderless thead th) {
  border: none;
}
</style>

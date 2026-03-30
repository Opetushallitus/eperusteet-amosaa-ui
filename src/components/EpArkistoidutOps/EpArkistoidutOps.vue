<template>
  <div>
    <EpButton
      variant="link"
      @click="openModal"
    >
      <EpMaterialIcon class="mr-2">
        folder
      </EpMaterialIcon>
      <span>{{ $t(title) }}</span>
    </EpButton>
    <ep-modal
      ref="arkistoidutOpsModal"
      size="lg"
      :header="$t(title) + ' (' + arkistoidut.length + ')'"
      hide-footer
    >
      <div class="search">
        <EpSearch v-model="query" />
      </div>
      <ep-table
        responsive
        borderless
        striped
        :items="arkistoidut"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        data-key="id"
        @update:current-page="currentPage = $event"
      >
        <template #cell(nimi)="{ value }">
          {{ $kaanna(value) }}
        </template>
        <template #cell(muokattu)="{ value }">
          {{ $sdt(value) }}
        </template>
        <template #cell(siirtyminen)="{ item }">
          <EpButton
            v-if="$hasOikeus('luonti') || $isAdmin()"
            variant="link"
            icon="keyboard_return"
            @click="emit('restore', item)"
          >
            {{ $t('palauta') }}
          </EpButton>
        </template>
      </ep-table>
    </ep-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref, useTemplateRef } from 'vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import { $t, $kaanna, $sdt, $hasOikeus, $isAdmin } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmat?: OpetussuunnitelmaDto[];
  title?: string;
}>();

const emit = defineEmits(['restore']);

const query = ref('');
const currentPage = ref(1);
const perPage = ref(10);
const arkistoidutOpsModal = useTemplateRef<InstanceType<typeof EpModal>>('arkistoidutOpsModal');

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

function openModal() {
  arkistoidutOpsModal.value?.show();
}
</script>

<style lang="scss" scoped>
</style>

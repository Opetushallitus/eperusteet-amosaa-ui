<template>
  <div>
    <ep-button
      variant="outline-primary"
      icon="add"
      @click="openModal"
    >
      {{ $t('tuo-tutkinnon-osa') }}
    </ep-button>
    <ep-modal
      ref="tuotutkinnonosaModal"
      size="xl"
    >
      <template #modal-title>
        {{ $t('tuo-tutkinnon-osa') }}
      </template>

      <div class="mb-4">
        {{ $t('tutkinnon-osa-tuonti-modal-selite') }}
      </div>

      <div class="flex flex-wrap gap-4 w-full">
        <ep-form-group
          class="w-full md:w-1/2 min-w-0"
          :label="$t('tutkinnon-osan-nimi')"
        >
          <ep-search
            v-model="query.nimi"
            :placeholder="$t('etsi-tutkinnon-osaa')"
          />
        </ep-form-group>

        <ep-form-group
          class="w-full md:w-1/2 min-w-0 md:ml-auto"
          :label="$t('toteutussuunnitelma-jaettu-tai-yhteinen-osa')"
        >
          <ep-spinner v-if="!toteutussuunnitelmat" />
          <EpMultiSelect
            v-else
            v-model="toteutussuunnitelma"
            :placeholder="$t('valitse')"
            :is-editing="true"
            :options="toteutussuunnitelmat"
            :search-identity="kaannaNimi"
          >
            <template #singleLabel="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
            <template #option="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
          </EpMultiSelect>
        </ep-form-group>
      </div>

      <ep-spinner v-if="!tutkinnonosat" />

      <div v-else-if="tutkinnonosat.length == 0">
        {{ $t('ei-hakutuloksia') }}
      </div>

      <div v-else>
        <ep-table
          :sort-by="sortBy"
          :sort-desc="query.sortDesc"
          data-key="id"
          responsive
          striped
          hover
          :items="tutkinnonosatWithSelected"
          no-local-sorting
          :fields="tutkinnonosatFields"
          @sort-changed="sortingChanged"
          @row-clicked="selectRow"
        >
          <template #head(valitse-kaikki)>
            <div
              class="selectable"
              @click="selectAllRows()"
            >
              <EpMaterialIcon
                v-if="valitseKaikki"
                class="checked mr-2"
              >
                check_box
              </EpMaterialIcon>
              <EpMaterialIcon
                v-else
                class="checked mr-2"
              >
                check_box_outline_blank
              </EpMaterialIcon>
            </div>
          </template>
          <template #cell(valitse-kaikki)="{ item }">
            <div class="selectable">
              <EpMaterialIcon
                v-if="item.selected"
                class="checked mr-2"
              >
                check_box
              </EpMaterialIcon>
              <EpMaterialIcon
                v-else
                class="checked mr-2"
              >
                check_box_outline_blank
              </EpMaterialIcon>
            </div>
          </template>
          <template #cell(nimi)="{ item }">
            <span>{{ $kaanna(item.tekstiKappale.nimi) }}</span>
          </template>
        </ep-table>
        <ep-b-pagination
          v-if="totalRows > sisaltoSivuKoko"
          v-model="page"
          :total="totalRows"
          :items-per-page="sisaltoSivuKoko"
          aria-controls="tuo-tutkinnon-osa"
        />
      </div>

      <div v-if="selectedTutkinnonosat.length > 0">
        <h3>{{ $t('valittu') }} {{ selectedTutkinnonosat.length }} {{ $t('kpl') }}</h3>
        <ep-table
          responsive
          striped
          :items="selectedTutkinnonosat"
          :fields="valittuFields"
          data-key="id"
        >
          <template #cell(nimi)="{ item }">
            <span>{{ $kaanna(item.tekstiKappale.nimi) }}</span>
          </template>
        </ep-table>
      </div>

      <template #modal-footer>
        <ep-button
          variant="link"
          @click="close"
        >
          {{ $t('peruuta') }}
        </ep-button>
        <ep-button
          :disabled="selectedTutkinnonosat.length == 0"
          @click="save"
        >
          {{ $t('tuo-valitut-sisallot') }}
        </ep-button>
      </template>
    </ep-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useTemplateRef } from 'vue';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpFormGroup from '@shared/components/forms/EpFormGroup.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpBPagination from '@shared/components/EpBPagination/EpBPagination.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';

import { SisaltoviiteLaajaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import { $t, $kaanna, $sd, $success } from '@shared/utils/globals';

const props = defineProps<{
  tutkinnonosatTuontiStore: TutkinnonosatTuontiStore;
  updateNavigation: () => Promise<void>;
  toteutussuunnitelmaId: number;
  koulutustoimijaId: string;
}>();

const query = ref<any>({});
const tuotutkinnonosaModal = useTemplateRef<InstanceType<typeof EpModal>>('tuotutkinnonosaModal');
const sivu = ref(0);
const sisaltoSivuKoko = ref(10);
const valitseKaikki = ref(false);
const selectedTutkinnonosat = ref<SisaltoviiteLaajaDto[]>([]);

const defaults = () => {
  query.value = {
    sivukoko: sisaltoSivuKoko.value,
    kieli: Kielet.getSisaltoKieli.value,
    nimi: '',
    tyyppi: 'TUTKINNONOSA',
    sortDesc: false,
    opetussuunnitelmaId: null,
    notInOpetussuunnitelmaId: props.toteutussuunnitelmaId,
  };

  page.value = 0;
  selectedTutkinnonosat.value = [];
};

const toteutussuunnitelmat = computed(() => {
  if (props.tutkinnonosatTuontiStore?.toteutussuunnitelmat.value) {
    return _.filter(props.tutkinnonosatTuontiStore?.toteutussuunnitelmat.value, tots => tots.id !== _.toNumber(props.toteutussuunnitelmaId));
  }
  return null;
});

const kaannaNimi = ({ nimi }: { nimi: any }) => {
  return $kaanna(nimi);
};

const tutkinnonosat = computed(() => {
  return props.tutkinnonosatTuontiStore?.tutkinnonosatPage?.value?.data || null;
});

const tutkinnonosatWithSelected = computed(() => {
  return _.map(tutkinnonosat.value, tutkinnonosa => {
    return {
      ...tutkinnonosa,
      selected: _.includes(_.map(selectedTutkinnonosat.value, 'id'), _.get(tutkinnonosa, 'id')),
    };
  });
});

const tutkinnonosatPage = computed(() => {
  return props.tutkinnonosatTuontiStore?.tutkinnonosatPage.value || null;
});

const totalRows = computed(() => {
  return tutkinnonosatPage.value!.kokonaismäärä;
});

const page = computed({
  get() {
    return tutkinnonosatPage.value!.sivu + 1;
  },
  set(value: number) {
    sivu.value = value - 1;
  },
});

const sortBy = 'tekstiKappale.nimi';

const tutkinnonosatFields = computed(() => {
  return [
    {
      key: 'valitse-kaikki',
      sortable: false,
    },
    {
      key: 'nimi',
      label: $t('nimi'),
      sortable: true,
      thStyle: { width: '40%' },
    },
    {
      key: 'koodi',
      label: $t('koodi'),
      sortable: true,
      thStyle: { width: '20%' },
      formatter: (value: any, key: string, item: any) => {
        if (_.split(item.tosa?.koodi, '_').length > 1) {
          return _.split(item.tosa?.koodi, '_')[1];
        }

        if (item.tosa?.omatutkinnonosa?.koodi) {
          return item.tosa.omatutkinnonosa.koodi;
        }

        return '';
      },
    },
    {
      key: 'opetussuunnitelma.voimaantulo',
      label: $t('voimaantulo'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return value ? $sd(value) : '';
      },
    }, {
      key: 'laajuus',
      label: $t('laajuus'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        if (item.tosa.omatutkinnonosa && item.tosa.omatutkinnonosa.laajuus) {
          return item.tosa.omatutkinnonosa.laajuus;
        }

        if (item.perusteenTutkinnonosa) {
          return item.perusteenTutkinnonosa.laajuus;
        }

        return '';
      },
    }, {
      key: 'opetussuunnitelma.nimi',
      label: $t('suunnitelma-tai-osa'),
      sortable: false,
      formatter: (value: any, key: string, item: any) => {
        return $kaanna(value);
      },
    }];
});

const valittuFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }];
});

const toteutussuunnitelma = computed({
  get() {
    return _.find(toteutussuunnitelmat.value, toteutussuunnitelmaItem => toteutussuunnitelmaItem.id === query.value.opetussuunnitelmaId);
  },
  set(toteutussuunnitelmaValue) {
    if (toteutussuunnitelmaValue) {
      query.value.opetussuunnitelmaId = toteutussuunnitelmaValue.id;
    }
    else {
      query.value.opetussuunnitelmaId = null;
    }
  },
});

const queryFetch = async () => {
  valitseKaikki.value = false;
  await props.tutkinnonosatTuontiStore!.fetch(props.toteutussuunnitelmaId, props.koulutustoimijaId, { ...query.value, sivu: sivu.value });
};

const openModal = async () => {
  tuotutkinnonosaModal.value?.show();
  defaults();
  await props.tutkinnonosatTuontiStore!.fetchOpetussuunnitelmat(props.koulutustoimijaId);
};

const save = async () => {
  await props.tutkinnonosatTuontiStore!.tuoSisaltoa(props.toteutussuunnitelmaId, props.koulutustoimijaId, _.map(selectedTutkinnonosat.value, 'id') as number[]);
  props.tutkinnonosatTuontiStore!.clear();
  $success($t('tutkinnon-osat-tuotu-onnistuneesti'));
  close();
  props.updateNavigation();
};

const close = () => {
  tuotutkinnonosaModal.value?.hide();
};

const selectRow = (item: any) => {
  if (_.includes(_.map(selectedTutkinnonosat.value, 'id'), item.id)) {
    selectedTutkinnonosat.value = _.filter(selectedTutkinnonosat.value, tutkinnonosa => tutkinnonosa.id !== item.id);
  }
  else {
    selectedTutkinnonosat.value = [
      ...selectedTutkinnonosat.value,
      item,
    ];
  }
};

const selectAllRows = () => {
  valitseKaikki.value = !valitseKaikki.value;
  if (valitseKaikki.value) {
    selectedTutkinnonosat.value = _.uniqBy([
      ...selectedTutkinnonosat.value,
      ...(tutkinnonosat.value || []) as SisaltoviiteLaajaDto[],
    ], 'id');
  }
  else {
    selectedTutkinnonosat.value = _.filter(selectedTutkinnonosat.value, sel => !_.includes(_.map(tutkinnonosat.value, 'id'), sel.id));
  }
};

const sortingChanged = (sort: any) => {
  query.value = {
    ...query.value,
    sortDesc: sort.sortDesc,
  };
};

watch(query, async () => {
  sivu.value = 0;
  await queryFetch();
}, { deep: true });

watch(sivu, async () => {
  await queryFetch();
});

defineExpose({
  openModal,
});

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(.filter) {
    max-width: 100%;
  }

  .selectable {
    cursor: pointer;

    .checked {
      color: $paletti-blue;
    }
  }

</style>

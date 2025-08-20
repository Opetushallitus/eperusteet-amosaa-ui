<template>
  <div>
    <ep-button
      variant="outline-primary"
      icon="add"
      @click="openModal"
    >
      {{ $t('tuo-tutkinnon-osa') }}
    </ep-button>
    <b-modal
      id="tuotutkinnonosa"
      ref="tuotutkinnonosaModal"
      size="lg"
      centered
      @close="close"
    >
      <template #modal-title>
        {{ $t('tuo-tutkinnon-osa') }}
      </template>

      <div class="mb-4">
        {{ $t('tutkinnon-osa-tuonti-modal-selite') }}
      </div>

      <div class="d-flex">
        <b-form-group
          class="w-50"
          :label="$t('tutkinnon-osan-nimi')"
        >
          <ep-search
            v-model="query.nimi"
            :placeholder="$t('etsi-tutkinnon-osaa')"
          />
        </b-form-group>

        <b-form-group
          class="ml-auto w-50"
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
        </b-form-group>
      </div>

      <ep-spinner v-if="!tutkinnonosat" />

      <div v-else-if="tutkinnonosat.length == 0">
        {{ $t('ei-hakutuloksia') }}
      </div>

      <div v-else>
        <b-table
          responsive
          striped
          hover
          :items="tutkinnonosatWithSelected"
          no-local-sorting
          :sort-by.sync="sortBy"
          :sort-desc.sync="query.sortDesc"
          :fields="tutkinnonosatFields"
          no-sort-reset
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
        </b-table>
        <ep-pagination
          v-if="totalRows > sisaltoSivuKoko"
          v-model="page"
          :total-rows="totalRows"
          :per-page="sisaltoSivuKoko"
          align="center"
          aria-controls="tuo-tutkinnon-osa"
        />
      </div>

      <div v-if="selectedTutkinnonosat.length > 0">
        <h3>{{ $t('valittu') }} {{ selectedTutkinnonosat.length }} {{ $t('kpl') }}</h3>
        <b-table
          responsive
          striped
          :items="selectedTutkinnonosat"
          :fields="valittuFields"
        >
          <template #cell(nimi)="{ item }">
            <span>{{ $kaanna(item.tekstiKappale.nimi) }}</span>
          </template>
        </b-table>
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
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

import { SisaltoviiteLaajaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import { $t, $kaanna, $sd, $success, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  tutkinnonosatTuontiStore: TutkinnonosatTuontiStore;
  updateNavigation: () => Promise<void>;
  toteutussuunnitelmaId: number;
  koulutustoimijaId: string;
}>();

const query = ref<any>({});
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

const sortBy = computed(() => {
  return 'tekstiKappale.nimi';
});

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
    }, {
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
  $bvModal.show('tuotutkinnonosa');
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
  $bvModal.hide('tuotutkinnonosa');
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

<template>
  <div>
    <div class="header">
      <slot name="header">
        <h1 class="bg-danger">
          slot: header
        </h1>
      </slot>
    </div>

    <div
      v-if="items"
      class="filters"
    >
      <div class="row align-items-end">
        <div class="col-12 col-md-3 mt-2 mb-2 mr-2">
          <label>{{ $t(nameLabel) }}</label>
          <EpSearch
            v-model="query.nimi"
            :placeholder="$t('etsi')"
            :max-width="true"
          />
        </div>
        <div
          v-if="filtersInclude('tyyppi')"
          class="col-12 col-lg-2 col-md-3 m-2"
        >
          <label>{{ $t('tyyppi') }}</label>
          <EpMultiSelect
            v-model="tyyppi"
            :enable-empty-option="true"
            :placeholder="$t('kaikki')"
            :is-editing="true"
            :options="tyypit"
          >
            <template #singleLabel="{ option }">
              {{ $t('amosaa-tyyppi-' + option) }}
            </template>
            <template #option="{ option }">
              {{ $t('amosaa-tyyppi-' + option) }}
            </template>
          </EpMultiSelect>
        </div>
        <div
          v-if="filtersInclude('voimassaolo')"
          class="col-12 col-lg-2 col-md-3 m-2"
        >
          <label>{{ $t('voimassaolo') }}</label>
          <EpMultiSelect
            v-model="voimassaolo"
            :enable-empty-option="true"
            :placeholder="$t('kaikki')"
            :is-editing="true"
            :options="vaihtoehdotVoimassaolo"
          >
            <template #singleLabel="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template #option="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </div>
        <div
          v-if="$isAdmin()"
          class="col-12 col-lg-2 col-md-3 m-2"
        >
          <label>{{ $t('koulutustoimija') }}</label>
          <EpMultiSelect
            v-model="valitutKoulutustoimijat"
            class="multiselect"
            :enable-empty-option="true"
            :placeholder="$t('kaikki')"
            :is-editing="true"
            :options="koulutustoimijat"
            :multiple="true"
            track-by="id"
            :search-identity="koulutustoimijaSearchIdentity"
          >
            <template #option="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>

            <template #selection="{ values }">
              <span v-if="values.length > 1">{{ $t('valittu') }} {{ values.length }} {{ $t('koulutustoimijaa') }}</span>
              <span v-if="values.length === 1">{{ $kaanna(values[0].nimi) }}</span>
            </template>
          </EpMultiSelect>
        </div>
        <div class="mb-3">
          <ep-spinner v-if="isLoading" />
        </div>
      </div>

      <div class="row align-items-end">
        <div
          v-if="filtersInclude('tila')"
          class="col m-2"
        >
          <b-form-checkbox-group v-model="tila">
            <EpToggleGroup
              v-model="tila"
              :items="vaihtoehdotTilat"
            >
              <template #default="{ item }">
                {{ $t(item) }}
              </template>
            </EpToggleGroup>
          </b-form-checkbox-group>
        </div>
      </div>

      <div v-if="items.data.length > 0">
        <b-table
          v-model:sort-by="sort.sortBy"
          v-model:sort-desc="sort.sortDesc"
          striped
          hover
          responsive
          :items="items.data"
          :fields="fields"
          no-local-sorting
          no-sort-reset
          @sort-changed="sortingChanged"
        >
          <template #cell(nimi)="data">
            <router-link :to="{ name: 'toteutussuunnitelma', params: { koulutustoimijaId: data.item.koulutustoimija.id, toteutussuunnitelmaId: data.item.id } }">
              {{ $kaanna(data.item.nimi) }}
            </router-link>
          </template>
          <template #cell(tila)="data">
            <div class="d-flex">
              {{ $t(data.item.tila) }}
              <ep-button
                v-if="data.item.tila === 'poistettu'"
                v-oikeustarkastelu="{ oikeus: 'tilanvaihto' }"
                variant="link py-0"
                icon="keyboard_return"
                @click="restore(data.item)"
              >
                {{ $t('palauta') }}
              </ep-button>
            </div>
          </template>
        </b-table>
        <ep-pagination
          v-model="sivu"
          :per-page="perPage"
          :total-rows="total"
        />
      </div>
      <div
        v-else
        class="m-2 alert alert-info"
      >
        {{ $t('ei-hakutuloksia') }}
      </div>
    </div>
    <ep-spinner v-else />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as _ from 'lodash';
import { BvTableFieldArray } from 'bootstrap-vue';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { IToteutussuunnitelmaProvider } from './types';
import { Toteutus } from '@shared/utils/perusteet';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import { KayttajaStore } from '@/stores/kayttaja';
import { Kielet } from '@shared/stores/kieli';
import { $t, $sd, $kaanna, $isAdmin } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

const props = defineProps<{
  provider: IToteutussuunnitelmaProvider;
  fieldKeys?: string[];
  nameLabel?: string;
  filters?: ProjektiFilter[];
  koulutustoimijaId: string | number;
  tyypit: string[];
  kayttajaStore: KayttajaStore;
}>();

const route = useRoute();
const router = useRouter();

const tyyppi = ref<string | null>('ops');
const voimassaolo = ref<string | null>(null);
const tila = ref<string[] | null>(['luonnos', 'julkaistu']);
const isLoading = ref(false);
const sort = ref({});

const query = reactive({
  sivu: 0,
  sivukoko: 10,
  voimassaolo: true,
  siirtyma: true,
  tuleva: true,
  poistunut: true,
  tila: tila.value,
  tyyppi: ['ops'],
  nimi: '',
  jarjestysOrder: false,
  jarjestysTapa: 'nimi',
  koulutustoimijat: [],
  kieli: Kielet.getSisaltoKieli.value,
} as any);

const fetch = async (koulutustoimijaId: any, queryParam: any) => {
  if (!isLoading.value) {
    isLoading.value = true;
    try {
      await props.provider.updateQuery(
        _.toNumber(koulutustoimijaId),
        route.params.toteutus as Toteutus,
        queryParam,
      );
    }
    finally {
      isLoading.value = false;
    }
  }
};

const onChangeVoimassaolo = (tilaParam: string) => {
  const defaults = {
    ...query,
    voimassaolo: false,
    siirtyma: false,
    tuleva: false,
    poistunut: false,
  };

  switch (tilaParam) {
  case 'tuleva':
    Object.assign(query, { ...defaults, tuleva: true });
    break;
  case 'voimassaolo':
    Object.assign(query, { ...defaults, voimassaolo: true });
    break;
  case 'poistunut':
    Object.assign(query, { ...defaults, poistunut: true });
    break;
  default:
    Object.assign(query, {
      ...defaults,
      voimassaolo: true,
      tuleva: true,
      poistunut: true,
    });
    break;
  }
};

const onTilaChange = (tilaParam: string) => {
  Object.assign(query, {
    ...query,
    tila: tilaParam
      ? [tilaParam]
      : ['luonnos', 'julkaistu', 'poistettu'],
  });
};

const onTyyppiChange = (tyyppiParam: string) => {
  Object.assign(query, {
    ...query,
    tyyppi: tyyppiParam ? [tyyppiParam] : ['ops', 'yleinen'],
  });
};

const sortingChanged = (sortParam: any) => {
  sort.value = sortParam;
  Object.assign(query, {
    ...query,
    sivu: 0,
    jarjestys: sortParam.sortBy,
    jarjestysNouseva: !sortParam.sortDesc,
  });
};

const restore = async (item: any) => {
  await vaihdaOpetussunnitelmaTilaConfirm(
    { $t, $kaanna, route, router },
    {
      title: 'palauta-toteutussuunnitelma',
      confirm: 'palauta-toteutussuunnitelma-vahvistus',
      tila: 'LUONNOS',
      toteutussuunnitelmaId: item.id,
    },
  );
  await onQueryChange(query);
};

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const vaihtoehdotVoimassaolo = computed(() => {
  return [
    'kaikki',
    'tuleva',
    'voimassaolo',
    'poistunut',
  ];
});

const vaihtoehdotTilat = computed(() => {
  return ['luonnos', 'julkaistu', 'poistettu'];
});

const sivu = computed({
  get() {
    return query?.sivu + 1;
  },
  set(value: number) {
    query.sivu = value - 1;
  },
});

const perPage = computed(() => {
  return items.value?.sivukoko || 10;
});

const total = computed(() => {
  return items.value?.kokonaismäärä || 0;
});

const items = computed(() => {
  return props.provider.opetussuunnitelmat.value;
});

const fields = computed(() => {
  return _.filter(initialFields.value, (field: any) => !props.fieldKeys || _.includes(props.fieldKeys, field.key));
});

const initialFields = computed((): BvTableFieldArray => {
  const dateFormatter = (value: Date) => {
    return value
      ? $sd(value)
      : '-';
  };

  return [{
    key: 'nimi',
    label: $t('nimi') as string,
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'tyyppi',
    sortable: true,
    label: $t('tyyppi') as string,
    formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
      return $t('amosaa-tyyppi-' + value);
    },
  }, {
    key: 'tila',
    sortable: true,
    label: $t('tila') as string,
    formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
      return $t('tila-' + item!.tila);
    },
  }, {
    key: 'koulutuskoodi',
    sortable: false,
    label: $t('koulutuskoodi') as string,
    thStyle: { borderBottom: '0px' },
    formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
      if (item.peruste && _.size(item.peruste.koulutukset) > 0) {
        return _.reduce(_.map(item!.peruste!.koulutukset, 'koulutuskoodiArvo'), (tulos, koulutus) => (tulos + (tulos !== '' ? ', ' : '') + koulutus), '');
      }

      return undefined;
    },
  }, {
    key: 'luotu',
    sortable: true,
    label: $t('luotu') as string,
    formatter: dateFormatter,
  }, {
    key: 'muokattu',
    sortable: true,
    label: $t('muokattu') as string,
    formatter: dateFormatter,
  }, {
    key: 'voimaantulo',
    sortable: true,
    label: $t('voimassaolo-alkaa') as string,
    formatter: dateFormatter,
  }, {
    key: 'paatospaivamaara',
    sortable: true,
    label: $t('paatospaivamaara') as string,
    formatter: dateFormatter,
  }];
});

const filtersInclude = (filter: any) => {
  return !props.filters || _.includes(props.filters, filter);
};

const koulutustoimijat = computed(() => {
  return _.sortBy(props.kayttajaStore.koulutustoimijat.value, kt => $kaanna(kt.nimi!));
});

const valitutKoulutustoimijat = computed({
  get() {
    return _.filter(koulutustoimijat.value, (kt: any) => _.includes(query.koulutustoimijat, kt.id));
  },
  set(value: any[]) {
    if (_.size(value) === 0) {
      query.koulutustoimijat = [];
    }
    else {
      query.koulutustoimijat = _.map(value, 'id');
    }
  },
});

const koulutustoimijaSearchIdentity = (obj: any) => {
  return _.toLower($kaanna(obj.nimi));
};

const onQueryChange = _.debounce(async (queryParam: any) => {
  await fetch(_.toNumber(route.params.koulutustoimijaId), queryParam);
}, 500);

onMounted(async () => {
  await fetch(_.toNumber(route.params.koulutustoimijaId), query);
});

watch(() => props.koulutustoimijaId, async (koulutustoimijaId: string | number) => {
  await fetch(koulutustoimijaId, query);
}, { deep: true, immediate: true });

watch(query, onQueryChange, { deep: true, immediate: true });

watch(kieli, async () => {
  Object.assign(query, {
    ...query,
    kieli: kieli.value,
  });
});

watch(voimassaolo, onChangeVoimassaolo);
watch(tila, onTilaChange);
watch(tyyppi, onTyyppiChange);
</script>

<style lang="scss" scoped>

.upper {
  margin-bottom: 3rem;
}

.lower {
  margin-top: 4rem;
}

.teksti {
  font-size: 22px;
  font-weight: 400;
}

.ikoni {
  font-size: 38px;
  font-weight: 100;
}

.card-wrapper {
  margin: 0 20px 20px 0;
}

.small-text {
  color: #1d346b;
}

</style>

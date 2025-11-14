<template>
  <ep-main-view :container="true">
    <h2>{{ $t('toteutussuunnitelmat-joissa-perusteet-paivittyneet') }}</h2>

    <ep-spinner v-if="!vanhentuneetToteutussuunnitelmat" />
    <div
      v-else-if="vanhentuneetToteutussuunnitelmat.length === 0"
      class="disabled-text"
    >
      {{ $t('toteutussuunnitelmat-eivat-vaadi-paivitysta') }}
    </div>
    <b-table
      v-else
      responsive
      striped
      borderless
      :items="vanhentuneetToteutussuunnitelmat"
      :fields="vanhentuneetFields"
    >
      <template #cell(nimi)="{ item }">
        <router-link :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: item.opetussuunnitelma.id } }">
          {{ $kaanna(item.opetussuunnitelma.nimi) }}
        </router-link>
      </template>

      <template #cell(paivita)="{ item }">
        <ep-button
          :show-spinner="spinning(item.opetussuunnitelma.id)"
          @click="paivita(item.opetussuunnitelma.id)"
        >
          {{ $t('paivita') }}
        </ep-button>
      </template>
    </b-table>

    <h2 class="mt-5">
      {{ $t('siirra-toteutussuunnitelmat-aiemmasta-organisaatiosta') }}
    </h2>

    <ep-spinner v-if="!historialiitoksienToteutussuunnitelmat" />
    <div
      v-else-if="historialiitoksienToteutussuunnitelmat.length === 0"
      class="disabled-text"
    >
      {{ $t('yhtaan-vanhaa-toteutussuunnitelmaa-ei-loytynyt') }}
    </div>
    <b-table
      v-else
      responsive
      striped
      borderless
      :items="historialiitoksienToteutussuunnitelmat"
      :fields="historiaFields"
    >
      <template #cell(nimi)="{ item }">
        <router-link :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: item.opetussuunnitelma.id } }">
          {{ $kaanna(item.opetussuunnitelma.nimi) }}
        </router-link>
      </template>

      <template #cell(siirra)="{ item }">
        <ep-button
          :show-spinner="spinning(item.opetussuunnitelma.id)"
          @click="siirra(item.opetussuunnitelma.id)"
        >
          {{ $t('siirra') }}
        </ep-button>
      </template>
    </b-table>
  </ep-main-view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import * as _ from 'lodash';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import { $t, $success, $fail, $kaanna, $sdt, $sd } from '@shared/utils/globals';

const props = defineProps<{
  paivitettavatJaSiirrettavatTotsStore: PaivitettavatJaSiirrettavatTotsStore;
  koulutustoimijaId: string;
}>();

const spinners = ref<number[]>([]);

const vanhentuneetToteutussuunnitelmat = computed(() => {
  return props.paivitettavatJaSiirrettavatTotsStore.vanhentuneetToteutussuunnitelmat.value;
});

const historialiitoksienToteutussuunnitelmat = computed(() => {
  return props.paivitettavatJaSiirrettavatTotsStore.historialiitoksienToteutussuunnitelmat.value;
});

const spinning = (id: number) => {
  return _.includes(spinners.value, id);
};

const paivita = async (toteutussuunnitelmaId: number) => {
  try {
    spinners.value = [...spinners.value, toteutussuunnitelmaId];
    await props.paivitettavatJaSiirrettavatTotsStore.paivita(toteutussuunnitelmaId, props.koulutustoimijaId);
    $success($t('toteutussuunnitelma-paivitetty-onnistuneesti') as string);
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }
};

const siirra = async (toteutussuunnitelmaId: number) => {
  spinners.value = [...spinners.value, toteutussuunnitelmaId];
  await props.paivitettavatJaSiirrettavatTotsStore.siirra(toteutussuunnitelmaId, props.koulutustoimijaId);
  $success($t('toteutussuunnitelma-siirretty-onnistuneesti') as string);
};

const vanhentuneetFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'opetussuunnitelma.peruste.nimi',
    label: $t('peruste'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return value ? $kaanna(value) : '';
    },
  }, {
    key: 'edellinenPaivitys',
    label: $t('edellinen-paivitys'),
    sortable: true,
    formatter: (value: any, key: string, item: any) => {
      return value ? $sdt(value) : '';
    },
  }, {
    key: 'perustePaivittynyt',
    label: $t('peruste-paivittynyt'),
    sortable: true,
    formatter: (value: any, key: string, item: any) => {
      return value ? $sd(value) : '';
    },
  }, {
    key: 'paivita',
    label: '',
    sortable: false,
    thStyle: 'border: none',
  }];
});

const historiaFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'historialiitos.organisaatio.nimi',
    label: $t('organisaatio'),
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return value ? $kaanna(value) : '';
    },
  }, {
    key: 'siirra',
    label: '',
    sortable: false,
    thStyle: 'border: none',
  }];
});

watch(() => props.koulutustoimijaId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    await props.paivitettavatJaSiirrettavatTotsStore.fetch(props.koulutustoimijaId);
  }
}, { immediate: true });
</script>

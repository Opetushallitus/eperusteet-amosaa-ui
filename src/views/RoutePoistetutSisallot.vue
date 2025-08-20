<template>
  <div class="poistetutsisallot">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">
        {{ $t('poistetut-sisallot') }}
      </h2>
    </div>

    <ep-spinner v-if="!poistetutsisallot" />
    <div
      v-else-if="poistetutsisallot.length === 0"
      class="mt-3 ml-2 disabled-text"
    >
      {{ $t('yhtaan-palautettavaa-sisaltoa-ei-loytynyt') }}
    </div>
    <b-tabs
      v-else
      class="mt-3 ml-2"
    >
      <b-tab
        v-for="(valilehti, index) in poistetutsisallotValilehdet"
        :key="'valilehti'+index"
        class="ml-2"
        :title="$t(valilehti.otsikko)"
      >
        <ep-search
          v-model="query"
          class="mt-3"
        />

        <div v-if="valilehti.poistetut.length > 0">
          <b-table
            :items="valilehti.poistetut"
            :fields="fields"
            :current-page="pages[valilehti.otsikko]"
            :per-page="perPage"
          >
            <template #cell(palauta)="{ item }">
              <ep-button
                variant="link"
                icon="keyboard_return"
                @click="palauta(item)"
              >
                {{ $t('palauta') }}
              </ep-button>
            </template>
          </b-table>

          <ep-pagination
            v-model="pages[valilehti.otsikko]"
            :per-page="perPage"
            :total-rows="valilehti.poistetut.length"
          />
        </div>

        <div
          v-else
          class="mt-4 disabled-text"
        >
          {{ $t('ei-palautettavaa-sisaltoa-annetuilla-hakuehdoilla') }}
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

import { PoistetutStore } from '@/stores/PoistetutStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Kielet } from '@shared/stores/kieli';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { $t, $vahvista, $success, $fail, $kaanna, $sd } from '@shared/utils/globals';

const props = defineProps<{
  poistetutStore: PoistetutStore;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  toteutussuunnitelmaId: number;
  koulutustoimijaId: string;
}>();

const perPage = ref(10);
const query = ref('');
const pages = reactive({
  tutkinnonosat: 1,
  tekstikappaleet: 1,
  suorituspolut: 1,
});

const poistetutsisallot = computed(() => {
  return props.poistetutStore.poistetut.value;
});

const poistetutSisallotFiltered = computed(() => {
  return _.filter(poistetutsisallot.value, poistettuSisalto => Kielet.search(query.value, poistettuSisalto.nimi));
});

const poistetutTyypeilla = (tyypit: string[]) => {
  return _.filter(poistetutSisallotFiltered.value, poistettusisalto => _.includes(tyypit, poistettusisalto.tyyppi));
};

const poistetutsisallotValilehdet = computed(() => {
  return _.filter([
    {
      otsikko: 'tutkinnonosat',
      poistetut: poistetutTyypeilla(['tutkinnonosa']),
    },
    {
      otsikko: 'suorituspolut',
      poistetut: poistetutTyypeilla(['suorituspolku', 'osasuorituspolku']),
    },
    {
      otsikko: 'tekstikappaleet',
      poistetut: poistetutTyypeilla(['tekstikappale']),
    },
    {
      otsikko: 'opintokokonaisuudet',
      poistetut: poistetutTyypeilla(['opintokokonaisuus']),
    },
  ], valilehti => _.size(valilehti.poistetut) > 0);
});

const fields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi') as string,
    sortable: true,
    sortByFormatted: true,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'pvm',
    label: $t('poistoajankohta') as string,
    sortable: true,
    formatter: (value: any, key: string, item: any) => {
      return $sd(value);
    },
  }, {
    key: 'muokkaajaOid',
    sortable: true,
    label: $t('poistaja') as string,
    formatter: (value: any, key: string, item: any) => {
      if (item.poistaja && item.poistaja.sukunimi) {
        return parsiEsitysnimi(item.poistaja);
      }
      return $t('muokkaajaa-ei-loytynyt') + ' (' + value + ')';
    },
  }, {
    key: 'palauta',
    sortable: false,
    label: '' as string,
    thStyle: 'border: none',
  }];
});

const palauta = async (poistettu: any) => {
  try {
    const palautaConfirm = await $vahvista(
      $t('sisallon-palautus') as string,
      $t('palautetaanko-sisalto') as string + ': ' + $kaanna(poistettu.nimi) + '?');

    if (palautaConfirm) {
      await props.poistetutStore.palauta(poistettu.id);
      await props.toteutussuunnitelmaStore.initNavigation();
      $success($t('sisalto-palautettu-onnistuneesti') as string);
    }
  }
  catch (e) {
    $fail($t('sisallon-palautus-epaonnistui') as string);
  }
};

onMounted(async () => {
  await props.poistetutStore.fetchPoistetut();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .poistetutsisallot {
    margin-top: 4px;

    .ylapaneeli {
      border-bottom: 1px solid #eee;
      font-weight: 600;
      padding: 5px 15px 5px 15px;
      height: 50px;

      .otsikko {
        margin-bottom: 0;
      }
    }
  }

</style>

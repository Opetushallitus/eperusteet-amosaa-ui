<template>
  <div class="kayttooikeudet">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">
        {{ $t('ystava-organisaatioiden-kayttooikeudet') }}
      </h2>
    </div>

    <ep-spinner v-if="!kayttajat" />

    <div
      v-else
      class="ml-3 mt-2 mr-5"
    >
      <div class="d-flex">
        <b-form-group :label="$t('henkilon-nimi')">
          <ep-search v-model="query" />
        </b-form-group>

        <b-form-group :label="$t('kayttooikeus')">
          <ep-select
            v-model="oikeusrajaus"
            class="oikeusSelect"
            :is-editing="true"
            :items="oikeusRajausVaihtoehdot"
            :enable-empty-option="false"
          >
            <template #default="{ item }">
              {{ $t('oikeus-'+item.text) }}
            </template>
          </ep-select>
        </b-form-group>
      </div>

      <b-table
        striped
        responsive
        :items="kayttajatFilled"
        :fields="fields"
        :per-page="sivukoko"
        :current-page="sivu"
        :tbody-tr-class="rowClass"
      >
        <template #cell(nimi)="{value, item}">
          <ep-button
            variant="link"
            :href="'/henkilo-ui/virkailija/'+item.oid"
          >
            {{ value }}
          </ep-button>
        </template>

        <template #cell(kayttooikeus)="{ item }">
          <ep-select
            v-if="!item.self && hallintaOikeus"
            v-model="item.oikeus"
            class="oikeusSelect"
            :items="oikeusVaihtoehdot"
            :is-editing="true"
            :enable-empty-option="false"
            @update:model-value="updateOikeus(item.id, item.oikeus.value)"
          >
            <template #default="{ item }">
              {{ $t('oikeus-'+item.text) }}
            </template>
          </ep-select>

          <div v-else-if="item.self">
            {{ $t('oikeus-' + currentKoulutustoimijaOikeus) }}
          </div>
          <div v-else>
            {{ $t('oikeus-'+item.oikeus) }}
          </div>
        </template>
      </b-table>

      <ep-pagination
        v-model="sivu"
        :per-page="sivukoko"
        :total-rows="kayttajat.length"
        align="center"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';

import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

import { KayttoOikeudetStore } from '@/stores/KayttoOikeudetStore';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { KayttajaStore } from '@/stores/kayttaja';
import { createLogger } from '@shared/utils/logger';
import { $t, $success, $fail, $hasOikeus, $kaanna } from '@shared/utils/globals';

interface KayttoOikeusText {
  value: string;
  text: string;
}

const props = defineProps<{
  kayttoOikeudetStore: KayttoOikeudetStore;
  kayttajaStore: KayttajaStore;
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
}>();

const sivukoko = ref(10);
const sivu = ref(1);
const query = ref('');
const oikeusrajaus = ref<KayttoOikeusText>({ value: 'kaikki', text: 'kaikki' });

const logger = createLogger('RouteKayttooikeudet');

const kayttajat = computed(() => {
  return props.kayttoOikeudetStore.kayttajat.value;
});

const oldOikeusToNewConvert = computed(() => ({
  'estetty': 'estetty',
  'luku': 'luku',
  'muokkaus': 'luku',
  'luonti': 'luku',
  'poisto': 'poisto',
  'hallinta': 'poisto',
}));

const oikeudetById = computed(() => {
  return _.keyBy(props.kayttoOikeudetStore.kayttajaOikeudet.value, '_kayttaja');
});

const ktYstavatByOid = computed(() => {
  return _.keyBy(props.kayttoOikeudetStore.ktYstavat.value, 'organisaatio');
});

const oikeusVaihtoehdot = computed((): KayttoOikeusText[] => [
  { value: 'estetty', text: 'estetty' },
  { value: 'luku', text: 'luku' },
  { value: 'poisto', text: 'muokkaus' },
]);

const oikeusRajausVaihtoehdot = computed((): KayttoOikeusText[] => {
  return [{ value: 'kaikki', text: 'kaikki' }, ...oikeusVaihtoehdot.value];
});

const kayttajaId = computed(() => {
  return _.get(props.kayttajaStore.tiedot.value, 'id');
});

const currentKoulutustoimijaOikeus = computed(() => {
  return _.get(_.find(oikeusVaihtoehdot.value, { value: _.get(oldOikeusToNewConvert.value, (_.get(oikeudetById.value[kayttajaId.value], 'oikeus') || 'estetty')) }), 'text');
});

const kayttajatFilled = computed(() => {
  if (props.kayttoOikeudetStore.kayttajaOikeudet.value) {
    return _.chain(kayttajat.value)
      .map(kayttaja => {
        return {
          ...kayttaja,
          oikeus: kayttaja.id && oikeudetById.value[kayttaja.id]
            ? _.find(oikeusVaihtoehdot.value, { value: _.get(oldOikeusToNewConvert.value, (_.get(oikeudetById.value[kayttaja.id], 'oikeus') || 'estetty')) })
            : _.find(oikeusVaihtoehdot.value, { value: 'estetty' }),
          self: kayttaja.oid === _.toString(props.kayttajaStore.tiedot.value.oid),
        };
      })
      .filter(kayttaja => Kielet.search(query.value, parsiEsitysnimi(kayttaja)))
      .filter(kayttaja => oikeusrajaus.value.value === 'kaikki' || kayttaja.oikeus?.value === oikeusrajaus.value.value)
      .value();
  }

  return undefined;
});

const fields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('henkilon-nimi') as string,
    sortable: false,
    tdClass: 'align-middle',
    formatter: (value: any, key: string, item: any) => {
      return parsiEsitysnimi(item);
    },
  }, {
    key: 'organisaatioOid',
    label: $t('organisaatio') as string,
    sortable: false,
    tdClass: 'align-middle',
    formatter: (value: any, key: string, item: any) => {
      if (ktYstavatByOid.value[value]) {
        return $kaanna(ktYstavatByOid.value[value].nimi!);
      }

      return '';
    },
  }, {
    key: 'kayttooikeus',
    sortable: false,
    tdClass: 'align-middle',
    label: $t('kayttooikeus') as string,
  }];
});

const hallintaOikeus = computed(() => {
  return $hasOikeus('hallinta', 'koulutustoimija');
});

const updateOikeus = async (id: any, oikeus: any) => {
  try {
    await props.kayttoOikeudetStore.updateOikeus(id, { oikeus });
    $success($t('kayttooikeus-paivitetty') as string);
  }
  catch (e) {
    logger.error(e);
    $fail($t('kayttooikeus-paivitys-virhe') as string);
  }
};

const rowClass = (item: any, type: any) => {
  if (item.self) {
    return 'self';
  }

  return '';
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .kayttooikeudet {
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

    .oikeusSelect {
      width: 200px;
    }

  }

  :deep(table tr.self) {
    background-color: $green-lighten-4;
  }

</style>

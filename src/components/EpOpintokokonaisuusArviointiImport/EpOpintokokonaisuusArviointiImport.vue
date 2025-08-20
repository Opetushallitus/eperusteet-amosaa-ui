<template>
  <div>
    <EpButton
      variant="outline"
      icon="add"
      @click="open()"
    >
      {{ $t('tuo-arvioinnin-kohteet-pohjan-opintokokonaisuudesta') }}
    </EpButton>

    <b-modal
      id="arviointiImportModal"
      ref="arviointiImportModal"
      size="lg"
      :title="$t('valitse-pohjan-opintokokonaisuus')"
      :ok-title="$t('peruuta')"
      :ok-only="true"
    >
      <div v-if="pohjanOpintokokonaisuudet">
        <b-table
          responsive
          borderless
          striped
          fixed
          hover
          :items="pohjanOpintokokonaisuudet"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          :selectable="true"
          select-mode="single"
          selected-variant=""
          @row-selected="onRowSelected"
        >
          <template #cell(nimi)="{ item }">
            <span class="btn-link">
              {{ $kaanna(item.tekstiKappale.nimi) }}
            </span>
          </template>
        </b-table>
        <ep-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          align="center"
          aria-controls="arviointiImportModal"
        />
      </div>
      <ep-spinner v-else />
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref, useTemplateRef } from 'vue';
import { Sisaltoviitteet } from '@shared/api/amosaa';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: any;
  addArvioinnit: (arvioinnit: any[]) => Promise<void>;
}>();

const currentPage = ref(1);
const perPage = ref(10);
const pohjanOpintokokonaisuudet = ref<any[] | null>(null);

const arviointiImportModal = useTemplateRef('arviointiImportModal');

const open = async () => {
  arviointiImportModal.value?.show();
  pohjanOpintokokonaisuudet.value = (await Sisaltoviitteet.getOpetussuunnitelmanPohjanSisaltoviitteet(
    props.toteutussuunnitelmaId,
    'opintokokonaisuus',
    props.koulutustoimijaId,
  )).data;
};

const onRowSelected = (opintokokonaisuusViite: any) => {
  props.addArvioinnit(_.map(opintokokonaisuusViite[0].opintokokonaisuus.arvioinnit, arviointi => {
    return {
      ..._.pick(arviointi.arviointi, UiKielet),
    };
  }));
  arviointiImportModal.value?.hide();
};

const rows = computed(() => {
  return _.size(pohjanOpintokokonaisuudet.value);
});

const fields = computed(() => {
  return [{
    key: 'nimi',
    sortable: true,
    sortByFormatted: true,
    label: $t('nimi'),
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(item.tekstiKappale.nimi);
    },
  }];
});

const kieli = computed(() => {
  return Kielet.uiKieli;
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

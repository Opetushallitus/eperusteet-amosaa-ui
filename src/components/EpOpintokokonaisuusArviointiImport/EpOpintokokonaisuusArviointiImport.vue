<template>
  <div>
    <EpButton
      variant="outline"
      icon="add"
      @click="open"
    >
      {{ $t('tuo-arvioinnin-kohteet-pohjan-opintokokonaisuudesta') }}
    </EpButton>

    <ep-modal
      ref="arviointiImportModal"
      size="lg"
      :header="$t('valitse-pohjan-opintokokonaisuus')"
      hide-footer
    >
      <div v-if="pohjanOpintokokonaisuudet">
        <ep-table
          responsive
          borderless
          striped
          fixed
          hover
          :items="pohjanOpintokokonaisuudet"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          data-key="id"
          select-mode="single"
          @row-selected="onRowSelected"
          @update:current-page="currentPage = $event"
        >
          <template #cell(nimi)="{ item }">
            <span class="text-[var(--link)] cursor-pointer">
              {{ $kaanna(item.tekstiKappale.nimi) }}
            </span>
          </template>
        </ep-table>
      </div>
      <ep-spinner v-else />
    </ep-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref, useTemplateRef } from 'vue';
import { Sisaltoviitteet } from '@shared/api/amosaa';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: any;
  addArvioinnit: (arvioinnit: any[]) => Promise<void>;
}>();

const currentPage = ref(1);
const perPage = ref(10);
const pohjanOpintokokonaisuudet = ref<any[] | null>(null);

const arviointiImportModal = useTemplateRef<InstanceType<typeof EpModal>>('arviointiImportModal');

const open = async () => {
  arviointiImportModal.value?.show();
  pohjanOpintokokonaisuudet.value = (await Sisaltoviitteet.getOpetussuunnitelmanPohjanSisaltoviitteet(
    props.toteutussuunnitelmaId,
    'opintokokonaisuus',
    props.koulutustoimijaId,
  )).data;
};

const onRowSelected = (rows: any[]) => {
  if (!rows?.length) return;
  const opintokokonaisuusViite = rows[0];
  props.addArvioinnit(_.map(opintokokonaisuusViite.opintokokonaisuus.arvioinnit, arviointi => {
    return {
      ..._.pick(arviointi.arviointi, UiKielet),
    };
  }));
  arviointiImportModal.value?.hide();
};

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

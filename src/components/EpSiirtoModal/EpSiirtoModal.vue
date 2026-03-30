<template>
  <div>
    <ep-button
      class="siirra-opetussuunnitelma"
      variant="link"
      @click="epsiirtomodaali?.show()"
    >
      {{ $t(kielistykset['siirratoteutusystavaorganisaatiolle']) }}
    </ep-button>

    <ep-modal
      ref="epsiirtomodaali"
      size="lg"
      :header="$t(kielistykset['siirratoteutusystavaorganisaatiolle'])"
      hide-footer
    >
      <p>{{ $t('siirra-kuvaus') }}</p>
      <div v-if="ystavatFormatted">
        <ep-search
          v-model="nimiFilter"
          :placeholder="$t('etsi-organisaatiota')"
          class="mb-3"
        />
        <ep-table
          responsive
          striped
          :items="ystavatFormatted"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          data-key="organisaatio"
          @update:current-page="currentPage = $event"
        >
          <template #cell(actions)="row">
            <ep-button
              v-if="row.item.siirrettavissa"
              class="siirra"
              variant="link"
              @click="siirraToteutussuunnitelma(row.item)"
            >
              {{ $t(kielistykset['siirratoteutus']) }}
            </ep-button>
          </template>
        </ep-table>
      </div>
      <ep-spinner v-else />
    </ep-modal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref, watch, useTemplateRef } from 'vue';
import { Koulutustoimijat, KoulutustoimijaYstavaDto, Opetussuunnitelmat } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { ToteutussuunnitelmaSiirtoKielistykset } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';
import { OphOrgOid } from '@/stores/kayttaja';
import { $t, $kaanna, $filterBy, $confirmModal, $fail, $success } from '@shared/utils/globals';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';
import type { TableField } from '@shared/components/EpTable/EpTable.vue';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelma: any;
  toteutus: Toteutus;
}>();

const ystavat = ref<KoulutustoimijaYstavaDto[] | null>(null);
const currentPage = ref(1);
const perPage = ref(5);
const nimiFilter = ref('');

const epsiirtomodaali = useTemplateRef('epsiirtomodaali');
const router = useRouter();

watch(() => props.koulutustoimijaId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    await fetch();
  }
});

const fetch = async () => {
  ystavat.value = (await Koulutustoimijat.getOmatYstavat(props.koulutustoimijaId)).data;
};

const fields = computed((): TableField[] => {
  return [{
    key: 'nimiLocalized',
    tdClass: 'align-middle',
    label: $t('nimi'),
  }, {
    key: 'actions',
    label: $t('toiminto'),
  }];
});

const ystavatFormatted = computed(() => {
  return _(ystavat.value)
    .map(org => ({
      ...org,
      nimiLocalized: $kaanna(org.nimi!),
      siirrettavissa: org.organisaatio !== OphOrgOid,
    }))
    .filter($filterBy('nimiLocalized', nimiFilter.value))
    .value();
});

const kieli = computed(() => {
  return Kielet.uiKieli;
});

const siirraToteutussuunnitelma = async (org: any) => {
  epsiirtomodaali.value?.hide();
  if (await $confirmModal.msgBoxConfirm($t('siirra-toteutussuunnitelma-varmistus', { nimi: $kaanna(props.toteutussuunnitelma.nimi) }) as string, {
    title: $t('siirra-toteutussuunnitelma') as string,
    okVariant: 'primary',
    okTitle: $t('siirra-toteutussuunnitelma') as string,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as string,
    centered: true,
  })) {
    try {
      await Opetussuunnitelmat.updateOpetussuunnitelmaKoulutustoimija(_.parseInt(props.toteutussuunnitelma.id), props.koulutustoimijaId, org);
      $success('siirra-toteutussuunnitelma-onnistui');
      router.replace({
        name: 'toteutussuunnitelmat',
        params: {
          lang: kieli.value.value,
          koulutustoimijaId: props.koulutustoimijaId,
        },
      });
    }
    catch (err) {
      $fail('siirra-toteutussuunnitelma-epaonnistui');
    }
  }
};

const kielistykset = computed(() => {
  return ToteutussuunnitelmaSiirtoKielistykset[props.toteutus];
});

onMounted(async () => {
  await fetch();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(.siirra .btn .teksti), :deep(.siirra .btn) {
    padding-left: 0px !important;
  }

</style>

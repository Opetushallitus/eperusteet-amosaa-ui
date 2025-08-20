<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
    >
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.suorituspolkuViiteRoot.tekstiKappale.nimi) }}
        </h2>
      </template>

      <template #default="{ data, isEditing }">
        <ep-content
          v-model="data.suorituspolkuViiteRoot.tekstiKappale.teksti"
          layout="normal"
          :is-editable="isEditing"
        />

        <div
          v-if="!isEditing"
          class="d-flex justify-content-end"
        >
          <ep-button
            variant="outline-primary"
            icon="add"
            @click="lisaaUusiSuorituspolku"
          >
            {{ $t('lisaa-suorituspolku') }}
          </ep-button>
          <ep-button
            variant="outline-primary"
            icon="add"
            @click="lisaaUusiOsaSuorituspolku"
          >
            {{ $t('lisaa-osasuorituspolku') }}
          </ep-button>
        </div>

        <b-table
          striped
          hover
          responsive
          :items="data.suorituspolkuViitteet"
          :fields="fields"
        >
          <template #cell(nimi)="data">
            <router-link :to="{ name: 'suorituspolku', params: { sisaltoviiteId: data.item.id } }">
              {{ $kaanna(data.item.tekstiKappale.nimi) || $t('nimeton') }}
            </router-link>
          </template>
        </b-table>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { SuorituspolutStore } from '@/stores/SuorituspolutStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { MatalaTyyppiEnum, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { $t, $kaanna, $sdt } from '@shared/utils/globals';

const props = defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
}>();

const route = useRoute();
const instance = getCurrentInstance();

const editointiStore = ref<EditointiStore | null>(null);

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const fields = computed(() => {
  return [{
    key: 'nimi',
    sortable: true,
    sortByFormatted: true,
    label: $t('nimi') as string,
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'laajuus',
    sortable: true,
    label: $t('laajuus') as string,
    formatter: (value: any, key: string, item: any) => {
      if (value) {
        return value + ' ' + $t('osp');
      }

      return '';
    },
  }, {
    key: 'suorituspolku.muokattu',
    sortable: true,
    label: $t('muokattu') as string,
    formatter: (value: any, key: string, item: any) => {
      return $sdt(item.suorituspolku.muokattu);
    },
  }];
});

const fetch = () => {
  if (toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      new SuorituspolutStore(
        props.toteutussuunnitelmaId,
        props.koulutustoimijaId,
        props.sisaltoviiteId,
        toteutussuunnitelma.value.peruste!.id!,
        toteutussuunnitelma.value.suoritustapa!,
        versionumero.value));
  }
};

const updateNavigation = async () => {
  await props.toteutussuunnitelmaStore.initNavigation();
};

const lisaaSuorituspolkuStoreen = async (tyyppi: MatalaTyyppiEnum) => {
  await SisaltoViiteStore.add(
    props.toteutussuunnitelmaId,
    props.sisaltoviiteId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(tyyppi),
      tekstiKappale: {
        nimi: { [Kielet.getSisaltoKieli.value]: '' },
      },
    } as SisaltoviiteMatalaDto);
};

const lisaaUusiSuorituspolku = async () => {
  await lisaaSuorituspolkuStoreen(MatalaTyyppiEnum.SUORITUSPOLKU);
};

const lisaaUusiOsaSuorituspolku = async () => {
  await lisaaSuorituspolkuStoreen(MatalaTyyppiEnum.OSASUORITUSPOLKU);
};

watch(toteutussuunnitelma, () => {
  fetch();
}, { immediate: true });

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

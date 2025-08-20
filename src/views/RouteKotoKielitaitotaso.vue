<template>
  <div>
    <EpEditointi
      v-if="editointiStore"
      :store="editointiStore"
      :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
    >
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.perusteenOsa.nimi) }}
        </h2>
      </template>
      <template #default="{ isEditing, data: { perusteenOsa, kotoKielitaitotaso, perusteenLaajaAlaisetOsaamiset } }">
        <EpContent
          v-model="perusteenOsa.kuvaus"
          class="mb-4"
          layout="normal"
          :is-editable="false"
        />

        <EpKotoTaitotasot
          v-model="perusteenOsa.taitotasot"
          class="mb-4"
          :is-editing="false"
          taitotaso-tyyppi="kielitaitotaso"
        >
          <template #paikallinentarkennus="{ taitotaso }">
            <h4 class="mt-4">
              {{ $t('tavoitteiden-paikallinen-tarkennus') }}
            </h4>

            <EpContent
              v-if="isEditing || (taitotaso.nimi && kotoTaitotasotByUri[taitotaso.nimi.uri].tavoiteTarkennus)"
              v-model="kotoTaitotasotByUri[taitotaso.nimi.uri].tavoiteTarkennus"
              layout="normal"
              :is-editable="isEditing"
            />
            <EpAlert
              v-if="!isEditing && !kotoTaitotasotByUri[taitotaso.nimi.uri].tavoiteTarkennus"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
            />
          </template>
        </EpKotoTaitotasot>

        <hr>

        <EpKotoLaajaAlainenOsaaminen
          v-model="kotoKielitaitotaso.laajaAlaisetOsaamiset"
          :perusteen-laaja-alaiset-osaamiset="perusteenLaajaAlaisetOsaamiset"
          :is-editing="isEditing"
        />
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';

import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKotoLaajaAlainenOsaaminen from '@/components/EpKotoLaajaAlainenOsaaminen/EpKotoLaajaAlainenOsaaminen.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { KotoSisaltoStore } from '@/stores/KotoSisaltoStore';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const route = useRoute();

const editointiStore = ref<EditointiStore | null>(null);

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const kotoTaitotasotByUri = computed(() => {
  return _.keyBy(editointiStore.value?.data.kotoKielitaitotaso.taitotasot, 'koodiUri');
});

const fetch = () => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      new KotoSisaltoStore(
        props.toteutussuunnitelmaId,
        props.koulutustoimijaId,
        props.sisaltoviiteId,
        versionumero.value,
        props.toteutussuunnitelmaStore.toteutussuunnitelma.value as OpetussuunnitelmaDto));
  }
};

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });

watch(toteutussuunnitelma, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

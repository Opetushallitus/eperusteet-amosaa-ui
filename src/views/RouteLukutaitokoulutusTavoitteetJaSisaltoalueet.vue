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
      <template #default="{ isEditing, data }">
        <div
          v-for="(tavoitealue, tavoitealueIndex) in data.perusteenOsa.tavoitealueet"
          :key="'tavoitealue' + tavoitealueIndex"
          class="mb-5"
        >
          <h3 class="mb-3">
            {{ $kaanna(tavoitealue.nimi) }}
          </h3>
          <template v-if="tavoitealue.tavoitteet && tavoitealue.tavoitteet.length > 0">
            <div class="font-semibold mb-2">
              {{ $t('opiskelija-osaa') }}
            </div>
            <ul class="mb-0">
              <li
                v-for="(tavoite, index) in tavoitealue.tavoitteet"
                :key="'tavoite' + tavoitealueIndex + '-' + index"
              >
                {{ $kaanna(tavoite) }}
              </li>
            </ul>
          </template>
        </div>

        <h4>
          {{ $t('paikallinen-teksti') }}
        </h4>
        <EpContent
          v-if="isEditing || data.lukutaitoTavoitealue.paikallinenTarkennus"
          v-model="data.lukutaitoTavoitealue.paikallinenTarkennus"
          layout="normal"
          :is-editable="isEditing"
        />

        <EpAlert
          v-if="!isEditing && !data.lukutaitoTavoitealue.paikallinenTarkennus"
          class="mt-3"
          :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
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

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { YleinenSisaltoViiteStore } from '@/stores/YleinenSisaltoViiteStore';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { $t, $kaanna } from '@shared/utils/globals';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

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

const fetch = () => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      new YleinenSisaltoViiteStore(
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

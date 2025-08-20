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
      <template #default="{ isEditing, data: { perusteenOsa, kotoLaajaAlainenOsaaminen } }">
        <EpContent
          v-model="perusteenOsa.yleiskuvaus"
          class="mb-4"
          layout="normal"
          :is-editable="false"
        />

        <div
          v-for="(osaamisalue, index) in perusteenOsa.osaamisAlueet"
          :key="index+'kotoLaajaAlainenOsaaminen'"
          class="mb-4"
        >
          <h3>{{ $kaanna(osaamisalue.koodi.nimi) }}</h3>
          <EpContent
            v-model="osaamisalue.kuvaus"
            layout="normal"
            :is-editable="false"
          />
        </div>

        <b-form-group>
          <template #label>
            <h3>{{ $t('laaja-alaisen-osaamisen-paikallinen-tarkennus') }}</h3>
          </template>
          <EpContent
            v-if="isEditing || kotoLaajaAlainenOsaaminen.teksti"
            v-model="kotoLaajaAlainenOsaaminen.teksti"
            layout="normal"
            :is-editable="isEditing"
          />
          <EpAlert
            v-if="!isEditing && !kotoLaajaAlainenOsaaminen.teksti"
            :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
          />
        </b-form-group>
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

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { YleinenSisaltoViiteStore } from '@/stores/YleinenSisaltoViiteStore';
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

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

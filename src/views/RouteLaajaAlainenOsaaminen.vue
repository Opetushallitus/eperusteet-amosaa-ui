<template>
  <EpEditointi
    v-if="editointiStore"
    :store="editointiStore"
    :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
  >
    <template #header="{ data }">
      <h2 class="m-0">
        {{ $kaanna(data.tuvaLaajaAlainenOsaaminen.nimi) }}
      </h2>
    </template>
    <template #default="{ data, data: { tuvaLaajaAlainenOsaaminen }, isEditing }">
      <b-row>
        <b-col md="10">
          <EpCollapse v-if="isEditing || (data.naytaPerusteenTeksti && perusteenTeksti)">
            <template #header>
              <h4>{{ $t('perusteen-teksti') }}</h4>
            </template>
            <ep-content
              v-model="perusteenTeksti"
              layout="normal"
              :is-editable="false"
            />
            <ep-toggle
              v-if="isEditing"
              v-model="data.naytaPerusteenTeksti"
              :is-editing="true"
            >
              {{ $t('nayta-perusteen-teksti') }}
            </ep-toggle>
          </EpCollapse>

          <b-form-group
            v-if="naytaPaikallinenTeksti"
            :label="$t('paikallinen-teksti')"
          >
            <ep-content
              v-if="isEditing || tuvaLaajaAlainenOsaaminen.teksti"
              v-model="tuvaLaajaAlainenOsaaminen.teksti"
              layout="normal"
              :is-editable="isEditing"
            />
            <EpAlert
              v-if="!isEditing && !tuvaLaajaAlainenOsaaminen.teksti"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </template>
  </EpEditointi>
  <EpSpinner
    v-else
    class="my-3"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/generated/amosaa';
import { YleinenSisaltoViiteStore } from '@/stores/YleinenSisaltoViiteStore';
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

const naytaPaikallinenTeksti = computed(() => {
  return toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPS);
});

const perusteenTeksti = computed(() => {
  if (editointiStore.value?.data?.perusteenOsa) {
    return editointiStore.value.data.perusteenOsa.teksti;
  }

  return editointiStore.value?.data.perusteteksti;
});

const fetch = () => {
  editointiStore.value = new EditointiStore(
    new YleinenSisaltoViiteStore(
      props.toteutussuunnitelmaId,
      props.koulutustoimijaId,
      props.sisaltoviiteId,
      versionumero.value,
      props.toteutussuunnitelmaStore.toteutussuunnitelma.value as any));
};

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">

</style>

<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header>
        <div class="d-flex">
          <h2 class="m-0">
            <span v-if="perusteenOsaAlue">{{ $kaanna(perusteenOsaAlue.nimi) }}</span>
            <span v-else-if="osaAlueValue.nimi">{{ $kaanna(osaAlueValue.nimi) }}</span>
          </h2>
          <span
            v-if="osaAlueValue.piilotettu"
            class="ml-2"
          >({{ $t('piilotettu') }})</span>
        </div>
      </template>
      <template #default="{ data, supportData, isEditing }">
        <div
          v-if="isEditing"
          class="mb-4"
        >
          <ep-toggle v-model="osaAlueValue.piilotettu">
            {{ $t('piilota-osa-alue-julkisesta-suunnitelmasta') }}
          </ep-toggle>
        </div>
        <div
          v-else-if="osaAlueValue.piilotettu"
          class="disabled-text mb-4"
        >
          {{ $t('osa-alue-piilotettu-julkisesta-suunnitelmasta') }}
        </div>

        <div class="d-flex flex-lg-wrap justify-content-between">
          <b-form-group
            v-if="isEditing"
            class="flex-grow-1 mr-6"
            :label="$t('osa-alueen-nimi')"
          >
            <ep-field
              v-if="tyyppi === 'paikallinen'"
              v-model="data.osaAlueet[osaAlueIdx].nimi"
              :is-editing="isEditing"
            />
            <span v-else>{{ $kaanna(perusteenOsaAlue.nimi) }}</span>
          </b-form-group>

          <b-form-group
            v-if="perusteenOsaAlue"
            class="flex-grow-1 mr-6"
            :label="$t('koodi')"
          >
            <span>{{ perusteenOsaAlue.koodi.arvo }}</span>
          </b-form-group>
        </div>

        <div
          v-if="tyyppi === 'paikallinen'"
          class="d-flex flex-lg-wrap justify-content-between"
        >
          <b-form-group
            class="flex-grow-1 mr-6"
            :label="$t('koodi')"
          >
            <ep-field
              v-model="data.osaAlueet[osaAlueIdx].koodi"
              type="string"
              :is-editing="isEditing"
            />
          </b-form-group>
        </div>

        <b-form-group
          v-if="supportData.tutkinnonOsa"
          :label="$t('tutkinnon-osa')"
        >
          <router-link :to="{ name: 'tutkinnonosa' }">
            {{ $kaanna(supportData.tutkinnonOsa.nimi) }}
          </router-link>
        </b-form-group>

        <h3 v-if="isEditing">
          {{ $t('paikallinen-tarkennus') }}
        </h3>
        <ep-content
          v-model="data.osaAlueet[osaAlueIdx].paikallinenTarkennus"
          layout="normal"
          :is-editable="isEditing"
        />

        <h3
          v-if="isEditing && data.osaAlueet[osaAlueIdx].vapaat.length > 0"
          class="pt-5 pb-2"
        >
          {{ $t('tekstikappaleet') }}
        </h3>
        <EpVapaatTekstit
          v-model="data.osaAlueet[osaAlueIdx].vapaat"
          :is-editing="isEditing"
        />

        <b-tabs class="ml-0 pl-0 mt-4">
          <b-tab
            :title="$t('paikallinen-toteutus')"
            class="mt-4"
          >
            <h3 class="mt-4 mb-4">
              {{ $t('toteutukset') }}
            </h3>
            <EpOsaAlueToteutukset
              v-model="data.osaAlueet[osaAlueIdx].toteutukset"
              :is-editing="isEditing"
            />
          </b-tab>

          <b-tab
            v-if="tyyppi === 'paikallinen'"
            :title="$t('sisalto')"
          >
            <h3 class="mt-4 mb-4">
              {{ $t('sisalto') }}
            </h3>

            <b-form-group>
              <template #label>
                <h4 class="pt-3">
                  {{ $t('laajuus') }}
                </h4>
              </template>
              <div class="d-flex align-items-center">
                <ep-field
                  v-model="data.osaAlueet[osaAlueIdx].laajuus"
                  type="number"
                  :is-editing="isEditing"
                />
                <div class="ml-2">
                  {{ $t('osaamispiste') }}
                </div>
              </div>
            </b-form-group>

            <b-form-group>
              <template #label>
                <h4 class="pt-3">
                  {{ $t('osaamistavoitteet') }}
                </h4>
              </template>
              <EpAmmattitaitovaatimukset
                v-model="data.osaAlueet[osaAlueIdx].osaamistavoitteet"
                :kohdealueettomat="false"
                :kaannos-tavoiteet="$t('tavoitteet')"
                :kaannos-lisaa-kohdealue="$t('lisaa-tavoiteryhma')"
                :kaannos-lisaa-ammattitaitovaatimus="$t('lisaa-tavoite')"
                kaannos-kohdealueet=""
                :kaannos-kohdealue="$t('tavoitteiden-otsikko')"
                :kaannos-vaatimukset="$t('tavoitteet')"
                :kaannos-kohde="$t('opiskelija')"
                tavoitekoodisto=""
                :show-kohde="false"
                :is-editing="isEditing"
              />
            </b-form-group>

            <b-form-group>
              <GeneerinenArviointi
                v-model="data.osaAlueet[osaAlueIdx].geneerinenarviointi"
                :is-editing="isEditing"
              />
            </b-form-group>
          </b-tab>

          <b-tab
            v-else
            :title="$t('perusteen-sisalto')"
          >
            <Osaamistavoitteet
              v-model="data.osaAlueet[osaAlueIdx]"
              :is-editing="isEditing"
              :tyyppi="tyyppi"
              :peruste-data="perusteenOsaAlue"
            />
          </b-tab>
        </b-tabs>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import Osaamistavoitteet from '@shared/components/EpTutkinnonosa/Osaamistavoitteet.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpOsaAlueToteutukset from '@/components/EpAmmatillinen/EpOsaAlueToteutukset.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import GeneerinenArviointi from '@/components/EpAmmatillinen/GeneerinenArviointi.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpVapaatTekstit from '@/components/common/EpVapaatTekstit.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OsaAlueStore } from '@/stores/OsaAlueStore';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: string | number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  sisaltoviiteId: string | number;
  osaalueId: string | number;
}>();

const instance = getCurrentInstance();

const editointiStore = ref<EditointiStore | null>(null);

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value || null;
});

const perusteId = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value!.peruste!.id;
});

const support = computed(() => {
  if (editointiStore.value && editointiStore.value.supportData.value) {
    return editointiStore.value.supportData.value;
  }
  return null;
});

const storeData = computed(() => {
  if (editointiStore.value) {
    return editointiStore.value.data;
  }
  return null;
});

const osaAlueIdx = computed(() => {
  if (!storeData.value) {
    return -1;
  }
  return _.findIndex(storeData.value.osaAlueet, { id: Number(props.osaalueId) });
});

const osaAlueValue = computed(() => {
  if (storeData.value && osaAlueIdx.value > -1) {
    return storeData.value.osaAlueet[osaAlueIdx.value as number];
  }
  return null;
});

const perusteenOsaAlue = computed(() => {
  if (osaAlueValue.value && support.value) {
    return _.find(support.value.tutkinnonOsa.osaAlueet || [], { id: Number(osaAlueValue.value.perusteenOsaAlueId!) }) || null;
  }
  return null;
});

const tyyppi = computed(() => {
  return osaAlueValue.value?.tyyppi;
});

const osaamistavoitteidenNimi = computed(() => {
  if (tyyppi.value === 'pakollinen') {
    return 'pakolliset-osaamistavoitteet';
  }
  else if (tyyppi.value === 'valinnainen') {
    return 'valinnaiset-osaamistavoitteet';
  }
  else if (tyyppi.value === 'paikallinen') {
    return 'paikalliset-osaamistavoitteet';
  }
  return undefined;
});

const fetch = _.debounce(() => {
  if (toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      new OsaAlueStore(
        _.toNumber(props.toteutussuunnitelmaId),
        _.toString(props.koulutustoimijaId),
        _.toNumber(props.sisaltoviiteId),
        perusteId.value!,
        null as unknown as number,
        false,
        _.toNumber(props.osaalueId)));
  }
}, 100);

const updateNavigation = async () => {
  await props.toteutussuunnitelmaStore.initNavigation();
};

watch(toteutussuunnitelma, () => {
  fetch();
}, { immediate: true });

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(() => props.osaalueId, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

</style>

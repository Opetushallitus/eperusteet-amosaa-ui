<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
      label-remove-confirm="vahvista-tekstikappaleen-poisto"
    >
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.tekstiKappale.nimi) }}
        </h2>
      </template>

      <template #default="{ data, isEditing }">
        <div class="container">
          <div v-if="perusteteksti || data.pohjanTekstikappale">
            <EpCollapse
              v-if="perusteteksti && (isEditing || data.naytaPerusteenTeksti)"
              :border-bottom="naytaPaikallinenTeksti"
            >
              <template #header>
                <h4>{{ $t('perusteen-teksti') }}</h4>
              </template>
              <ep-content
                v-model="perusteteksti"
                layout="normal"
                :is-editable="false"
                :kuva-handler="kuvaHandler"
              />
              <ep-toggle
                v-if="isEditing"
                v-model="data.naytaPerusteenTeksti"
                :is-editing="true"
              >
                {{ $t('nayta-perusteen-teksti') }}
              </ep-toggle>
            </EpCollapse>

            <EpCollapse v-if="data.pohjanTekstikappale && data.pohjanTekstikappale.teksti">
              <template #header>
                <h4>
                  {{ $t('pohjan-teksti') }} <template v-if="pohja">
                    ({{ $kaanna(pohja.nimi) }})
                  </template>
                </h4>
              </template>
              <ep-content
                v-model="data.pohjanTekstikappale.teksti"
                layout="normal"
                :is-editable="false"
                :kuva-handler="kuvaHandler"
              />
              <ep-toggle
                v-if="isEditing"
                v-model="data.naytaPohjanTeksti"
                :is-editing="true"
              >
                {{ $t('nayta-pohjan-teksti') }}
              </ep-toggle>
            </EpCollapse>

            <b-form-group
              v-if="naytaPaikallinenTeksti"
              :label="$t('paikallinen-teksti')"
            >
              <ep-content
                v-if="isEditing || data.tekstiKappale.teksti"
                v-model="data.tekstiKappale.teksti"
                layout="normal"
                :is-editable="isEditing"
                :kuva-handler="kuvaHandler"
              />
              <EpAlert
                v-if="!isEditing && !data.tekstiKappale.teksti"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
                class="pb-3"
              />
            </b-form-group>
          </div>

          <div v-else>
            <b-form-group
              v-if="isEditing"
              :label="$t('otsikko')"
            >
              <ep-field
                v-model="data.tekstiKappale.nimi"
                :is-editing="isEditing"
              />
            </b-form-group>

            <b-form-group
              :label="$t('kappaleen-teksti')"
              :label-sr-only="!isEditing"
            >
              <ep-content
                v-model="data.tekstiKappale.teksti"
                layout="normal"
                :is-editable="isEditing"
                :kuva-handler="kuvaHandler"
              />
            </b-form-group>
          </div>
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ITekstikappale } from '@/stores/TekstikappaleStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { Koulutustyyppi } from '@shared/tyypit';
import { Toteutus } from '@shared/utils/perusteet';
import { OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  toteutus: Toteutus;
  tekstikappaleStore: ITekstikappale;
}>();

const route = useRoute();

const editointiStore = ref<EditointiStore | null>(null);

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const kuvaHandler = computed(() => {
  return createKuvaHandler(new KuvaStore(props.toteutussuunnitelmaId, props.koulutustoimijaId));
});

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const naytaPaikallinenTeksti = computed(() => {
  return toteutussuunnitelma.value?.koulutustyyppi as any !== Koulutustyyppi.tutkintoonvalmentava
    || toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPS)
    || perusteteksti.value;
});

const pohja = computed(() => {
  return props.toteutussuunnitelmaStore.pohja.value;
});

const perusteteksti = computed(() => {
  return editointiStore.value?.data?.perusteenOsa?.teksti;
});

const fetch = () => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      props.tekstikappaleStore.create(
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
@import "@shared/styles/_variables.scss";

  :deep(fieldset) {
    padding-right: 0;
  }

  .container {
    margin-left: 0;
    margin-right: 0;
  }

</style>

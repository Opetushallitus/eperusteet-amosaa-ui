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
          {{ $kaanna(data.tekstiKappale.nimi) }}
        </h2>
      </template>
      <template #default="{ data, supportData, isEditing }">
        <b-form-group
          v-if="isEditing"
          :label="$t('suorituspolku-nimi') +' *'"
        >
          <ep-field
            v-model="data.tekstiKappale.nimi"
            :is-editing="true"
          />
        </b-form-group>

        <b-form-group :label="$t('suorituspolku-kuvaus')">
          <ep-content
            v-model="data.tekstiKappale.teksti"
            layout="normal"
            :is-editable="isEditing"
          />
          <div
            v-if="isEditing"
            class="mt-3"
          >
            <EpToggle
              :model-value="data.tyyppi === 'osasuorituspolku'"
              :is-editing="isEditing"
              @update:model-value="toggleTyyppi(data)"
            >
              {{ $t('osasuorituspolku') }}
            </EpToggle>
          </div>
        </b-form-group>

        <b-form-group
          v-if="data.tyyppi === 'osasuorituspolku'"
          :label="$t('osasuorituspolun-kokonaislaajuus')"
        >
          <div class="d-flex">
            <ep-field
              v-model="data.suorituspolku.osasuorituspolkuLaajuus"
              type="number"
              :is-editing="isEditing"
            />
            <div
              class="ml-1"
              :class="{'ml-2 pt-1': isEditing}"
            >
              {{ $t('osaamispiste') }}
            </div>
          </div>
        </b-form-group>
        <b-form-group
          v-else
          :label="$t('tutkinnon-kuvaus')"
        >
          <ep-content
            v-model="supportData.rakenne.kuvaus"
            layout="normal"
          />
          <div
            v-if="isEditing"
            class="mt-3"
          >
            <EpToggle
              v-model="data.naytaPerusteenTeksti"
              :is-editing="true"
            >
              {{ $t('nayta-kuvaus-julkisesti') }}
            </EpToggle>
          </div>
        </b-form-group>

        <div class="suorituspolut">
          <div class="st-header">
            <div class="d-flex justify-content-between w-100">
              <div class="w-75">
                <div class="d-flex align-items-center">
                  <div class="font-weight-bold mr-5">
                    {{ $t('rakenne') }}
                  </div>
                  <b-button
                    variant="link"
                    @click="toggleOpen()"
                  >
                    {{ $t('avaa-sulje-kaikki') }}
                  </b-button>
                  <div class="ml-5">
                    <b-button
                      variant="link"
                      @click="toggleKuvaukset()"
                    >
                      {{ $t(naytaKuvaukset ? 'piilota-kuvaukset' : 'nayta-kuvaukset') }}
                    </b-button>
                  </div>
                  <div class="ml-5">
                    <b-button
                      variant="link"
                      @click="togglePoistetut()"
                    >
                      {{
                        $t(naytaPoistetut ? 'piilota-poistetut' : 'nayta-poistetut') }}
                    </b-button>
                  </div>
                </div>
              </div>
              <div class="w-25 text-right font-weight-bold">
                {{ $t('osaamispiste') }}
              </div>
            </div>
          </div>
          <div class="suorituspolku-sisalto">
            <EpSuorituspolkuNode
              v-model="data.suorituspolku"
              :is-editing="isEditing"
              :tutkinnon-osat="supportData.tutkinnonOsat"
              :tutkinnon-osa-viitteet="supportData.tutkinnonOsaViitteet"
              :tutkinnon-osa-viitteet-by-tutkinnon-osa-id="supportData.tutkinnonOsaViitteetByTutkinnonOsaId"
              :liitettavat-osat="supportData.liitettavatOsat"
              :nayta-kuvaukset="naytaKuvaukset"
              :nayta-piilotetut="naytaPoistetut"
              :node="supportData.rakenne"
              :nayta-rakenne="naytaRakenne"
            />
          </div>
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import _ from 'lodash';

import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSuorituspolkuNode from '@/components/EpAmmatillinen/EpSuorituspolkuNode.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { SisaltoEditStore } from '@/stores/SisaltoEditStore';
import { $t, $kaanna } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: string | number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  sisaltoviiteId: string | number;
  versionumero?: number;
}>(), {
  versionumero: undefined,
});

const instance = getCurrentInstance();

const editointiStore = ref<EditointiStore | null>(null);
const naytaPoistetut = ref(false);
const naytaKuvaukset = ref(false);
const naytaRakenne = ref(true);

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

const fetch = _.debounce(() => {
  if (toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      new SisaltoEditStore(
        _.toNumber(props.toteutussuunnitelmaId),
        _.toString(props.koulutustoimijaId),
        _.toNumber(props.sisaltoviiteId),
        perusteId.value!,
        props.versionumero,
        false));
  }
}, 100);

const toggleTyyppi = (data: any) => {
  if (data.tyyppi === 'suorituspolku') {
    data.tyyppi = 'osasuorituspolku';
  }
  else {
    data.tyyppi = 'suorituspolku';
  }
};

const toggleOpen = () => {
  naytaRakenne.value = !naytaRakenne.value;
};

const toggleKuvaukset = () => {
  naytaKuvaukset.value = !naytaKuvaukset.value;
};

const togglePoistetut = () => {
  naytaPoistetut.value = !naytaPoistetut.value;
};

const updateNavigation = async () => {
  await props.toteutussuunnitelmaStore.initNavigation();
};

watch(toteutussuunnitelma, () => {
  fetch();
}, { immediate: true });

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(() => props.versionumero, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.suorituspolut {
  padding-right: 20px;
  background-color: #f5f5f5;

  .st-header {
    padding: 20px 20px 0px 20px;
  }

  .suorituspolku-sisalto{
    padding-bottom: 20px;
  }
}

</style>

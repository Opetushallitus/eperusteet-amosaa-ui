<template>
  <div>
    <div v-if="!isEditing && toteutukset && toteutukset.length === 0">
      <EpAlert
        :text="$t('ei-sisaltoa') + '. ' + (tyyppi !== 'linkki' ? $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.' : '')"
        class="pb-3"
      />
    </div>
    <div v-else>
      <VueDraggable
        v-bind="toteutuksetOptions"
        v-model="toteutukset"
        tag="div"
      >
        <ep-collapse
          v-for="(toteutus, index) in toteutukset"
          :key="'toteutus'+index"
          class="toteutus pr-3 mb-4"
          :border-bottom="false"
        >
          <template #header="{ toggled }">
            <div class="px-3">
              <div
                v-if="isEditing"
                class="d-flex align-items-end"
              >
                <EpMaterialIcon class="order-handle">
                  drag_indicator
                </EpMaterialIcon>
                <h4 class="mb-0">
                  <span v-if="toggled || !toteutus.otsikko || !toteutus.otsikko[kieli]">{{ $t('toteutuksen-otsikko') }}<span v-if="isEditing"> *</span></span>
                  <span v-else-if="!toggled">{{ $kaanna(toteutus.otsikko) }}</span>
                </h4>
              </div>
              <h4 v-else>
                {{ $kaanna(toteutus.otsikko) }}
              </h4>
            </div>
          </template>
          <EpPaikallinenToteutus
            v-model="toteutukset[index]"
            :is-editing="isEditing"
            @poista="poistaToteutus(index)"
          />
        </ep-collapse>
      </VueDraggable>
    </div>

    <div class="d-flex">
      <ep-button
        v-if="isEditing"
        variant="outline-primary"
        icon="add"
        @click="lisaaToteutus()"
      >
        {{ $t('lisaa-toteutus') }}
      </ep-button>

      <EpOletustoteutusTuonti
        v-if="isEditing"
        :fetch="haeOletusTutkinnonosaToteutukset"
        @lisaaOletustoteutus="lisaaOletustoteutus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpPaikallinenToteutus from '@/components/EpAmmatillinen/EpPaikallinenToteutus.vue';
import EpOletustoteutusTuonti from '@/components/EpSisaltoLisays/EpOletustoteutusTuonti.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { VueDraggable } from 'vue-draggable-plus';

import { Kielet } from '@shared/stores/kieli';
import { TutkinnonosaApi } from '@shared/api/amosaa';
import { $t, $kaanna } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  isEditing?: boolean;
  modelValue: any;
  tyyppi: any;
}>(), {
  isEditing: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
}>();

const route = useRoute();

const toteutukset = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const toteutuksetOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    disabled: !props.isEditing,
    forceFallback: true,
    handle: '.order-handle',
    group: {
      name: 'toteutukset',
      pull: 'clone',
      put: false,
      revertClone: true,
    },
  };
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const toteutussuunnitelmaId = computed(() => {
  return _.toNumber(route.params.toteutussuunnitelmaId);
});

const koulutustoimijaId = computed(() => {
  return route.params.koulutustoimijaId as string;
});

const lisaaToteutus = () => {
  toteutukset.value = [
    ...(toteutukset.value || []), {
      tavatjaymparisto: {},
      arvioinnista: {},
      vapaat: [],
      koodit: [],
    },
  ];
};

const lisaaOletustoteutus = (toteutus: any) => {
  toteutukset.value = [
    ...(toteutukset.value || []),
    toteutus,
  ];
};

const poistaToteutus = (idx: number) => {
  toteutukset.value = _.reject(toteutukset.value, (v, tIdx: number) => idx === tIdx);
};

const haeOletusTutkinnonosaToteutukset = async () => {
  return (await TutkinnonosaApi.haeOletusTutkinnonosaToteutukset(toteutussuunnitelmaId.value, koulutustoimijaId.value)).data;
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.toteutus {
  @include tile-background-shadow;
  border-radius: 10px;
}

</style>

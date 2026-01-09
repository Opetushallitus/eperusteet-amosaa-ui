<template>
  <div>
    <VueDraggable
      v-bind="defaultDragOptions"
      v-model="model"
      tag="div"
    >
      <EpCollapse
        v-for="(toteutus, toteutusIndex) in model"
        :key="'toteutus'+toteutusIndex"
        class="toteutus p-3 mb-4 w-100"
        :border-bottom="false"
        :collapsable="!isEditing"
        :use-padding="false"
      >
        <template #header>
          <h4
            v-if="!isEditing"
            class="ml-3"
          >
            {{ $kaanna(toteutus.otsikko) }}
          </h4>
        </template>

        <div class="d-flex">
          <div class="order-handle mr-3">
            <EpMaterialIcon v-if="isEditing">
              drag_indicator
            </EpMaterialIcon>
          </div>

          <EpPaikallinenToteutus
            v-model="model[toteutusIndex]"
            :is-editing="isEditing"
            @poista="poistaToteutus(model[toteutusIndex])"
          >
            <template #oletustoteutus>
              <div>{{ $t('tallenna-oletustoteutuksena-osa-alueeseen') }}</div>
            </template>
          </EpPaikallinenToteutus>
        </div>
      </EpCollapse>
    </VueDraggable>

    <div class="d-flex">
      <ep-button
        v-if="isEditing"
        variant="outline"
        icon="add"
        @click="lisaaToteutus()"
      >
        {{ $t('lisaa-toteutus') }}
      </ep-button>

      <EpOletustoteutusTuonti
        v-if="isEditing"
        :fetch="haeOletusOsaAlueToteutukset"
        @lisaa-oletustoteutus="lisaaOletustoteutus"
      >
        <template #title>
          <div>{{ $t('tuo-oletustoteutus-osa-alueeseen') }}</div>
        </template>
        <template #luotu>
          <div>{{ $t('luotu-osa-alueessa') }}</div>
        </template>
      </EpOletustoteutusTuonti>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed, getCurrentInstance } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpPaikallinenToteutus from '@/components/EpAmmatillinen/EpPaikallinenToteutus.vue';
import { OsaAlueApi, OmaOsaAlueToteutusDto } from '@shared/api/amosaa';
import EpOletustoteutusTuonti from '@/components/EpSisaltoLisays/EpOletustoteutusTuonti.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $kaanna, $t } from '@shared/utils/globals';
import { useRoute } from 'vue-router';

const props = defineProps<{
  modelValue: OmaOsaAlueToteutusDto[];
  isEditing?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const route = useRoute();

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const lisaaToteutus = () => {
  emit('update:modelValue', [
    ...props.modelValue,
    {
      tavatjaymparisto: {},
      arvioinnista: {},
      vapaat: [],
    },
  ]);
};

const poistaToteutus = (poistettavaOsaalue: any) => {
  emit('update:modelValue', _.filter(props.modelValue, toteutus => toteutus !== poistettavaOsaalue));
};

const haeOletusOsaAlueToteutukset = async () => {
  return (await OsaAlueApi.haeOletusOsaAlueToteutukset(toteutussuunnitelmaId.value, koulutustoimijaId.value)).data;
};

const lisaaOletustoteutus = (toteutus: any) => {
  model.value = [
    ...(model.value || []),
    toteutus,
  ];
};

const defaultDragOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !props.isEditing,
  };
});

const toteutussuunnitelmaId = computed(() => {
  return _.toNumber(route.params.toteutussuunnitelmaId);
});

const koulutustoimijaId = computed(() => {
  return route.params.toteutussuunnitelmaId;
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.toteutus {
  @include tile-background-shadow;
  border-radius: 10px;
}
</style>

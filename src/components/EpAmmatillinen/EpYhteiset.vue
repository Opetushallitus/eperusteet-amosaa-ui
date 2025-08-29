<template>
  <div>
    <ep-collapse
      :border-bottom="true"
      :collapsable="!isEditing"
      :class="{'pt-0 pb-0': isEditing}"
    >
      <template #header>
        <h3>{{ $t('pakolliset-osa-alueet') }}</h3>
      </template>

      <VueDraggable
        v-bind="pakollisetDraggableOptions"
        v-model="pakollisetOsaAlueet"
        tag="div"
      >
        <div
          v-for="(osaalue, idx) in pakollisetOsaAlueet"
          :key="'pakollinen-' + idx"
          class="osaalue d-flex"
        >
          <div
            v-if="isEditing"
            class="order-handle mr-2"
          >
            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
          </div>
          <div class="nimi">
            <router-link
              :is="isEditing ? 'span' : 'router-link'"
              :to="{ name: 'osaalue', params: { osaalueId: osaalue.id } }"
            >
              {{ $kaanna(osaalue.perusteenData.nimi) }}
            </router-link>
          </div>
          <div class="koodi ml-1">
            ({{ osaalue.perusteenData.koodi.arvo }})
          </div>
        </div>
      </VueDraggable>
    </ep-collapse>

    <ep-collapse
      :border-bottom="true"
      :collapsable="!isEditing"
      :class="{'pt-0 pb-0': isEditing}"
    >
      <template #header>
        <h3>{{ $t('valinnaiset-osa-alueet') }}</h3>
      </template>

      <VueDraggable
        v-bind="valinnaisetDraggableOptions"
        v-model="valinnaisetOsaAlueet"
        tag="div"
      >
        <div
          v-for="(osaalue, idx) in valinnaisetOsaAlueet"
          :key="'valinnainen-' + idx"
          class="osaalue d-flex"
          :class="{ 'piilotettu': osaalue.piilotettu }"
        >
          <div
            v-if="isEditing"
            class="order-handle mr-2"
          >
            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
          </div>
          <div class="nimi">
            <router-link
              :is="isEditing ? 'span' : 'router-link'"
              :to="{ name: 'osaalue', params: { osaalueId: osaalue.id } }"
            >
              {{ $kaanna(osaalue.perusteenData.nimi) }}
              <span v-if="osaalue.piilotettu">
                ({{ $t('piilotettu') }})
              </span>
            </router-link>
          </div>
          <div class="koodi ml-1">
            ({{ osaalue.perusteenData.koodi.arvo }})
          </div>
        </div>
      </VueDraggable>
    </ep-collapse>

    <ep-collapse
      :border-bottom="false"
      :class="{'pt-0 pb-0': isEditing}"
    >
      <template #header>
        <h3>{{ $t('paikalliset-osa-alueet') }}</h3>
      </template>

      <VueDraggable
        v-bind="paikallisetDraggableOptions"
        v-model="paikallisetOsaAlueet"
        tag="div"
      >
        <div
          v-for="(osaalue, idx) in paikallisetOsaAlueet"
          :key="'paikallinen-' + idx"
          class="osaalue d-flex"
        >
          <div
            v-if="isEditing"
            class="order-handle mr-2"
          >
            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
          </div>
          <div class="nimi">
            <router-link
              :is="isEditing ? 'span' : 'router-link'"
              :to="{ name: 'osaalue', params: { osaalueId: osaalue.id } }"
            >
              {{ $kaanna(osaalue.nimi) }}
            </router-link>
          </div>
          <div
            v-if="osaalue.koodi"
            class="koodi ml-1"
          >
            ({{ osaalue.koodi }})
          </div>
        </div>
      </VueDraggable>
    </ep-collapse>

    <slot name="uusiosaalue" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { VueDraggable } from 'vue-draggable-plus';

import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  isEditing: boolean;
  modelValue: any;
  perusteen: any;
}>();

const emit = defineEmits(['update:modelValue']);

const uudenNimi = ref<any | null>(null);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const perusteenOsaAlueet = computed(() => {
  return _(props.perusteen.osaAlueet)
    .filter((oa) => oa.tyyppi === 'osaalue2020')
    .keyBy('id')
    .value();
});

const osaAlueet = computed({
  get() {
    return _(props.modelValue.osaAlueet)
      .map(oa => ({
        ...oa,
        perusteenData: perusteenOsaAlueet.value[oa.perusteenOsaAlueId],
      }))
      .value();
  },
  set(val) {
    model.value.osaAlueet = val;
  },
});

const pakollisetOsaAlueet = computed({
  get() {
    return _.filter(osaAlueet.value, oa => oa.tyyppi === 'pakollinen');
  },
  set(val) {
    osaAlueet.value = [
      ...val,
      ...valinnaisetOsaAlueet.value,
      ...paikallisetOsaAlueet.value,
    ];
  },
});

const valinnaisetOsaAlueet = computed({
  get() {
    return _.filter(osaAlueet.value, oa => oa.tyyppi === 'valinnainen');
  },
  set(val) {
    osaAlueet.value = [
      ...pakollisetOsaAlueet.value,
      ...val,
      ...paikallisetOsaAlueet.value,
    ];
  },
});

const paikallisetOsaAlueet = computed({
  get() {
    return _.filter(osaAlueet.value, oa => oa.tyyppi === 'paikallinen');
  },
  set(val) {
    osaAlueet.value = [
      ...pakollisetOsaAlueet.value,
      ...valinnaisetOsaAlueet.value,
      ...val,
    ];
  },
});

const pakollisetDraggableOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !props.isEditing,
    group: {
      name: 'pakolliset',
    },
  };
});

const valinnaisetDraggableOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !props.isEditing,
    group: {
      name: 'valinnaiset',
    },
  };
});

const paikallisetDraggableOptions = computed(() => {
  return {
    ...DEFAULT_DRAGGABLE_PROPERTIES,
    disabled: !props.isEditing,
    group: {
      name: 'paikalliset',
    },
  };
});

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.osaalue {
  background: #e6f6ff;
  padding: 14px;
  border-radius: 40px;
  margin-bottom: 5px;

  .nimi {
  }

  .koodi {
    color: #414141;
  }
}

.piilotettu {
  background: #ccc;
}

</style>

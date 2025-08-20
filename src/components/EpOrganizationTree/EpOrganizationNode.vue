<template>
  <div class="d-flex align-content-stretch mb-3 organisaatio-box-container">
    <div
      class="organisaatio-box-color"
      :style="nodeStyle"
    />
    <div class="d-flex justify-content-between align-items-center organisaatio-box">
      <div class="p-3">
        {{ $kaanna(value.nimi) }}
      </div>
      <div v-if="!isEditing && !value.oid">
        <div v-if="status === 'oma'" />
        <ep-button
          v-else-if="status === 'odotetaan'"
          variant="link"
          @click="OrgEventBus.$emit('peruuta-yhteistyopyynto', value)"
        >
          {{ $t('peruuta-yhteistyopyynto') }}
        </ep-button>
        <div v-else-if="status === 'pyynto'">
          <ep-button
            variant="link"
            @click="OrgEventBus.$emit('hylkaa-yhteistyopyynto', value)"
          >
            {{ $t('hylkaa') }}
          </ep-button>
          <ep-button
            variant="primary"
            class="custom-margin"
            @click="OrgEventBus.$emit('hyvaksy-yhteistyopyynto', value)"
          >
            {{ $t('hyvaksy-yhteistyopyynto') }}
          </ep-button>
        </div>
        <ep-button
          v-else-if="status === 'yhteistyo'"
          variant="link"
          @click="OrgEventBus.$emit('lopeta-yhteistyo', value)"
        >
          {{ $t('lopeta-yhteistyo') }}
        </ep-button>
        <ep-button
          v-else
          variant="link"
          @click="OrgEventBus.$emit('laheta-yhteistyopyynto', value)"
        >
          {{ $t('laheta-yhteistyopyynto') }}
        </ep-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import { OrganizationEventBus } from '@/components/EpOrganizationTree/OrganizationEventBus';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { $kaanna, $t } from '@shared/utils/globals';

const colors = Object.freeze({
  'oma': '#E60895',
  'odotetaan': '#99B3F1',
  'pyynto': '#FFCD32',
  'yhteistyo': '#BEEAA0',
});

const props = defineProps<{
  value: any;
  isEditing: boolean;
  yhteistyoMap?: any[];
}>();

const yhteistyo = computed(() => {
  return props.yhteistyoMap?.[props.value.oid || props.value.organisaatio];
});

const status = computed(() => {
  if (yhteistyo.value) {
    return yhteistyo.value.status;
  }
  return undefined;
});

const ktId = computed(() => {
  if (yhteistyo.value) {
    return yhteistyo.value.id;
  }
  return undefined;
});

const color = computed(() => {
  return colors[status.value];
});

const nodeStyle = computed(() => {
  return color.value ? { 'background': color.value, 'border-color': color.value } : {};
});

const OrgEventBus = OrganizationEventBus;
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.organisaatio-title {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.organisaatio-box {
  border: 1px solid #E3E3E3;
  border-left-style: none;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  width: 100%;
}

.organisaatio-box-color {
  border: 1px solid #E3E3E3;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  background-color: none;
  min-width: 8px;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact
}

.custom-margin {
  margin-right: 1.625rem;
}

</style>

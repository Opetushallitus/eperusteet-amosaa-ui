<template>
  <b-row v-if="toteutus === 'vapaasivistystyo' && !model.peruste">
    <b-col :cols="asRows ? 12 : 6">
      <b-form-group :label="$t('jotpa-koulutus')">
        <EpToggle
          v-if="isEditing"
          v-model="jotpaSelect"
          checkbox
        >
          {{ $t('koulutus-on-jotpa-rahoitteinen') }}
        </EpToggle>
        <div v-if="!isEditing && !model.jotpatyyppi">
          {{ $t('ei-asetettu') }}
        </div>
        <div v-if="!isEditing && model.jotpatyyppi">
          {{ $t('koulutus-on-jotpa-rahoitteinen') }}
        </div>
      </b-form-group>
    </b-col>
    <b-col :cols="asRows ? 12 : 6">
      <b-form-group v-if="jotpaSelect">
        <template #label>
          <div>{{ $t('onko-kyseessa-vapaan-sivistystyon-jotpa-koulutus') }} <span v-if="isEditing">*</span></div>
        </template>
        <template v-if="isEditing">
          <EpRadio
            v-for="(jotpaValinta, index) in jotpaValinnat"
            :key="'jotparadiobutton'+index"
            v-model="model.jotpatyyppi"
            :value="jotpaValinta.value"
          >
            {{ $t(jotpaValinta.text) }}
          </EpRadio>
        </template>
        <div v-else>
          {{ $t(jotpaValinnatValueAsKey[model.jotpatyyppi].text) }}
        </div>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Toteutus } from '@shared/utils/perusteet';
import { OpetussuunnitelmaBaseDtoJotpatyyppiEnum } from '@shared/generated/amosaa';
import { $t } from '@shared/utils/globals';
import EpRadio from '@shared/components/forms/EpRadio.vue';

export interface OpsJotpa {
  peruste?: any;
  jotpa: boolean;
  jotpatyyppi: OpetussuunnitelmaBaseDtoJotpatyyppiEnum | null;
}

const props = defineProps<{
  modelValue: OpsJotpa;
  toteutus: Toteutus;
  isEditing?: boolean;
  asRows?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const jotpaValinnat = computed(() => {
  return [
    {
      value: OpetussuunnitelmaBaseDtoJotpatyyppiEnum.VST,
      text: 'kylla',
    },
    {
      value: OpetussuunnitelmaBaseDtoJotpatyyppiEnum.MUU,
      text: 'ei',
    },
  ];
});

const jotpaValinnatValueAsKey = computed(() => {
  return _.keyBy(jotpaValinnat.value, 'value');
});

const jotpa = computed(() => {
  return props.modelValue.jotpa;
});

const jotpaSelect = computed({
  get() {
    return !!model.value.jotpa || !!model.value.jotpatyyppi;
  },
  set(value) {
    model.value = {
      ...model.value,
      jotpa: value,
      jotpatyyppi: !value ? null : model.value.jotpatyyppi,
    };
  },
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

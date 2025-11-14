<template>
  <div>
    <div
      v-for="(vapaateksti, index) in modelValue"
      :key="'vapaateksti'+index"
      class="mt-4"
    >
      <h4 v-if="!isEditing">
        {{ $kaanna(vapaateksti.nimi) }}
      </h4>
      <h4 v-if="isEditing">
        {{ $t('tekstikappaleen-otsikko') }}
      </h4>
      <ep-field
        v-if="isEditing"
        v-model="vapaateksti.nimi"
        :is-editing="isEditing"
      />

      <h4
        v-if="isEditing"
        class="pt-3"
      >
        {{ $t('tekstikappaleen-sisalto') }}
      </h4>
      <ep-content
        v-model="vapaateksti.teksti"
        layout="normal"
        :is-editable="isEditing"
      />

      <div
        v-if="isEditing"
        class="d-flex justify-content-between mt-1"
      >
        <ep-button
          v-if="index+1 === modelValue.length"
          variant="outline-primary"
          icon="add"
          @click="lisaaTekstikappale()"
        >
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>
        <div v-else />

        <ep-button
          variant="link"
          icon="delete"
          @click="poistaTekstikappale(vapaateksti)"
        >
          {{ $t('poista-tekstikappale') }}
        </ep-button>
      </div>

      <hr v-if="modelValue.length > index+1">
    </div>

    <ep-button
      v-if="isEditing && modelValue.length === 0"
      variant="outline-primary"
      icon="add"
      @click="lisaaTekstikappale()"
    >
      {{ $t('lisaa-tekstikappale') }}
    </ep-button>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { VapaaTekstiDto } from '@shared/api/amosaa';
import { $kaanna, $t } from '@shared/utils/globals';

const props = defineProps<{
  modelValue: Array<VapaaTekstiDto>;
  isEditing?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const lisaaTekstikappale = () => {
  emit('update:modelValue', [
    ...props.modelValue,
    {},
  ]);
};

const poistaTekstikappale = (poistettava: any) => {
  emit('update:modelValue', _.filter(props.modelValue, vpTeksti => vpTeksti !== poistettava));
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

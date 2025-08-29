<template>
  <div class="paikallinentoteutus w-100 pl-3">
    <ep-field
      v-if="isEditing"
      v-model="toteutus.otsikko"
      :is-editing="isEditing"
    />

    <div class="mt-3">
      <h4 class="mt-3">
        {{ $t('tavat-ja-ymparisto') }}
      </h4>
      <ep-content
        v-model="toteutus.tavatjaymparisto.teksti"
        layout="normal"
        :is-editable="isEditing"
      />

      <h4 class="mt-3">
        {{ $t('osaamisen-arvioinnista') }}
      </h4>
      <ep-content
        v-model="toteutus.arvioinnista.teksti"
        layout="normal"
        :is-editable="isEditing"
      />

      <hr v-if="toteutus.vapaat.length > 0">

      <EpVapaatTekstit
        v-model="toteutus.vapaat"
        :is-editing="isEditing"
      />
    </div>

    <div
      v-if="isEditing"
      class="d-flex justify-content-between align-items-center pt-3"
    >
      <EpToggle
        v-if="isEditing"
        v-model="toteutus.oletustoteutus"
        class="oletustoteutus"
        checkbox
      >
        <slot name="oletustoteutus">
          {{ $t('tallenna-oletustoteutuksena-tutkinnon-osaan') }}
        </slot>
      </EpToggle>
      <ep-button
        v-if="isEditing"
        variant="link"
        icon="delete"
        @click="poistaToteutus"
      >
        {{ $t('poista-toteutus') }}
      </ep-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpVapaatTekstit from '@/components/common/EpVapaatTekstit.vue';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  isEditing?: boolean;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue', 'poista']);

const toteutus = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const poistaToteutus = () => {
  emit('poista');
};

const lisaaTekstikappale = () => {
  toteutus.value = {
    ...toteutus.value,
    vapaat: [...(toteutus.value.vapaat || []), {}],
  };
};

const poistaTekstikappale = (poistettava: any) => {
  toteutus.value = {
    ...toteutus.value,
    vapaat: _.filter(toteutus.value.vapaat, vpTeksti => vpTeksti !== poistettava),
  };
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.paikallinentoteutus {

  .oletustoteutus {
    margin-left: 15px;
  }

}

</style>

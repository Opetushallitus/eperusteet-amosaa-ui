<template>
  <div>
    <div
      v-for="(vaatimuksenKohde, kohdeIndex) in model"
      :key="'vaatimuksenkohde' + kohdeIndex"
      class="mb-4"
      :class="{'vaatimuksen-kohde': isEditing, 'p-3': isEditing}"
    >
      <div
        v-if="isEditing"
        class="font-weight-bold mb-2"
      >
        {{ $t('otsikko') }}
      </div>
      <ep-field
        v-model="vaatimuksenKohde.otsikko"
        :class="{'mb-3': isEditing}"
        :is-editing="isEditing"
      />

      <ul v-if="!isEditing">
        <li
          v-for="(vaatimus, index) in vaatimuksenKohde.vaatimukset"
          :key="'vaatimus' + kohdeIndex + index"
        >
          {{ $kaanna(vaatimus.selite) }} <span v-if="vaatimus.ammattitaitovaatimusKoodi">({{ vaatimus.ammattitaitovaatimusKoodi }})</span>
        </li>
      </ul>

      <div v-else>
        <div
          v-if="isEditing"
          class="font-weight-bold mb-2"
        >
          {{ $t('vaatimukset') }}
        </div>
        <div
          v-for="(vaatimus, index) in vaatimuksenKohde.vaatimukset"
          :key="'vaatimus' + kohdeIndex + index"
          class="d-flex ml-2 mb-2 w-100 justify-content-between align-items-center"
        >
          <ep-field
            v-model="vaatimus.selite"
            :is-editing="true"
            class="w-100"
          />
          <div class="d-flex ml-5">
            <div class="d-flex align-items-center">
              {{ $t('koodi') }}
            </div>
            <ep-input
              v-model="vaatimus.ammattitaitovaatimusKoodi"
              type="string"
              class="ml-2"
              :is-editing="true"
            />
          </div>
          <div @click="poistaVaatimus(vaatimus, vaatimuksenKohde)">
            <EpMaterialIcon class="default-icon clickable">
              delete
            </EpMaterialIcon>
          </div>
        </div>

        <div class="d-flex justify-content-between">
          <ep-button
            variant="outline"
            icon="add"
            @click="lisaaVaatimus(vaatimuksenKohde)"
          >
            {{ $t('lisaa-ammattitaitovaatimus') }}
          </ep-button>

          <ep-button
            variant="link"
            icon="delete"
            @click="poistaKohdealue(vaatimuksenKohde)"
          >
            {{ $t('poista-kohdealue') }}
          </ep-button>
        </div>
      </div>
    </div>

    <ep-button
      v-if="isEditing"
      variant="outline"
      icon="add"
      @click="lisaaKohdealue()"
    >
      {{ $t('lisaa-kohdealue') }}
    </ep-button>
  </div>
</template>

<script setup lang="ts">
import * as _ from 'lodash';
import { computed } from 'vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  isEditing?: boolean;
  modelValue: any;
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

const lisaaVaatimus = (vaatimuksenKohde: any) => {
  vaatimuksenKohde.vaatimukset = [...vaatimuksenKohde.vaatimukset, {}];
};

const lisaaKohdealue = () => {
  model.value = [...model.value, { vaatimukset: [] }];
};

const poistaVaatimus = (poistettavaVaatimus: any, vaatimuksenKohde: any) => {
  vaatimuksenKohde.vaatimukset = _.without(vaatimuksenKohde.vaatimukset, poistettavaVaatimus);
};

const poistaKohdealue = (poistettavaKohdeAlue: any) => {
  model.value = _.without(model.value, poistettavaKohdeAlue);
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.vaatimuksen-kohde {
  border: 1px solid #eee;
}

</style>

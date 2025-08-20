<template>
  <div>
    <div class="d-flex mb-4">
      <h2>{{ $t('laaja-alainen-osaaminen') }}</h2>
      <div
        v-b-popover.hover.right="$t('koto-laaja-alainen-osaaminen-paikallinen-tarkennus-selite')"
        class="ml-4 default-icon clickable"
      >
        <EpMaterialIcon icon-shape="outlined">
          info
        </EpMaterialIcon>
      </div>
    </div>

    <div
      v-for="(lao, index) in laajaAlaisetOsaamiset"
      :key="'lao' + index"
    >
      <div class="d-flex align-items-center justify-content-between">
        <h3>{{ $kaanna(perusteenLaotByUri[lao.koodiUri].koodi.nimi) }}</h3>
        <ep-button
          v-if="isEditing"
          variant="link"
          icon="delete"
          @click="poistaLaajaAlainenOsaaminen(lao)"
        >
          {{ $t('poista') }}
        </ep-button>
      </div>
      <EpContent
        v-model="perusteenLaotByUri[lao.koodiUri].kuvaus"
        class="mb-4"
        layout="normal"
        :is-editable="false"
      />

      <b-form-group class="mb-4">
        <template #label>
          <h4>{{ $t('paikallinen-teksti') }}</h4>
        </template>
        <EpContent
          v-model="lao.teksti"
          layout="normal"
          :is-editable="isEditing"
        />
      </b-form-group>
    </div>

    <b-dropdown
      v-if="isEditing"
      :text="$t('lisaa-laaja-alaisen-osaamisen-kuvaus')"
      variant="primary"
      class="mb-4"
    >
      <b-dropdown-item-button
        v-for="(perusteenLao, index) in perusteenLaajaAlaisetOsaamiset"
        :key="index+'addlaaja'"
        :disabled="laotByUri[perusteenLao.koodi.uri] !== undefined"
        @click="addLaajaAlainenOsaaminen(perusteenLao)"
      >
        {{ perusteenLao.koodi.arvo + '. ' + $kaanna(perusteenLao.koodi.nimi) }}
      </b-dropdown-item-button>
    </b-dropdown>

    <EpAlert
      v-if="!isEditing && laajaAlaisetOsaamiset.length === 0"
      :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
    />
  </div>
</template>

<script setup lang="ts">
import { PerusteenOsaDto, KotoTaitotasoLaajaAlainenOsaaminenDto } from '@shared/api/amosaa';
import { IKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import * as _ from 'lodash';
import { computed } from 'vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  perusteenLaajaAlaisetOsaamiset: PerusteenOsaDto[];
  modelValue: KotoTaitotasoLaajaAlainenOsaaminenDto[];
  isEditing?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const laajaAlaisetOsaamiset = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const perusteenLaotByUri = computed(() => {
  return _.keyBy(props.perusteenLaajaAlaisetOsaamiset, 'koodi.uri');
});

const laotByUri = computed(() => {
  return _.keyBy(laajaAlaisetOsaamiset.value, 'koodiUri');
});

const addLaajaAlainenOsaaminen = (perusteenLao: any) => {
  laajaAlaisetOsaamiset.value = [
    ...laajaAlaisetOsaamiset.value,
    {
      koodiUri: perusteenLao.koodi.uri,
    },
  ];
};

const poistaLaajaAlainenOsaaminen = (poistettavaLao: any) => {
  laajaAlaisetOsaamiset.value = _.reject(laajaAlaisetOsaamiset.value, lao => lao.koodiUri === poistettavaLao.koodiUri);
};
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

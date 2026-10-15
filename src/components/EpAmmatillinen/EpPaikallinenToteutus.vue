<template>
  <div class="paikallinentoteutus w-full pl-3">
    <ep-field
      v-if="isEditing"
      v-model="toteutus.otsikko"
      :is-editing="isEditing"
    />

    <div
      v-if="naytaTutkintonimikkeetJaOsaamisalat"
      class="mt-3"
    >
      <h4 class="mt-3">
        {{ $t('tutkintonimikkeet-ja-osaamisalat') }}
      </h4>
      <table class="w-full">
        <thead>
          <tr class="text-left">
            <th class="p-2">
              {{ $t('nimi') }}
            </th>
            <th class="p-2">
              {{ $t('koodi') }}
            </th>
            <th
              v-if="isEditing"
              class="p-2"
            />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="koodi in tutkintonimikkeetJaOsaamisalat"
            :key="koodi.koodiUri"
          >
            <td class="p-2">
              {{ $kaanna(koodi.nimi) }}
            </td>
            <td class="p-2">
              {{ koodi.koodiArvo }}
            </td>
            <td
              v-if="isEditing"
              class="p-2 text-right"
            >
              <EpButton
                variant="link"
                icon="delete"
                :aria-label="$t('poista')"
                @click="poistaKoodi(koodi.koodiUri)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="isEditing"
        class="flex flex-wrap gap-2 mt-2"
      >
        <EpKoodistoSelect
          koodisto="tutkintonimikkeet"
          :is-editing="isEditing"
          @add="lisaaKoodi"
        >
          <template #default="{ open }">
            <EpButton
              variant="outline"
              icon="add"
              @click="open"
            >
              {{ $t('lisaa-tutkintonimike') }}
            </EpButton>
          </template>
        </EpKoodistoSelect>
        <EpKoodistoSelect
          koodisto="osaamisala"
          :is-editing="isEditing"
          @add="lisaaKoodi"
        >
          <template #default="{ open }">
            <EpButton
              variant="outline"
              icon="add"
              @click="open"
            >
              {{ $t('lisaa-osaamisala') }}
            </EpButton>
          </template>
        </EpKoodistoSelect>
      </div>
    </div>

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
        class="mt-3"
        :is-editing="isEditing"
      />
    </div>

    <div
      v-if="isEditing"
      class="flex justify-between items-center pt-3"
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
import { computed, onMounted, ref } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { Koodistot } from '@shared/api/amosaa';
import EpVapaatTekstit from '@/components/common/EpVapaatTekstit.vue';
import { $kaanna, $t } from '@shared/utils/globals';

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

const naytaTutkintonimikkeetJaOsaamisalat = ref(false);
const tutkintonimikkeetJaOsaamisalat = ref<any[]>([]);

onMounted(async () => {
  const koodit: string[] = props.modelValue?.koodit || [];
  naytaTutkintonimikkeetJaOsaamisalat.value = koodit.length > 0;
  const ladatutKoodit = await Promise.all(koodit.map(async uri => {
    try {
      const koodi = (await Koodistot.getKoodistoKoodiByUri(uri)).data;
      return {
        ...koodi,
        nimi: _.mapValues(_.keyBy(koodi.metadata, metadata => _.toLower(metadata.kieli)), metadata => metadata.nimi),
      };
    }
    catch (e) {
      return { koodiUri: uri, koodiArvo: uri };
    }
  }));
  tutkintonimikkeetJaOsaamisalat.value = ladatutKoodit;
});

const lisaaKoodi = (koodi: { uri: string; arvo: string; nimi: Record<string, string> }) => {
  if (!_.includes(toteutus.value.koodit, koodi.uri)) {
    naytaTutkintonimikkeetJaOsaamisalat.value = true;
    tutkintonimikkeetJaOsaamisalat.value = [
      ...tutkintonimikkeetJaOsaamisalat.value,
      {
        koodiUri: koodi.uri,
        koodiArvo: koodi.arvo,
        nimi: koodi.nimi,
      },
    ];
    toteutus.value = {
      ...toteutus.value,
      koodit: [...(toteutus.value.koodit || []), koodi.uri],
    };
  }
};

const poistaKoodi = (uri: string) => {
  tutkintonimikkeetJaOsaamisalat.value = _.reject(tutkintonimikkeetJaOsaamisalat.value, koodi => koodi.koodiUri === uri);
  toteutus.value = {
    ...toteutus.value,
    koodit: _.reject(toteutus.value.koodit, koodiUri => koodiUri === uri),
  };
};

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

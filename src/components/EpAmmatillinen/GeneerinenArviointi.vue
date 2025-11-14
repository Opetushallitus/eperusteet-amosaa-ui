<template>
  <div v-if="vaihtoehdot">
    <slot name="header">
      <h4>{{ $t('arviointi') }}</h4>
    </slot>
    <div v-if="isEditing">
      <b-form-group>
        <b-form-radio
          v-for="vaihtoehto in vaihtoehdot"
          :key="vaihtoehto.id"
          v-model="model"
          :value="vaihtoehto.id"
        >
          {{ $kaanna(vaihtoehto.nimi) }}
        </b-form-radio>
      </b-form-group>
    </div>
    <div v-else>
      <div v-if="valittu && osaamistasot">
        <ep-form-content class="m-3">
          <div>{{ $kaanna(valittu.kohde) }}</div>
          <b-container
            fluid
            class="osaamistasot mt-3"
          >
            <b-row
              v-for="(osaamistasonKriteeri,index) in valittu.osaamistasonKriteerit"
              :key="'osaamistasokriteeri'+index"
            >
              <b-col
                class="pt-3"
                md="12"
                lg="4"
              >
                <span>{{ $kaanna(osaamistasot[osaamistasonKriteeri._osaamistaso].otsikko) }}</span>
              </b-col>
              <b-col
                class="pt-3"
                md="12"
                lg="8"
              >
                <ul class="pl-3">
                  <li
                    v-for="(kriteeri, index) in osaamistasonKriteeri.kriteerit"
                    :key="'kriteeri'+index"
                  >
                    {{ $kaanna(kriteeri) }}
                  </li>
                </ul>
              </b-col>
            </b-row>
          </b-container>
        </ep-form-content>
      </div>
      <div
        v-else
        class="alert alert-warning"
      >
        {{ $t('arviointia-ei-valittu') }}
      </div>
    </div>
  </div>
  <EpSpinner v-else />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import * as _ from 'lodash';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  isEditing: boolean;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const vaihtoehdot = ref<any | null>(null);
const asteikot = ref<any | null>(null);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const vaihtoehdotMap = computed(() => {
  if (!vaihtoehdot.value) {
    return {};
  }
  return _.keyBy(vaihtoehdot.value, 'id');
});

const valittu = computed(() => {
  if (props.modelValue) {
    return vaihtoehdotMap.value[props.modelValue] || null;
  }
  return null;
});

const osaamistasot = computed(() => {
  if (asteikot.value && valittu.value && valittu.value._arviointiAsteikko) {
    return asteikot.value[valittu.value._arviointiAsteikko].osaamistasot || null;
  }
  return null;
});

onMounted(async () => {
  vaihtoehdot.value = await PerusteetStore.fetchGeneeriset();
  asteikot.value = await PerusteetStore.fetchArviointiasteikot();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .osaamistasot {
    .row:nth-of-type(even) {
      background-color: $table-even-row-bg-color;
    }
    .row:nth-of-type(odd) {
      background-color: $table-odd-row-bg-color;
    }
  }

</style>

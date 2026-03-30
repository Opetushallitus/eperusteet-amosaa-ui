<template>
  <div>
    <div class="flex flex-wrap w-full mb-4">
      <div class="w-full md:w-5/6 min-w-0">
        <ep-form-group
          :label="$t('osaamismerkkien-suorittaminen')"
          required
        >
          <EpContent
            v-model="innerModel.kuvaus"
            layout="normal"
            :is-editable="isEditing"
            :kuva-handler="kuvaHandler"
          />
        </ep-form-group>
      </div>
    </div>
    <div class="flex flex-wrap w-full">
      <div class="w-full md:w-5/6 min-w-0">
        <ep-form-group :label="$t('osaamismerkit')">
          <div
            v-for="(merkki, idx) in osaamismerkkiKoodit"
            :key="'koodi-'+idx"
            class="p-3 rivi"
          >
            <div
              v-if="isEditing"
              class="flex"
            >
              <div class="flex">
                <span>{{ $kaanna(merkki.nimi) }} ({{ merkki.koodi }})</span>
                <span
                  v-if="merkki.vanhentunut"
                  class="ml-2 vanhentunut"
                >{{ $t('vanhentunut') }}</span>
              </div>
              <div
                class="default-icon clickable ml-auto"
                @click="onRemoveListItem(merkki)"
              >
                <EpMaterialIcon icon-shape="outlined">
                  delete
                </EpMaterialIcon>
              </div>
            </div>
            <div v-else>
              <EpLinkki :url="merkki.url">
                <div class="flex">
                  <span>{{ $kaanna(merkki.nimi) }} ({{ merkki.koodi }})</span>
                  <span
                    v-if="merkki.vanhentunut"
                    class="ml-2 vanhentunut"
                  >{{ $t('vanhentunut') }}</span>
                </div>
              </EpLinkki>
            </div>
          </div>
          <EpKoodistoSelect
            :store="koodisto"
            :is-editing="isEditing"
            :nayta-arvo="true"
            :multiple="true"
            class="mt-4"
            @add="onAddListItem($event)"
          >
            <template #default="{ open }">
              <ep-input-group>
                <template #append>
                  <EpButton
                    v-if="isEditing"
                    variant="outline"
                    icon="add"
                    @click="open"
                  >
                    {{ $t('lisaa-osaamismerkkeja') }}
                  </EpButton>
                </template>
              </ep-input-group>
            </template>
            <template #empty>
              <div v-if="innerModel.osaamismerkkiKoodit && innerModel.osaamismerkkiKoodit.length > 0" />
              <div v-else>
                {{ $t('ei-lisattyja-osaamismerkkeja') }}
              </div>
            </template>
          </EpKoodistoSelect>
        </ep-form-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { getKoodistoSivutettuna, KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { osaamismerkkiUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import _ from 'lodash';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';
import { $t, $kaanna } from '@shared/utils/globals';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpInputGroup from '@shared/components/EpInputGroup/EpInputGroup.vue';


const props = defineProps<{
  modelValue: any;
  isEditing?: boolean;
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
}>();

const emit = defineEmits(['update:modelValue']);

const koodisto = new KoodistoSelectStore({
  koodisto: 'osaamismerkit',
  async query(query: string, sivu = 0, koodisto, onlyValidKoodis) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const innerModel = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const osaamismerkkiKoodit = computed(() => {
  return _.map(innerModel.value.osaamismerkkiKoodit, koodi => {
    return {
      ...koodi,
      url: osaamismerkkiUrl(Kielet.getSisaltoKieli.value, koodi.koodi),
      vanhentunut: isVanhentunut(koodi.voimassaLoppuPvm),
    };
  });
});

const kuvaHandler = computed(() => {
  return createKuvaHandler(new KuvaStore(props.toteutussuunnitelmaId, props.koulutustoimijaId));
});

const onAddListItem = (merkit: any) => {
  innerModel.value = {
    ...innerModel.value,
    osaamismerkkiKoodit: [
      ...innerModel.value.osaamismerkkiKoodit,
      ...addMerkit(merkit),
    ],
  };
};

const addMerkit = (merkit: any) => {
  return _.map(merkit, merkki => {
    return {
      nimi: merkki.nimi,
      koodi: merkki.arvo,
    };
  });
};

const onRemoveListItem = (poistettavaRivi: any) => {
  innerModel.value = {
    ...innerModel.value,
    osaamismerkkiKoodit: _.filter(osaamismerkkiKoodit.value, rivi => rivi.koodi !== poistettavaRivi.koodi),
  };
};

const isVanhentunut = (voimassaLoppuPvm: any) => {
  let currentDate = new Date(new Date().setHours(0, 0, 0, 0));
  return voimassaLoppuPvm && _.toNumber(voimassaLoppuPvm) < currentDate.getTime();
};
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.vanhentunut {
  color: $invalid;
}

.rivi:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.rivi:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>

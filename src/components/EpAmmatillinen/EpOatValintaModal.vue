<template>
  <div>
    <EpButton
      v-b-modal.oatModal
      icon="add"
      variant="outline"
      @click="lisaaOat"
    >
      {{ $t('lisaa-osaamisen-arvioinnin-toteutussuunnitelma') }}
    </EpButton>

    <b-modal
      ref="oatModal"
      size="lg"
    >
      <template #modal-header>
        <div class="row w-100">
          <div class="col">
            <h2>{{ oat.id ? $t('osaamisen-arvioinnin-toteutussuunnitelma') : $t('lisaa-osaamisen-arvioinnin-toteutussuunnitelma') }}</h2>
          </div>
          <div class="col text-right">
            <EpKielivalinta />
          </div>
        </div>
      </template>

      <div class="mb-4">
        <EpRadio
          v-model="tyyppi"
          value="oat"
          :label="$t('osaamisen-arvioinnin-toteutussuunnitelma')"
          :is-editing="true"
        />
        <EpRadio
          v-model="tyyppi"
          value="url"
          :label="$t('ulkoinen-linkki')"
          :is-editing="true"
        />
      </div>

      <div
        v-if="tyyppi === 'oat'"
        class="mb-5"
      >
        <EpMultiSelect
          v-if="oatit"
          v-model="oat.oatOpetussuunnitelma"
          :placeholder="$t('valitse-osaamisen-arvioinnin-toteutussuunnitelma')"
          :is-editing="true"
          :options="oatit"
          :search-identity="nimiSearchIdentity"
        >
          <template #singleLabel="{ option }">
            {{ $kaanna(option.nimi) }}
          </template>
          <template #option="{ option }">
            {{ $kaanna(option.nimi) }}
          </template>
        </EpMultiSelect>
        <EpSpinner v-else />
      </div>

      <div
        v-if="tyyppi === 'url'"
        class="mb-5"
      >
        <b-form-group :label="$t('oat-nimi') + (editing ? ' *' : '')">
          <EpField
            v-model="oat.nimi"
            :is-editing="editing"
            :show-valid-validation="false"
          />
        </b-form-group>
        <b-form-group :label="$t('linkki') + (editing ? ' *' : '')">
          <EpField
            v-model="oat.url"
            :is-editing="editing"
            :show-valid-validation="false"
          />
        </b-form-group>
      </div>

      <template #modal-footer>
        <div class="footer w-100 footer pt-2">
          <div class="d-flex justify-content-end">
            <EpButton
              variant="link"
              @click="sulje"
            >
              {{ $t('peruuta') }}
            </EpButton>
            <EpButton
              variant="link"
              icon="delete"
              @click="poista"
            >
              {{ $t('poista') }}
            </EpButton>
            <EpButton
              class="ml-3"
              :disabled="!valid"
              @click="tallenna"
            >
              {{ $t('tallenna') }}
            </EpButton>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpRadio from '@shared/components/forms/EpRadio.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';

import { OsaamisenArvioinninToteutussuunnitelmaDto } from '@shared/api/amosaa';
import { OpetussuunnitelmaPohjatStore } from '@/stores/OpetussuunnitelmaPohjatStore';
import { Toteutus } from '@shared/utils/perusteet';
import { nimiSearchIdentity } from '@shared/utils/helpers';
import { $t, $kaanna, $bvModal } from '@shared/utils/globals';


const emit = defineEmits<{
  poistaOat: [index: number];
  tallennaOat: [oat: any, index: number | null];
}>();

const route = useRoute();
const oatModalRef = useTemplateRef('oatModal');

const editing = ref(true);
const oat = ref<OsaamisenArvioinninToteutussuunnitelmaDto | any>({});
const toteutussuunnitelmaPohjatStore = ref<OpetussuunnitelmaPohjatStore | null>(null);
const tyyppi = ref<'oat' | 'url' | null>(null);
const index = ref<number | null>(null);

const koulutustoimijaId = computed(() => {
  return route.params.koulutustoimijaId as string;
});

const toteutus = computed(() => {
  return Toteutus[_.toUpper(route.params.toteutus as string)];
});

const oatit = computed(() => {
  return toteutussuunnitelmaPohjatStore.value?.opetussuunnitelmat;
});

const valid = computed(() => {
  if (tyyppi.value === 'oat') {
    return _.has(oat.value, 'oatOpetussuunnitelma.id');
  }
  else if (tyyppi.value === 'url') {
    return (oat.value as any).nimi && (oat.value as any).url;
  }

  return false;
});

const haeOatit = async () => {
  if (toteutussuunnitelmaPohjatStore.value == null) {
    toteutussuunnitelmaPohjatStore.value = new OpetussuunnitelmaPohjatStore();
  }
  await toteutussuunnitelmaPohjatStore.value!.fetch(_.toNumber(koulutustoimijaId.value), toteutus.value, ['julkaistu'], 'yhteinen');
};

const lisaaOat = async () => {
  oat.value = {};
  tyyppi.value = null;
  (oatModalRef.value as any)?.show();
  await haeOatit();
};

const sulje = () => {
  index.value = null;
  (oatModalRef.value as any)?.hide();
};

const muokkaa = async (oatData: OsaamisenArvioinninToteutussuunnitelmaDto, indexValue: number) => {
  index.value = indexValue;
  (oatModalRef.value as any)?.show();
  oat.value = _.cloneDeep(oatData);
  if (_.get(oat.value, 'oatOpetussuunnitelma.id')) {
    tyyppi.value = 'oat';
  }
  else {
    tyyppi.value = 'url';
  }
  await haeOatit();
};

const poista = async () => {
  const poistaConfirm = await $bvModal.msgBoxConfirm(' ', {
    title: $t('poista-osaamisen-arvioinnin-toteutussuunnitelma-kysymys'),
    okVariant: 'primary',
    okTitle: $t('poista') as any,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as any,
    centered: true,
    ...{} as any,
  });

  if (poistaConfirm) {
    emit('poistaOat', index.value!);
    sulje();
  }
};

const tallenna = async () => {
  emit('tallennaOat', oat.value, index.value);
  sulje();
};

defineExpose({
  lisaaOat,
  muokkaa,
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.footer {
  border-top: 1px solid $gray-lighten-8;
}

</style>

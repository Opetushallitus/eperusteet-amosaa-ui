<template>
  <ep-main-view :container="true">
    <template #icon />
    <template #header>
      <div class="text-left">
        <h1>{{ $t('usein-kysytyt-kysymykset') }}</h1>
        <p>{{ $t('ukk-kuvaus-nakyma') }}</p>
        <ep-spinner v-if="isLoading" />
        <div v-else>
          <div class="d-flex justify-content-between align-items-end pb-3">
            <ep-search v-model="rajain" />

            <ep-button
              variant="outline-primary"
              icon="add"
              @click="startKysymysModal(null)"
            >
              {{ $t('lisaa-uusi-kysymys') }}
            </ep-button>
          </div>
          <b-form-group
            :label="$t('nayta-sisalto-jonka-on-luonut')"
            class="w-50"
          >
            <ep-multi-select
              v-model="koulutustoimijaRajaus"
              :options="koulutustoimijat"
              :multiple="true"
              :searchable="true"
              :close-on-select="false"
              :clear-on-select="false"
              :search-identity="nimiSearchIdentity"
              track-by="id"
              :placeholder="$t('valitse-organisaatio')"
              :custom-label="({nimi}) => $kaanna(nimi)"
            >
              <template #option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </ep-multi-select>
          </b-form-group>
        </div>
      </div>
    </template>

    <template #custom-content>
      <div v-if="!isLoading">
        <div
          v-for="(ohje, index) in filteredOhjeet"
          :key="'ohje'+index"
          class="row"
        >
          <div class="col text-left">
            <div class="float-right">
              <button
                class="btn btn-link"
                @click="startKysymysModal(ohje)"
              >
                <EpMaterialIcon>edit</EpMaterialIcon>
              </button>
              <button
                class="btn btn-link"
                @click="startRemoveKysymys(ohje)"
              >
                <EpMaterialIcon>delete</EpMaterialIcon>
              </button>
            </div>
            <div>
              <div
                v-if="ohje.muokattu"
                class="text-secondary muokattu pb-1"
              >
                {{ $ago(ohje.muokattu) }}
              </div>
              <h4 v-html="$kaanna(ohje.lokalisoituKysymys)" />
              <div class="text-secondary">
                <ep-content
                  layout="normal"
                  :value="ohje.lokalisoituVastaus"
                />
              </div>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #after>
      <b-modal
        id="createUpdateKysymys"
        ref="createUpdateKysymys"
        class="backdrop"
        :no-close-on-backdrop="true"
        :no-enforce-focus="true"
        :lazy="true"
        :ok-disabled="v$.$invalid"
        size="lg"
        @ok="createUpdateKysymysHandler"
      >
        <template #modal-title>
          <span class="mr-2">{{ !ohje.id ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}</span>
          <ep-kielivalinta />
        </template>
        <ep-form-content name="kysymys-nimi">
          <ep-content
            v-model="ohje.lokalisoituKysymys"
            help="kysymys-nimi-ohje"
            layout="normal"
            :validation="v$.ohje.lokalisoituKysymys"
            :is-editable="true"
          />
        </ep-form-content>
        <ep-form-content name="kysymys-vastaus">
          <ep-content
            v-model="ohje.lokalisoituVastaus"
            help="kysymys-vastaus-ohje"
            layout="normal"
            :validation="v$.ohje.lokalisoituVastaus"
            :is-editable="true"
          />
        </ep-form-content>
        <ep-form-content name="nayta-organisaatioissa">
          <b-form-checkbox
            v-model="valitseKaikkiOrganisaatiot"
            class="pb-2"
            @change="valitseKaikkiOrganisaatiotChange"
          >
            {{ $t('valitse-kaikki') }}
          </b-form-checkbox>
          <b-form-checkbox-group
            v-model="ohje.koulutustoimijat"
            stacked
          >
            <b-form-checkbox
              v-for="(koulutustoimija, index) in koulutustoimijat"
              :key="'modalktvalinta'+index"
              :value="koulutustoimija"
            >
              {{ $kaanna(koulutustoimija.nimi) }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </ep-form-content>
        <template #modal-cancel>
          {{ $t('peruuta') }}
        </template>
        <template #modal-ok>
          {{ !ohje.id ? $t('lisaa-kysymys') : $t('tallenna') }}
        </template>
      </b-modal>

      <b-modal
        id="removeKysymys"
        ref="removeKysymys"
        class="backdrop"
        :lazy="true"
        size="lg"
        @ok="deleteKysymys"
      >
        <span class="mr-2">{{ $t('haluatko-poistaa-kysymyksen') }}</span>
        <template #modal-cancel>
          {{ $t('peruuta') }}
        </template>
        <template #modal-ok>
          {{ $t('poista') }}
        </template>
      </b-modal>
    </template>
  </ep-main-view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, useTemplateRef } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import _ from 'lodash';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpListSelect from '@shared/components/forms/EpListSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

import { OhjeetStore } from '@/stores/OhjeetStore';
import { OhjeDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { requiredOneLang } from '@shared/validators/required';
import { KayttajaStore } from '@/stores/kayttaja';
import { KoulutustoimijaBaseDto } from '../../eperusteet-frontend-utils/vue/src/generated/amosaa';
import { Toteutus } from '@shared/utils/perusteet';
import { $t, $kaanna, $ago } from '@shared/utils/globals';

const props = defineProps<{
  ohjeetStore: OhjeetStore;
  kayttajaStore: KayttajaStore;
  toteutus: Toteutus;
}>();

const rajain = ref('');
const ohje = reactive<OhjeDto>({});
const koulutustoimijaRajaus = ref<KoulutustoimijaBaseDto[]>([]);
const valitseKaikkiOrganisaatiot = ref(false);

const createUpdateKysymys = useTemplateRef('createUpdateKysymys');
const removeKysymys = useTemplateRef('removeKysymys');

const validationRules = {
  ohje: {
    lokalisoituKysymys: requiredOneLang(),
    lokalisoituVastaus: requiredOneLang(),
  },
};

const v$ = useVuelidate(validationRules, { ohje });

const isLoading = computed(() => {
  return !_.isArray(props.ohjeetStore.ohjeet.value);
});

const ohjeet = computed(() => {
  return _.map(props.ohjeetStore.ohjeet.value, ohjeItem => {
    return {
      ...ohjeItem,
      lokalisoituKysymys: ohjeItem.lokalisoituKysymys ? ohjeItem.lokalisoituKysymys : { [Kielet.getSisaltoKieli.value]: ohjeItem.kysymys },
      lokalisoituVastaus: ohjeItem.lokalisoituVastaus ? ohjeItem.lokalisoituVastaus : { [Kielet.getSisaltoKieli.value]: ohjeItem.vastaus },
    };
  });
});

const filteredOhjeet = computed(() => {
  return _.chain(ohjeet.value)
    .filter(ohjeItem => _.includes(
      _.toLower(_.get(ohjeItem, 'lokalisoituKysymys.' + Kielet.getSisaltoKieli.value)),
      _.toLower(rajain.value),
    ) || _.includes(
      _.toLower(_.get(ohjeItem, 'lokalisoituVastaus.' + Kielet.getSisaltoKieli.value)),
      _.toLower(rajain.value),
    ),
    )
    .filter(ohjeItem => _.isEmpty(koulutustoimijaRajaus.value) || _.some(_.map(koulutustoimijaRajaus.value, 'id'), ktId => _.includes(_.map(ohjeItem.koulutustoimijat, 'id'), ktId)))
    .sortBy((k: any) => -k.muokattu)
    .value();
});

const koulutustoimijat = computed(() => {
  return props.kayttajaStore.koulutustoimijat.value;
});

const startKysymysModal = (ohjeParam: OhjeDto | null) => {
  valitseKaikkiOrganisaatiot.value = false;

  if (ohjeParam) {
    Object.assign(ohje, _.cloneDeep(ohjeParam));
  }
  else {
    Object.assign(ohje, {
      koulutustoimijat: [],
    });
  }
  createUpdateKysymys.value?.show();
};

const startRemoveKysymys = (ohjeParam: OhjeDto) => {
  Object.assign(ohje, _.cloneDeep(ohjeParam));
  removeKysymys.value?.show();
};

const createUpdateKysymysHandler = async (event: any) => {
  event.preventDefault(); // Piilotetaan modaali myöhemmin
  await props.ohjeetStore.save({
    ...ohje,
    toteutus: props.toteutus as any,
  });
  createUpdateKysymys.value?.hide();
};

const deleteKysymys = async () => {
  if (!ohje || !ohje.id) {
    return;
  }

  await props.ohjeetStore.delete(ohje);
};

const nimiSearchIdentity = (obj: any) => {
  return _.toLower($kaanna(obj.nimi));
};

const valitseKaikkiOrganisaatiotChange = (val: boolean) => {
  if (val) {
    ohje.koulutustoimijat = _.cloneDeep(koulutustoimijat.value) as KoulutustoimijaBaseDto[];
  }
  else {
    ohje.koulutustoimijat = [];
  }
};

onMounted(async () => {
  await props.ohjeetStore.fetch(props.toteutus);
});
</script>

<style scoped lang="scss">

  .muokattu {
    font-size: 0.8rem;
  }

</style>

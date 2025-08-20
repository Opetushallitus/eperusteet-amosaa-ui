<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
    >
      <template #header>
        <h2 class="m-0">
          {{ $t(kielistykset['title']) }}
        </h2>
      </template>
      <template #default="{ data, isEditing, validation }">
        <b-form-group :label="$t(kielistykset['nimi'])">
          <ep-field
            v-model="data.opetussuunnitelma.nimi"
            :is-editing="isEditing"
            :validation="validation.opetussuunnitelma.nimi"
          />
        </b-form-group>

        <b-form-group :label="$t(kielistykset['tiivistelma'])">
          <ep-content
            v-model="data.opetussuunnitelma.kuvaus"
            layout="normal"
            :is-editable="isEditing"
          />
        </b-form-group>

        <b-container fluid>
          <b-row>
            <b-col>
              <b-form-group :label="$t('paatosnumero')">
                <ep-field
                  v-model="data.opetussuunnitelma.paatosnumero"
                  :is-editing="isEditing"
                  type="string"
                />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group :label="$t('paatospaivamaara')">
                <div class="d-flex align-items-center">
                  <ep-datepicker
                    v-model="data.opetussuunnitelma.paatospaivamaara"
                    :is-editing="isEditing"
                    type="sd"
                    :validation="validation.opetussuunnitelma.paatospaivamaara"
                  />
                </div>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group :label="$t('hyvaksyja')">
                <ep-field
                  v-model="data.opetussuunnitelma.hyvaksyja"
                  :is-editing="isEditing"
                  type="string"
                />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group :label="$t('voimassaolo-alkaa')">
                <div class="d-flex align-content-around flex-wrap">
                  <ep-datepicker
                    v-model="data.opetussuunnitelma.voimaantulo"
                    :is-editing="isEditing"
                    type="sd"
                    :validation="validation.opetussuunnitelma.voimaantulo"
                  />
                  <template v-if="opetussuunnitelmaVoimassaoloLoppu">
                    <div
                      class="ml-2 mr-2"
                      :class="{'mt-2': isEditing}"
                    >
                      -
                    </div>
                    <ep-datepicker
                      v-model="data.opetussuunnitelma.voimassaoloLoppuu"
                      :is-editing="isEditing"
                      type="sd"
                    />
                  </template>
                </div>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group :label="$t('julkaisukielet')">
                <EpToggleGroup
                  v-if="isEditing"
                  v-model="data.opetussuunnitelma.julkaisukielet"
                  :label="$t('perusteen-kielet')"
                  :items="kielet"
                  stacked
                  :is-editing="isEditing"
                >
                  <template #default="{ item }">
                    {{ $t(item) }}
                  </template>
                </EpToggleGroup>
                <div
                  v-else
                  class="text-nowrap"
                >
                  <span
                    v-for="(kieli, idx) in data.opetussuunnitelma.julkaisukielet"
                    :key="kieli"
                    :value="kieli"
                  >
                    {{ $t(kieli) }}<span
                      v-if="idx < data.opetussuunnitelma.julkaisukielet.length - 1"
                      class="mr-0"
                    >,</span>
                  </span>
                </div>
              </b-form-group>
            </b-col>
            <b-col v-if="!isOpsPohja">
              <EpEsikatselu
                v-model="data.opetussuunnitelma"
                toteutussuunnitelma
                :is-editing="isEditing"
              >
                <template #header>
                  {{ $t(kielistykset['esikatselu']) }}
                </template>
                <template #toggle-text>
                  {{ $t(kielistykset['salliEsikatselu']) }}
                </template>
              </EpEsikatselu>
            </b-col>
          </b-row>

          <b-row>
            <b-col v-if="showOpetussuunnitelmaOppilaitostyyppi">
              <b-form-group :label="$t('oppilaitoksen-tyyppi')">
                {{ $kaanna(data.opetussuunnitelma.koulutustoimija.oppilaitostyyppi) }}
              </b-form-group>
            </b-col>
          </b-row>

          <EpJotpaSelect
            v-model="data.opetussuunnitelma"
            :toteutus="toteutus"
            :is-editing="isEditing"
          />

          <b-row v-if="showOatValinta">
            <b-col>
              <b-form-group :label="$t('osaamisen-arvioinnin-toteutussuunnitelma')">
                <div
                  v-for="(oat, index) in data.opetussuunnitelma.osaamisenArvioinninToteutussuunnitelmat"
                  :key="'oat' + index"
                  class="mb-2"
                >
                  <div class="d-flex">
                    <router-link
                      v-if="oat.oatOpetussuunnitelma"
                      :to="{ name: 'toteutussuunnitelma', params: { koulutustoimijaId: koulutustoimijaId, toteutussuunnitelmaId: oat.oatOpetussuunnitelma.id } }"
                    >
                      {{ $kaanna(oat.oatOpetussuunnitelma.nimi) }}
                    </router-link>
                    <ep-external-link
                      v-else
                      :url="$kaanna(oat.url)"
                    >
                      {{ $kaanna(oat.nimi) }}
                    </ep-external-link>
                    <EpButton
                      v-if="isEditing"
                      icon="edit"
                      size="sm"
                      class="no-padding ml-4"
                      variant="link"
                      @click="muokkaaOat(oat, index)"
                    >
                      {{ $t('muokkaa') }}
                    </EpButton>
                  </div>
                </div>
                <EpOatValintaModal
                  v-if="isEditing"
                  ref="oatModalRef"
                  @tallennaOat="tallennaOat"
                  @poistaOat="poistaOat"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <div v-if="data.peruste">
          <hr>
          <h3>{{ $t('perusteen-tiedot') }}</h3>

          <b-container fluid>
            <b-row>
              <b-col>
                <b-form-group :label="$t(kielistykset['perustetyyppi'])">
                  <div>{{ $kaanna(data.peruste.nimi) }}</div>
                  <div>({{ data.peruste.diaarinumero }})</div>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group :label="$t('voimassaolo')">
                  <div><span v-if="data.peruste.voimassaoloAlkaa">{{ $sd(data.peruste.voimassaoloAlkaa) }}</span> - <span v-if="data.peruste.voimassaoloLoppuu">{{ $sd(data.peruste.voimassaoloLoppuu) }}</span></div>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row v-if="ammatillinenToteutus">
              <b-col>
                <b-form-group :label="$t('koulutukset')">
                  <div
                    v-for="(koulutus, index) in data.peruste.koulutukset"
                    :key="'koulutus'+index"
                  >
                    {{ $kaanna(koulutus.nimi) }} ({{ koulutus.koulutuskoodiArvo }})
                  </div>
                </b-form-group>
              </b-col>
            </b-row>
          </b-container>
        </div>

        <div
          v-if="!isOpsPohja"
          v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
        >
          <hr>
          <h3>{{ $t('toiminnot') }}</h3>
          <ep-siirto-modal
            :toteutus="toteutus"
            :koulutustoimija-id="koulutustoimijaId"
            :toteutussuunnitelma="editointiStore.data.opetussuunnitelma"
          />
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSiirtoModal from '@/components/EpSiirtoModal/EpSiirtoModal.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpJotpaSelect from '@/components/EpJotpa/EpJotpaSelect.vue';
import EpOatValintaModal from '@/components/EpAmmatillinen/EpOatValintaModal.vue';
import EpEsikatselu from '@shared/components/EpEsikatselu/EpEsikatselu.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { UiKielet } from '@shared/stores/kieli';
import { ToteutussuunnitelmaTiedotStore } from '@/stores/ToteutussuunnitelmaTiedotStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaTyyppi, ToteutussuunnitelmaTiedotKielistykset, OpetussuunnitelmaOppilaitostyyppi, OpetussuunnitelmaVoimassaoloLoppu } from '@/utils/toteutustypes';
import { Murupolku } from '@shared/stores/murupolku';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import { Toteutus } from '@shared/utils/perusteet';
import { $t, $kaanna, $sd } from '@shared/utils/globals';
import EpToggleGroup from '@shared/components/forms/EpToggleGroup.vue';

const props = defineProps<{
  toteutus: Toteutus;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const route = useRoute();

const editointiStore = ref<EditointiStore | null>(null);
const oatModalRef = useTemplateRef('oatModalRef');

const oppilaitostyyppiKoodisto = new KoodistoSelectStore({
  koodisto: 'vapaasivistystyooppilaitostyyppi',
  async query(query: string, sivu = 0, koodisto) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 50,
      },
    })).data as any;
  },
});

const kielet = computed(() => {
  return UiKielet;
});

const toteutussuunnitelmaId = computed(() => {
  return _.toNumber(route.params.toteutussuunnitelmaId);
});

const koulutustoimijaId = computed(() => {
  return route.params.koulutustoimijaId as string;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const isOpsPohja = computed(() => {
  return editointiStore.value?.data?.opetussuunnitelma.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
});

const opetussuunnitelmaTyyppi = computed(() => {
  return isOpsPohja.value ? OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA : props.toteutus;
});

const kielistykset = computed(() => {
  return ToteutussuunnitelmaTiedotKielistykset[opetussuunnitelmaTyyppi.value];
});

const opetussuunnitelmaVoimassaoloLoppu = computed(() => {
  return OpetussuunnitelmaVoimassaoloLoppu[props.toteutus];
});

const ammatillinenToteutus = computed(() => {
  return props.toteutus === Toteutus.AMMATILLINEN;
});

const showOpetussuunnitelmaOppilaitostyyppi = computed(() => {
  return OpetussuunnitelmaOppilaitostyyppi[props.toteutus] && editointiStore.value?.data.opetussuunnitelma.koulutustoimija.oppilaitostyyppi;
});

const showOatValinta = computed(() => {
  return ammatillinenToteutus.value
    && editointiStore.value?.data?.opetussuunnitelma.tyyppi === 'ops'
    && (editointiStore.value?.isEditing || editointiStore.value?.data?.opetussuunnitelma.osaamisenArvioinninToteutussuunnitelmat.length > 0);
});

const fetch = () => {
  if (!(editointiStore.value && editointiStore.value.isLoading)) {
    editointiStore.value = new EditointiStore(
      new ToteutussuunnitelmaTiedotStore(
        toteutussuunnitelmaId.value,
        koulutustoimijaId.value,
        versionumero.value,
        props.toteutus,
        props.toteutussuunnitelmaStore,
      ),
    );
  }
};

const tallennaOat = (oat: any, index: number) => {
  if (index) {
    editointiStore.value!.setData({
      ...editointiStore.value!.data,
      opetussuunnitelma: {
        ...editointiStore.value!.data.opetussuunnitelma,
        osaamisenArvioinninToteutussuunnitelmat: _.map(
          editointiStore.value!.data.opetussuunnitelma.osaamisenArvioinninToteutussuunnitelmat,
          (o, i: number) => (i === index ? oat : o),
        ),
      },
    });
  }
  else {
    editointiStore.value!.setData({
      ...editointiStore.value!.data,
      opetussuunnitelma: {
        ...editointiStore.value!.data.opetussuunnitelma,
        osaamisenArvioinninToteutussuunnitelmat: [
          ...editointiStore.value!.data.opetussuunnitelma.osaamisenArvioinninToteutussuunnitelmat,
          oat,
        ],
      },
    });
  }
};

const muokkaaOat = (oat: any, index: number) => {
  (oatModalRef.value as any)?.muokkaa(oat, index);
};

const poistaOat = (index: number) => {
  editointiStore.value?.setData({
    ...editointiStore.value?.data,
    opetussuunnitelma: {
      ...editointiStore.value?.data.opetussuunnitelma,
      osaamisenArvioinninToteutussuunnitelmat: _.reject(
        editointiStore.value?.data.opetussuunnitelma.osaamisenArvioinninToteutussuunnitelmat,
        (o, i: number) => i === index,
      ),
    },
  });
};

onMounted(async () => {
  Murupolku.aseta('toteutussuunnitelmantiedot', '...');
  await fetch();
  Murupolku.aseta('toteutussuunnitelmantiedot', $t(OpetussuunnitelmaTyyppi[opetussuunnitelmaTyyppi.value]));
});

watch(versionumero, () => {
  fetch();
}, { immediate: true });

watch(isOpsPohja, () => {
  Murupolku.aseta('toteutussuunnitelmantiedot', $t(OpetussuunnitelmaTyyppi[opetussuunnitelmaTyyppi.value]));
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(.siirra-opetussuunnitelma.ep-button .btn .teksti), :deep(.siirra-opetussuunnitelma.ep-button .btn) {
    padding-left: 0px !important;
  }

</style>

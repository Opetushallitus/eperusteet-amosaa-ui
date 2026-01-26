<template>
  <EpEditointi
    v-if="editointiStore"
    :store="editointiStore"
    :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
  >
    <template #header="{ data }">
      <h2 class="m-0">
        {{ $kaanna(data.koulutuksenosa.nimi) }}
      </h2>
    </template>
    <template #default="{ isEditing, data: { koulutuksenosa } }">
      <b-row>
        <b-col>
          <b-form-group :label="$t('laajuus')">
            {{ perusteenOsa.laajuusMinimi }} - {{ perusteenOsa.laajuusMaksimi }} {{ $t('viikkoa') }}
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="10">
          <b-form-group :label="$t('kuvaus')">
            <EpContent
              v-model="perusteenOsa.kuvaus"
              layout="normal"
              :is-editable="false"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <h3 class="mb-4">
            {{ $t('tavoitteet') }}
          </h3>
          <b-form-group :label="$t('opiskelija')">
            <template v-if="perusteenOsa.tavoitteet.length > 0">
              <ul class="mb-0">
                <li
                  v-for="tavoite in perusteenOsa.tavoitteet"
                  :key="tavoite.id"
                >
                  {{ $kaanna(tavoite) }}
                </li>
              </ul>
            </template>
            <template v-if="koulutuksenosa.paikallinenTarkennus && paikallisetTavoitteetListana">
              <EpSortableTextList
                v-model="koulutuksenosa.paikallinenTarkennus.tavoitteet"
                :is-editing="isEditing"
              >
                {{ $t('lisaa-tavoite') }}
              </EpSortableTextList>
            </template>
          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus && !paikallisetTavoitteetListana">
            <b-form-group :label="$t('paikallinen-teksti')">
              <ep-content
                v-if="isEditing || koulutuksenosa.paikallinenTarkennus.tavoitteetKuvaus"
                v-model="koulutuksenosa.paikallinenTarkennus.tavoitteetKuvaus"
                layout="normal"
                :is-editable="isEditing"
              />
              <EpAlert
                v-if="!isEditing && !koulutuksenosa.paikallinenTarkennus.tavoitteetKuvaus"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              />
            </b-form-group>
          </template>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <template #label>
              <h3>{{ $t('laaja-alainen-osaaminen') }}</h3>
            </template>
            <EpContent
              v-if="perusteenOsa.laajaAlaisenOsaamisenKuvaus"
              v-model="perusteenOsa.laajaAlaisenOsaamisenKuvaus"
              layout="normal"
              :is-editable="false"
            />
          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus">
            <EpKoodistoTekstillaSelect
              v-model="koulutuksenosa.paikallinenTarkennus.laajaalaisetosaamiset"
              :is-editing="isEditing"
              :store="laajaAlaisetKoodistoStore"
              :teksti-field="'laajaAlaisenOsaamisenKuvaus'"
            >
              {{ $t('lisaa-laaja-alaisen-osaamisen-kuvaus') }}

              <template #lisateksti="{ item }">
                <EpContent
                  v-if="laajaAlaisetKoodilla[item.koodiUri]"
                  v-model="laajaAlaisetKoodilla[item.koodiUri].perusteteksti"
                  layout="normal"
                  :is-editable="false"
                />
              </template>
            </EpKoodistoTekstillaSelect>
            <EpAlert
              v-if="!isEditing && koulutuksenosa.paikallinenTarkennus.laajaalaisetosaamiset.length === 0"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
            />
          </template>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <template #label>
              <h3>
                {{ $t('keskeinen-sisalto') }}
              </h3>
            </template>
            <EpContent
              v-if="perusteenOsa.keskeinenSisalto"
              v-model="perusteenOsa.keskeinenSisalto"
              layout="normal"
              :is-editable="false"
            />
          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus">
            <b-form-group :label="$t('paikallinen-teksti')">
              <ep-content
                v-if="isEditing || koulutuksenosa.paikallinenTarkennus.keskeinenSisalto"
                v-model="koulutuksenosa.paikallinenTarkennus.keskeinenSisalto"
                layout="normal"
                :is-editable="isEditing"
              />
              <EpAlert
                v-if="!isEditing && !koulutuksenosa.paikallinenTarkennus.keskeinenSisalto"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              />
            </b-form-group>
          </template>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <template #label>
              <h3>
                {{ $t('arviointi-teksti') }}
              </h3>
            </template>
            <EpContent
              v-if="perusteenOsa.arvioinninKuvaus"
              v-model="perusteenOsa.arvioinninKuvaus"
              layout="normal"
              :is-editable="false"
            />
          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus">
            <b-form-group :label="$t('paikallinen-teksti')">
              <ep-content
                v-if="isEditing || koulutuksenosa.paikallinenTarkennus.arvioinninKuvaus"
                v-model="koulutuksenosa.paikallinenTarkennus.arvioinninKuvaus"
                layout="normal"
                :is-editable="isEditing"
              />
              <EpAlert
                v-if="!isEditing && !koulutuksenosa.paikallinenTarkennus.arvioinninKuvaus"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              />
            </b-form-group>
          </template>
        </b-col>
      </b-row>
      <template v-if="koulutuksenosa.paikallinenTarkennus && (isEditing || koulutuksenosa.paikallinenTarkennus.koulutuksenJarjestajat.length > 0)">
        <hr>
        <b-row>
          <b-col md="10">
            <b-form-group>
              <template #label>
                <h3>
                  {{ $t('koulutuksen-jarjestajat') }}
                </h3>
              </template>

              <EpKoulutuksenJarjestajaSelect
                v-model="koulutuksenosa.paikallinenTarkennus.koulutuksenJarjestajat"
                :is-editing="isEditing"
              />
            </b-form-group>
          </b-col>
        </b-row>
      </template>
    </template>
  </EpEditointi>
  <EpSpinner
    v-else
    class="my-3"
  />
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import * as _ from 'lodash';

import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpKoodistoTekstillaSelect from '@shared/components/EpKoodistoSelect/EpKoodistoTekstillaSelect.vue';
import EpSortableTextList from '@shared/components/EpSortableTextList/EpSortableTextList.vue';
import EpKoulutuksenJarjestajaSelect from '@shared/components/EpKoulutuksenJarjestajaSelect/EpKoulutuksenJarjestajaSelect.vue';

import { KuvaStore } from '@/stores/KuvaStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { KoulutuksenosaStore } from '@/stores/KoulutuksenosaStore';
import { getKoodistoSivutettuna, KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Koodisto } from '@shared/api/eperusteet';
import { OpetussuunnitelmaDto, Sisaltoviitteet } from '@shared/api/amosaa';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const route = useRoute();
const instance = getCurrentInstance();

const editointiStore = ref<EditointiStore | null>(null);
const laajaAlaisetOsaamiset = ref<any[]>([]);

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const laajaAlaisetKoodilla = computed(() => {
  return _.keyBy(laajaAlaisetOsaamiset.value, 'tuvaLaajaAlainenOsaaminen.nimiKoodi');
});

const laajaAlaisetKoodistoStore = new KoodistoSelectStore({
  koodisto: 'tutkintokoulutukseenvalmentavakoulutuslaajaalainenosaaminen',
  async query(query: string, sivu = 0, koodisto) {
    return await getKoodistoSivutettuna(koodisto, query, sivu) as any;
  },
});

const laajaalaisetKoodit = computed(() => {
  return laajaAlaisetKoodistoStore.data.value?.data;
});

const perusteenOsa = computed(() => {
  return editointiStore.value?.data.perusteenOsa || editointiStore.value?.data.koulutuksenosa;
});

const paikallisetTavoitteetListana = computed(() => {
  return editointiStore.value?.data.koulutuksenosa.nimiKoodi === 'koulutuksenosattuva_104';
});

const fetch = async () => {
  editointiStore.value = new EditointiStore(
    new KoulutuksenosaStore(
      props.toteutussuunnitelmaId,
      props.koulutustoimijaId,
      props.sisaltoviiteId,
      versionumero.value,
      props.toteutussuunnitelmaStore.toteutussuunnitelma.value as OpetussuunnitelmaDto));
};

onMounted(async () => {
  laajaAlaisetOsaamiset.value = (await Sisaltoviitteet.getSisaltoviitteeTyypilla(props.toteutussuunnitelmaId, 'laajaalainenosaaminen', props.koulutustoimijaId)).data;
});

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });

watch(toteutussuunnitelma, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">

</style>

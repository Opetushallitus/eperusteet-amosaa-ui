<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      :label-copy-confirm="'kopioidaanko-tutkinnonosa'"
    >
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.tutkinnonosaViite.tekstiKappale.nimi) }}<span v-if="laajuus">, {{ laajuus }} {{ $t('osaamispiste') }}</span>
        </h2>
      </template>
      <template #default="{ data, isEditing, validation }">
        <div
          v-if="data.tutkinnonosaViite.tyyppi === 'linkki'"
          class="alert alert-info"
        >
          <router-link :to="{ name: 'tutkinnonosa', params: { toteutussuunnitelmaId: data.tutkinnonosaViite.linkattuOps, sisaltoviiteId: data.tutkinnonosaViite.linkattuSisaltoViiteId } }">
            {{ $t('siirry-alkuperaiseen-toteutukseen') }}
          </router-link>
        </div>

        <b-form-group
          v-if="data.tutkinnonosaViite.tosa.tyyppi !== 'perusteesta' && isEditing"
          class="flex-grow-1 mr-5"
          :label="$t('tutkinnon-osan-nimi') +' *'"
        >
          <ep-field
            v-model="data.tutkinnonosaViite.tekstiKappale.nimi"
            :is-editing="isEditing"
            :validation="validation.nimi"
          />
        </b-form-group>

        <b-form-group
          v-if="data.perusteenTutkinnonosa"
          :label="$t('koodi')"
        >
          <span>{{ data.perusteenTutkinnonosa.koodi.arvo }}</span>
        </b-form-group>

        <div
          v-if="data.tutkinnonosaViite.tosa.tyyppi !== 'perusteesta'"
          class="d-flex justify-content-between"
        >
          <b-form-group class="flex-grow-1 mr-5">
            <div
              slot="label"
              class="d-flex"
            >
              <span>{{ $t('koodi') }}</span>
              <EpInfoPopover
                v-if="isEditing"
                class="ml-2"
              >
                {{ $t('paikallinen-tutkinnon-osa-koodi-selite') }}
              </EpInfoPopover>
            </div>
            <ep-field
              v-model="data.omaTutkinnonosa.koodi"
              type="string"
              :is-editing="isEditing"
              :validation="validation.omaTutkinnonosa.koodi"
            />
          </b-form-group>
          <b-form-group
            v-if="data.omaTutkinnonosa && isEditing"
            :label="$t('laajuus')"
          >
            <div class="d-flex align-items-center">
              <ep-field
                v-model="data.omaTutkinnonosa.laajuus"
                type="number"
                :is-editing="isEditing"
              />
            </div>
          </b-form-group>
        </div>

        <div v-if="data.perusteenTutkinnonosa">
          <h3>{{ $t('tutkinnon-osan-kuvaus') }}</h3>
          <ep-content
            v-model="data.perusteenTutkinnonosa.kuvaus"
            layout="normal"
          />
        </div>

        <h3 v-if="isEditing">
          {{ $t('paikallinen-tarkennus') }}
        </h3>
        <ep-content
          v-model="data.tutkinnonosaViite.tekstiKappale.teksti"
          layout="normal"
          :is-editable="isEditing"
        />

        <h3
          v-if="isEditing && data.tutkinnonosaViite.tosa.vapaat.length > 0"
          class="pt-5 pb-3"
        >
          {{ $t('tekstikappaleet') }}
        </h3>
        <ep-collapse
          v-for="(vapaaTk, index) in data.tutkinnonosaViite.tosa.vapaat"
          :key="'vapaatk'+index"
          :border-bottom="false"
          :collapsable="!isEditing"
          :class="{'pt-0 pb-0': isEditing}"
        >
          <template #header>
            <h3 v-if="!isEditing">
              {{ $kaanna(vapaaTk.nimi) }}
            </h3>
            <h4 v-if="isEditing">
              {{ $t('tekstikappaleen-otsikko') }}
            </h4>
          </template>
          <ep-field
            v-if="isEditing"
            v-model="vapaaTk.nimi"
            :is-editing="isEditing"
          />

          <h4
            v-if="isEditing"
            class="pt-3"
          >
            {{ $t('tekstikappaleen-sisalto') }}
          </h4>
          <ep-content
            v-model="vapaaTk.teksti"
            layout="normal"
            :is-editable="isEditing"
          />

          <div
            v-if="isEditing"
            class="d-flex justify-content-between pt-3"
          >
            <ep-button
              v-if="index+1 === data.tutkinnonosaViite.tosa.vapaat.length"
              variant="outline-primary"
              icon="add"
              @click="lisaaTekstikappale(data.tutkinnonosaViite.tosa)"
            >
              {{ $t('lisaa-tekstikappale') }}
            </ep-button>
            <div v-else />

            <ep-button
              variant="link"
              icon="delete"
              @click="poistaTekstikappale(data.tutkinnonosaViite.tosa, vapaaTk)"
            >
              {{ $t('poista-tekstikappale') }}
            </ep-button>
          </div>
        </ep-collapse>

        <ep-button
          v-if="isEditing && data.tutkinnonosaViite.tosa.vapaat.length === 0"
          class="pb-4 pt-3"
          variant="outline-primary"
          icon="add"
          @click="lisaaTekstikappale(data.tutkinnonosaViite.tosa)"
        >
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>

        <div v-if="tutkinnonosaPerusteesta && data.perusteenTutkinnonosa.tyyppi === 'reformi_tutke2'">
          <EpYhteiset
            v-model="data.tutkinnonosaViite"
            :perusteen="data.perusteenTutkinnonosa"
            :is-editing="isEditing"
          >
            <template
              v-if="!isEditing && data.tutkinnonosaViite.tyyppi !== 'linkki'"
              #uusiosaalue
            >
              <ep-button
                variant="outline"
                icon="add"
                :show-spinner="lisataanOsaAlue"
                @click="lisaaOsaAlue()"
              >
                {{ $t('lisaa-osa-alue') }}
              </ep-button>
            </template>
          </EpYhteiset>
        </div>
        <div v-else-if="tutkinnonosaPerusteesta && data.perusteenTutkinnonosa.tyyppi === 'tutke2'">
          {{ $t('vanhoja-perustetyyppeja-ei-tueta') }}
        </div>
        <b-tabs
          v-else
          class="ml-0 pl-0 mt-4"
        >
          <b-tab :title="$t('paikallinen-toteutus')">
            <h3 class="mt-4">
              {{ $t('toteutukset') }}
            </h3>

            <EpTutkinnonosanPaikallisetToteutukset
              v-model="data.tutkinnonosaViite.tosa.toteutukset"
              :is-editing="isEditing && data.tutkinnonosaViite.tyyppi !== 'linkki'"
              :tyyppi="data.tutkinnonosaViite.tyyppi"
            />
          </b-tab>

          <b-tab
            v-if="tutkinnonosaPerusteesta"
            :title="$t('perusteen-sisalto')"
          >
            <EpPerusteenTutkinnonOsa
              :tutkinnonosa="data.perusteenTutkinnonosa"
              :arviointiasteikot="data.arviointiasteikot"
            />
          </b-tab>

          <b-tab
            v-else
            :title="$t('sisalto')"
          >
            <b-form-group>
              <template #label>
                <h3 class="pt-3">
                  {{ $t('ammattitaitovaatimukset') }}
                </h3>
              </template>

              <EpAmmattitaitovaatimuksetLista
                v-if="isAmmattitaitovaatimuksetLista"
                v-model="data.omaTutkinnonosa.ammattitaitovaatimuksetLista[0].vaatimuksenKohteet"
                :is-editing="isEditing"
              />

              <EpAmmattitaitovaatimukset
                v-else
                v-model="data.omaTutkinnonosa.ammattitaitovaatimukset"
                :is-editing="isEditing"
              />
            </b-form-group>

            <b-form-group>
              <template #label>
                <h3 class="pt-3">
                  {{ $t('arviointi') }}
                </h3>
              </template>

              <EpArvioinninKohdeAlueet
                v-if="valittuArviointiTyyppi !== 'geneerinen'"
                v-model="data.omaTutkinnonosa.arviointi.arvioinninKohdealueet"
                :arviointiasteikot="data.arviointiasteikot"
                :is-editing="isEditing"
              />

              <EpButton
                v-if="isEditing && !valittuArviointiTyyppi"
                variant="outline"
                icon="add"
                @click="arvioinninTyyppi = 'geneerinen'"
              >
                {{ $t('lisaa-geneerinen-arviointi') }}
              </EpButton>

              <GeneerinenArviointi
                v-if="valittuArviointiTyyppi === 'geneerinen'"
                v-model="data.omaTutkinnonosa.geneerinenarviointi"
                :is-editing="isEditing"
              >
                <template #header />
              </GeneerinenArviointi>

              <EpButton
                v-if="isEditing && data.omaTutkinnonosa.geneerinenarviointi"
                class="no-padding"
                variant="link"
                icon="delete"
                @click="poistaGeneerinenaArviointi"
              >
                {{ $t('poista-geneerinen-arviointi') }}
              </EpButton>
            </b-form-group>

            <b-form-group>
              <template #label>
                <h3 class="pt-3">
                  {{ $t('ammattitaidon-osoittamistavat') }}
                </h3>
              </template>
              <ep-content
                v-model="data.omaTutkinnonosa.ammattitaidonOsoittamistavat"
                layout="normal"
                :is-editable="isEditing"
              />
            </b-form-group>
          </b-tab>
        </b-tabs>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import _ from 'lodash';

import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import EpPerusteenTutkinnonOsa from '@/components/EpAmmatillinen/EpPerusteenTutkinnonOsa.vue';
import EpTutkinnonosanPaikallisetToteutukset from '@/components/EpAmmatillinen/EpTutkinnonosanPaikallisetToteutukset.vue';
import EpAmmattitaitovaatimuksetLista from '@/components/EpAmmatillinen/EpAmmattitaitovaatimuksetLista.vue';
import EpYhteiset from '@/components/EpAmmatillinen/EpYhteiset.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import GeneerinenArviointi from '@/components/EpAmmatillinen/GeneerinenArviointi.vue';
import EpArvioinninKohdeAlueet from '@shared/components/EpArviointi/EpArvioinninKohdeAlueet.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { VapaaTekstiDto, TutkinnonosaToteutusDto, TutkinnonosaDto } from '@shared/api/amosaa';
import { koodiValidator, requiredOneLang } from '@shared/validators/required';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  sisaltoviiteId: string | number;
}>();

const route = useRoute();
const router = useRouter();
const instance = getCurrentInstance();

const editointiStore = ref<EditointiStore | null>(null);
const lisataanOsaAlue = ref(false);
const arvioinninTyyppi = ref<'geneerinen' | 'tutkinnonosa-kohtainen' | null>(null);

const uusi = computed(() => {
  return route.query && _.has(route.query, 'uusi');
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const perusteId = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value!.peruste!.id;
});

const tutkinnonosaPerusteesta = computed(() => {
  if (editointiStore.value && editointiStore.value.data) {
    return editointiStore.value.data.tutkinnonosaViite.tosa.tyyppi === 'perusteesta';
  }
  return undefined;
});

const nimi = computed(() => {
  return editointiStore.value?.data?.tutkinnonosaViite.tekstiKappale.nimi;
});

const omaTutkinnonosa = computed(() => {
  return editointiStore.value?.data?.omaTutkinnonosa;
});

const laajuus = computed(() => {
  return editointiStore.value?.data?.perusteenTutkinnonosaViite?.laajuus || editointiStore.value?.data?.omaTutkinnonosa?.laajuus;
});


const isAmmattitaitovaatimuksetLista = computed(() => {
  return _.size(_.get(editointiStore.value, 'omaTutkinnonosa.ammattitaitovaatimuksetLista[0].vaatimuksenKohteet')) > 0;
});

const valittuArviointiTyyppi = computed(() => {
  if (editointiStore.value?.omaTutkinnonosa?.geneerinenarviointi) {
    return 'geneerinen';
  }

  if (_.size(_.get(editointiStore.value, 'omaTutkinnonosa.arviointi.arvioinninKohdealueet')) > 0) {
    return 'tutkinnonosakohtainen';
  }

  return arvioinninTyyppi.value;
});

const fetch = () => {
  if (toteutussuunnitelma.value) {
    editointiStore.value = new EditointiStore(
      new TutkinnonOsaStore(
        _.toNumber(props.toteutussuunnitelmaId),
        _.toString(props.koulutustoimijaId),
        _.toNumber(props.sisaltoviiteId),
        perusteId.value!,
        versionumero.value,
        uusi.value));
  }
};

const lisaaTekstikappale = (toteutus: TutkinnonosaToteutusDto | TutkinnonosaDto) => {
  toteutus.vapaat = [
    ..._.toArray(toteutus.vapaat),
    {},
  ];
};

const poistaTekstikappale = (toteutus: TutkinnonosaToteutusDto | TutkinnonosaDto, vapaaTeksti: VapaaTekstiDto) => {
  toteutus.vapaat = _.filter(toteutus.vapaat, vpTeksti => vpTeksti !== vapaaTeksti);
};

const updateNavigation = async () => {
  await props.toteutussuunnitelmaStore.initNavigation();
};

const lisaaOsaAlue = async () => {
  lisataanOsaAlue.value = true;
  const uusiOsaAlueId = await TutkinnonOsaStore.lisaaOsaAlue(props.toteutussuunnitelmaId, props.sisaltoviiteId, props.koulutustoimijaId, instance);
  await updateNavigation();
  if (uusiOsaAlueId) {
    router.push({
      name: 'osaalue',
      params: {
        osaalueId: _.toString(uusiOsaAlueId),
      },
    });
  }
};

const poistaGeneerinenaArviointi = () => {
  editointiStore.value?.setData({
    ...editointiStore.value?.data,
    omaTutkinnonosa: {
      ...editointiStore.value?.data.omaTutkinnonosa,
      geneerinenarviointi: null,
    },
  });

  arvioinninTyyppi.value = null;
};

watch(toteutussuunnitelma, () => {
  fetch();
}, { immediate: true });

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

  :deep(.nav-tabs li:first-child a) {
    margin-left: 0px !important;
  }

  :deep(.ep-button.p-0 .btn) {
    padding: 0px;
  }

  :deep(.pt-0 .ep-collapse) {
    padding-top: 0px;
  }

  :deep(.pb-0 .ep-collapse) {
    padding-bottom: 0px;
  }

  .toteutus {
    border-radius: 0.75rem;
    padding: 0px 10px;
    margin-bottom: 20px;
    @include tile-background-shadow;
  }

  .checked {
    color: $paletti-blue;
  }

  .raahaus {
    margin-top: 4px;
    color: $gray-lighten-1;
  }

</style>

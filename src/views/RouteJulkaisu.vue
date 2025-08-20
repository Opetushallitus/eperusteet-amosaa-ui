<template>
  <div class="p-4">
    <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
      <div
        v-if="$isAdmin()"
        class="d-flex flex-column"
      >
        <EpSpinner v-if="hallintaLoading" />
        <b-dropdown
          v-else
          class="asetukset"
          size="lg"
          variant="link"
          dropleft
          toggle-class="text-decoration-none"
          no-caret
        >
          <template #button-content>
            {{ $t('hallinta') }}
            <EpMaterialIcon
              icon-shape="outlined"
              class="hallinta"
            >
              settings
            </EpMaterialIcon>
          </template>
          <EpButton
            variant="link"
            @click="poistaJulkaisut"
          >
            {{ $t('poista-julkaisut') }}
          </EpButton>
        </b-dropdown>
      </div>
    </div>

    <div>{{ $t('julkaisunakyma-kuvaus') }}</div>

    <div class="mt-4">
      <h3>{{ $t('julkaisun-vaikutukset') }}</h3>
      <ul>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-1') }}</li>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-2') }}</li>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-3') }}</li>
        <li>{{ $t('opetussuunnitelma-julkaisun-vaikutukset-4') }}</li>
      </ul>
    </div>

    <div>
      <h3>{{ $t('tarkistukset') }}</h3>
      <div class="validation">
        <div
          v-if="isValidating"
          class="validointi-spinner"
        >
          <EpSpinner />
          <div>{{ $t('validointi-kaynnissa') }}</div>
        </div>
        <div v-else>
          <div
            v-if="isValid"
            class="d-flex"
          >
            <EpMaterialIcon class="no-errors">
              check_circle
            </EpMaterialIcon>
            <div class="ml-2">
              {{ $t('ei-julkaisua-estavia-virheita') }}
            </div>
          </div>
          <div
            v-else
            class="d-flex"
          >
            <EpMaterialIcon class="errors">
              info
            </EpMaterialIcon>
            <div class="ml-2">
              {{ $t('loytyi-julkaisun-estavia-virheita') }}
            </div>
          </div>

          <div
            v-for="(validointi, idx) in validoinnit"
            :key="'validointi'+idx"
          >
            <ep-collapse
              v-if="validointi.virheet.length > 0 || validointi.huomautukset.length > 0"
              :border-bottom="false"
            >
              <template #header>
                <h3>{{ $t(validointi.kategoria) }}</h3>
              </template>
              <EpJulkaisuValidointi :validointi="validointi" />
            </ep-collapse>
          </div>
        </div>
      </div>

      <hr class="mt-4 mb-4">

      <template v-if="suunnitelma">
        <h3>{{ $t('suunnitelman-tiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('opetussuunnitelman-nimi')">
                <EpInput v-model="suunnitelma.nimi" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('tiivistelma')">
                <EpContent
                  v-model="suunnitelma.kuvaus"
                  layout="full"
                />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('paatosnumero')">
                <EpInput
                  v-if="suunnitelma.paatosnumero"
                  v-model="suunnitelma.paatosnumero"
                  type="string"
                />
                <template v-else>
                  -
                </template>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('paatospaivamaara')">
                <EpDatepicker v-model="suunnitelma.paatospaivamaara" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('hyvaksyja')">
                <EpInput
                  v-if="suunnitelma.hyvaksyja"
                  v-model="suunnitelma.hyvaksyja"
                  type="string"
                />
                <template v-else>
                  -
                </template>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('voimassaolo')">
                <div class="d-flex align-items-center">
                  <EpDatepicker v-model="suunnitelma.voimaantulo" />
                  <template v-if="suunnitelma.voimassaoloLoppuu">
                    <div class="ml-2 mr-2">
                      -
                    </div>
                    <EpDatepicker v-model="suunnitelma.voimassaoloLoppuu" />
                  </template>
                </div>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('julkaisukielet')">
                <div
                  v-if="suunnitelma.julkaisukielet.length > 0"
                  class="text-nowrap"
                >
                  <span
                    v-for="(kieli, idx) in suunnitelma.julkaisukielet"
                    :key="kieli"
                    :value="kieli"
                  >
                    {{ $t(kieli) }}<span
                      v-if="idx < suunnitelma.julkaisukielet.length - 1"
                      class="mr-0"
                    >,</span>
                  </span>
                </div>
                <template v-else>
                  -
                </template>
              </b-form-group>
            </b-col>
            <b-col
              v-if="!isOpsPohja"
              lg="6"
            >
              <b-form-group :label="$t('esikatselu')">
                <EpExternalLink
                  v-if="julkaisut && julkaisut.length > 0"
                  :url="esikatseluUrl"
                >
                  {{ $t(kielistykset['esikatselu']) }}
                </EpExternalLink>
                <template v-else>
                  -
                </template>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <hr class="mt-4 mb-4">

        <div v-if="julkaisuMahdollinen && julkaisut">
          <h3>{{ $t('uusi-julkaisu') }}</h3>
          <b-form-group :label="$t('julkaisun-tiedote')">
            <div class="font-size-08 mb-2">
              {{ $t('tiedote-naytetaan-tyoryhmalle-taman-sivun-julkaisuhistoriassa') }}
            </div>
            <ep-content
              v-model="julkaisu.tiedote"
              layout="simplified"
              :is-editable="true"
            />
            <EpJulkaisuButton
              v-oikeustarkastelu="{ oikeus: 'muokkaus' }"
              class="mt-3"
              :julkaise="julkaiseHandler"
              :julkaisu-kesken="julkaisuKesken"
            />
          </b-form-group>
        </div>

        <EpJulkaisuHistoria
          :julkaisut="julkaisut"
          :palauta="palautaJulkaisu"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import _ from 'lodash';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { JulkaisuKielistykset } from '@/utils/toteutustypes';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpJulkaisuHistoria from '@shared/components/EpJulkaisuHistoria/EpJulkaisuHistoria.vue';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import EpJulkaisuValidointi from '@shared/components/EpJulkaisuValidointi/EpJulkaisuValidointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaDtoTilaEnum, OpetussuunnitelmaDtoTyyppiEnum, Maintenance } from '@shared/api/amosaa';
import { Toteutus } from '@shared/utils/perusteet';
import { nodeToRoute } from '@/utils/routing';
import { $t, $success, $fail, $isAdmin } from '@shared/utils/globals';

const props = defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  toteutus: Toteutus;
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
}>();

const julkaisu = reactive({
  tiedote: {},
});

const hallintaLoading = ref(false);

const suunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const esikatseluUrl = computed(() => {
  return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/toteutussuunnitelma/${suunnitelma.value!.id}`, `/${props.toteutus}`);
});

const validoinnit = computed(() => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value) {
    return _.map(props.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value, validointi => {
      return {
        ...validointi,
        virheet: listNodeToRoute(validointi.virheet),
        huomautukset: listNodeToRoute(validointi.huomautukset),
        huomiot: listNodeToRoute(validointi.huomiot),
      };
    });
  }

  return undefined;
});

const isValidating = computed(() => {
  return !validoinnit.value;
});

const isValid = computed(() => {
  if (validoinnit.value) {
    return _.every(validoinnit.value, validointi => _.isEmpty(validointi.virheet));
  }

  return undefined;
});

const julkaisuMahdollinen = computed(() => {
  return isValid.value && suunnitelma.value?.tila !== _.toLower(OpetussuunnitelmaDtoTilaEnum.POISTETTU);
});

const julkaisut = computed(() => {
  return props.toteutussuunnitelmaStore.julkaisut.value;
});

const sisaltoKieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const kielistykset = computed(() => {
  return JulkaisuKielistykset[props.toteutus];
});

const isOpsPohja = computed(() => {
  return suunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
});

const julkaisuKesken = computed(() => {
  return props.toteutussuunnitelmaStore.viimeisinJulkaisuTila.value === 'KESKEN';
});

const listNodeToRoute = (list: any[]) => {
  return _.map(list, item => ({ ...item, route: nodeToRoute(item.navigationNode) }));
};

const julkaiseHandler = async () => {
  try {
    await props.toteutussuunnitelmaStore.julkaise(julkaisu);
    julkaisu.tiedote = {};
    $success($t('julkaisu-kaynnistetty') as string);
  }
  catch (err) {
    $fail($t('julkaisu-epaonnistui') as string);
  }
};

const palautaJulkaisu = async (julkaisuParam: any) => {
  try {
    await props.toteutussuunnitelmaStore.palautaJulkaisu(julkaisuParam.revision);
    $success($t('suunnitelman-julkaisuversio-palautettu-julkiseksi') as string);
  }
  catch (err) {
    $fail($t('palautus-epaonnistui') as string);
  }
};

const poistaJulkaisut = async () => {
  hallintaLoading.value = true;
  await Maintenance.poistaJulkaisut(suunnitelma.value!.id!);
  await props.toteutussuunnitelmaStore.updateCurrent();
  await props.toteutussuunnitelmaStore.fetchJulkaisut();
  $success($t('suunnitelman-julkaisut-poistettu') as string);
  hallintaLoading.value = false;
};

onMounted(async () => {
  await props.toteutussuunnitelmaStore.updateValidation();
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables';

.validation {
  border: 1px solid #ccc;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 20px;
}

.validointi-spinner {
  text-align: center;
}

.no-errors {
  color: $green;
}

.errors {
  color: $invalid;
}

.content {
  padding: 15px 50px 50px 50px;
}

.julkaisu:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}

.julkaisu:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>

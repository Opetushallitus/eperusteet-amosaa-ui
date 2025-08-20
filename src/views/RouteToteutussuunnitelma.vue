<template>
  <div class="minfull p-0 m-0">
    <Teleport
      defer
      to="#headerExtension"
    >
      <div class="portal-menu d-flex">
        <div class="upper-left d-flex justify-content-center">
          <EpValidPopover
            :validoitava="toteutussuunnitelma"
            :validoinnit="validoinnit"
            :julkaisemattomia-muutoksia="onkoJulkaisemattomiaMuutoksia"
            :julkaistava="!isOpsPohja"
            :is-validating="isValidating"
            :tyyppi="(toteutus as any) ==='ammatillinen' ? 'toteutussuunnitelma' as any : 'opetussuunnitelma' as any"
            @asetaValmiiksi="asetaValmiiksi"
            @palauta="palauta"
            @validoi="validoi"
          />
        </div>

        <div class="flex-grow-1 align-self-center">
          <div
            v-if="toteutussuunnitelma"
            class="mb-5 p-2"
          >
            <h1>
              <span>{{ $kaanna(toteutussuunnitelma.nimi) }}</span>
            </h1>
            <div class="diaarinumero mt-2">
              <template v-if="toteutussuunnitelma.peruste">
                <span>{{ $kaanna(toteutussuunnitelma.peruste.nimi) }}</span>
                <span class="ml-2 mr-2">|</span>
                <span>{{ toteutussuunnitelma.peruste.diaarinumero }}</span>
                <span class="ml-2 mr-2">|</span>
              </template>

              <b-dropdown
                class="asetukset"
                size="sm"
                no-caret
                variant="transparent"
              >
                <template #button-content>
                  <span>{{ $t('lisatoiminnot') }}</span>
                  <EpMaterialIcon
                    icon-shape="outlined"
                    class="hallinta"
                    size="22px"
                  >
                    expand_more
                  </EpMaterialIcon>
                </template>

                <div
                  v-for="(ratasvalinta, index) in ratasvalinnat"
                  :key="'ratasvalinta'+index"
                >
                  <hr
                    v-if="(ratasvalinta as any).separator"
                    class="mt-2 mb-2"
                  >
                  <b-dropdown-item
                    v-if="(ratasvalinta as any).route"
                    :to="{ name: (ratasvalinta as any).route }"
                  >
                    <EpMaterialIcon icon-shape="outlined">
                      {{ (ratasvalinta as any).icon }}
                    </EpMaterialIcon>
                    {{ $t((ratasvalinta as any).text) }}
                  </b-dropdown-item>

                  <b-dropdown-item
                    v-if="(ratasvalinta as any).click"
                    @click="ratasClick((ratasvalinta as any).click, (ratasvalinta as any).meta)"
                  >
                    <EpMaterialIcon icon-shape="outlined">
                      {{ (ratasvalinta as any).icon }}
                    </EpMaterialIcon>
                    {{ $t((ratasvalinta as any).text) }}
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <EpSidebar :show-social="false">
      <template #bar>
        <div class="m-3 ml-4 mr-4">
          <EpSearch v-model="query" />
        </div>

        <EpSpinner v-if="!navigationValue" />
        <div
          v-else
          class="navigation"
        >
          <EpTreeNavibar
            :store="naviStore! as any"
            show-all-toggle
            :query="query"
          >
            <template #header>
              <div class="heading">
                <div class="menu-item">
                  <router-link
                    :to="{ name: 'toteutussuunnitelma' }"
                    exact
                  >
                    {{ $t('yleisnakyma') }}
                  </router-link>
                </div>
              </div>
            </template>

            <template #tutkinnonosat="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'tutkinnonosat' }"
                  :node="item"
                >
                  {{ $t('tutkinnonosat') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #tutkinnonosat_pakolliset>
              <div class="menu-item">
                {{ $t('tutkinnonosat-pakolliset') }}
              </div>
            </template>

            <template #tutkinnonosat_paikalliset>
              <div class="menu-item clickable">
                {{ $t('tutkinnonosat-paikalliset') }}
              </div>
            </template>

            <template #tutkinnonosat_tuodut>
              <div class="menu-item">
                {{ $t('tutkinnonosat-tuodut') }}
              </div>
            </template>

            <template #pakolliset_osaalueet>
              <div class="menu-item faded pb-0">
                {{ $t('pakolliset-osa-alueet') }}
              </div>
            </template>

            <template #valinnaiset_osaalueet>
              <div class="menu-item mt-4 faded pb-0">
                {{ $t('valinnaiset-osa-alueet') }}
              </div>
            </template>

            <template #paikalliset_osaalueet>
              <div class="menu-item mt-4 faded pb-0">
                {{ $t('paikalliset-osa-alueet') }}
              </div>
            </template>

            <template #suorituspolut="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'suorituspolut', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $t('suorituspolut') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #linkki="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'tutkinnonosa', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #tutkinnonosa="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'tutkinnonosa', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) || $t('nimeton-tutkinnonosa') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #suorituspolku="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'suorituspolku', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) || $t('nimeton-suorituspolku') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #osasuorituspolku="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'suorituspolku', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) || $t('nimeton-osasuorituspolku') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #tekstikappale="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'tekstikappale', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  <span
                    v-if="isVapaaSivistystyo"
                    class="text-muted mr-1"
                  >{{ item.chapter }}</span>
                  {{ $kaanna(item.label) || $t('nimetön-tekstikappale') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #opintokokonaisuus="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'opintokokonaisuus', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  <span
                    v-if="isVapaaSivistystyo"
                    class="text-muted mr-1"
                  >{{ item.chapter }}</span>
                  {{ $kaanna(item.label) || $t('nimeton-opintokokonaisuus') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #osaamismerkki="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'osaamismerkkikappale', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  <span
                    v-if="isVapaaSivistystyo"
                    class="text-muted mr-1"
                  >{{ item.chapter }}</span>
                  {{ $t('kansalliset-perustaitojen-osaamismerkit') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #koulutuksenosat="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'koulutuksenosat', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $t('koulutuksenosat') }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #koulutuksenosa="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'koulutuksenosa', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }} <span v-if="item.koodi">({{ item.koodi }})</span>
                </EpNavigationLabel>
              </div>
            </template>

            <template #laajaalainenosaaminen="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'laajaalainenosaaminen', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #koto_kielitaitotaso="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'koto_kielitaitotaso', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #koto_opinto="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'koto_opinto', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #koto_laajaalainenosaaminen="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'koto_laajaalainenosaaminen', params: {sisaltoviiteId: item.id} }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }}
                </EpNavigationLabel>
              </div>
            </template>

            <template #osaalue="{ item }">
              <div class="menu-item">
                <EpNavigationLabel
                  :to="{ name: 'osaalue', params: { sisaltoviiteId: item.meta.sisaltoviiteId, osaalueId: item.id } }"
                  :node="item"
                >
                  {{ $kaanna(item.label) }} <span
                    v-if="item.koodi"
                    class="faded"
                  >({{ item.koodi.toUpperCase() }})</span>
                </EpNavigationLabel>
              </div>
            </template>

            <template #new>
              <div class="mb-3">
                <EpTekstikappaleLisays
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  :tallenna="tallennaUusiTekstikappale"
                  :tekstikappaleet="perusteenOsat"
                  :paatasovalinta="true"
                >
                  <template #default="{tekstikappale}: any">
                    <span class="text-muted mr-1">{{ (tekstikappale as any).chapter }}</span>
                    {{ $kaanna((tekstikappale as any).label) }}
                  </template>
                </EpTekstikappaleLisays>

                <EpTekstikappaleLisays
                  v-if="isVapaaSivistystyo"
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  :tallenna="tallennaUusiOpintokokonaisuus"
                  :tekstikappaleet="perusteenOsat"
                  :paatasovalinta="true"
                  :otsikko-required="true"
                  modal-id="opintokokonaisuusLisays"
                >
                  <template #lisays-btn-text>
                    {{ $t('uusi-opintokokonaisuus') }}
                  </template>
                  <template #modal-title>
                    {{ $t('uusi-opintokokonaisuus') }}
                  </template>
                  <template #footer-lisays-btn-text>
                    {{ $t('lisaa-opintokokonaisuus') }}
                  </template>
                  <template #header>
                    {{ $t('opintokokonaisuuden-sijainti') }}
                  </template>
                  <template #default="{tekstikappale}: any">
                    <span class="text-muted mr-1">{{ (tekstikappale as any).chapter }}</span>
                    {{ $kaanna((tekstikappale as any).label) }}
                  </template>
                </EpTekstikappaleLisays>

                <EpTekstikappaleLisays
                  v-if="isVapaaSivistystyo"
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  :tallenna="tallennaUusiOsaamismerkkiKappale"
                  :tekstikappaleet="perusteenOsat"
                  :paatasovalinta="true"
                  :otsikko-required="false"
                  modal-id="osaamismerkkiKappaleLisays"
                >
                  <template #lisays-btn-text>
                    {{ $t('uusi-osaamismerkki-kappale') }}
                  </template>
                  <template #modal-title>
                    {{ $t('uusi-osaamismerkki-kappale') }}
                  </template>
                  <template #footer-lisays-btn-text>
                    {{ $t('lisaa-osaamismerkki-kappale') }}
                  </template>
                  <template #header>
                    {{ $t('osaamismerkki-kappaleen-sijainti') }}
                  </template>
                  <template #default="{tekstikappale}: any">
                    <span class="text-muted mr-1">{{ (tekstikappale as any).chapter }}</span>
                    {{ $kaanna((tekstikappale as any).label) }}
                  </template>
                </EpTekstikappaleLisays>

                <EpTekstikappaleLisays
                  v-if="isAmmatillinen && !isYhteinen && !isJaettuOsa"
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  :hide-taso="true"
                  :tallenna="lisaaUusiSuorituspolku"
                  :tekstikappaleet="perusteenOsat"
                  :paatasovalinta="true"
                  :otsikko-nimi="'suorituspolku-nimi'"
                  :otsikko-required="true"
                  modal-id="suorituspolkuLisays"
                >
                  <template #lisays-btn-text>
                    {{ $t('uusi-suorituspolku') }}
                  </template>
                  <template #modal-title>
                    {{ $t('uusi-suorituspolku') }}
                  </template>
                  <template #footer-lisays-btn-text>
                    {{ $t('lisaa-suorituspolku') }}
                  </template>
                  <template #header>
                    {{ $t('suorituspolun-sijainti') }}
                  </template>
                  <template #default="{tekstikappale}: any">
                    <span class="text-muted mr-1">{{ (tekstikappale as any).chapter }}</span>
                    {{ $kaanna((tekstikappale as any).label) }}
                  </template>
                </EpTekstikappaleLisays>

                <EpTekstikappaleLisays
                  v-if="isAmmatillinen && !isYhteinen"
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  :tallenna="lisaaUusiTutkinnonOsa"
                  :hide-taso="true"
                  :tekstikappaleet="perusteenOsat"
                  :otsikko-nimi="'tutkinnonosa-nimi'"
                  :paatasovalinta="true"
                  :otsikko-required="true"
                  modal-id="tutkinnonOsanLisays"
                >
                  <template #lisays-btn-text>
                    {{ $t('luonti-tutkinnon-osa') }}
                  </template>
                  <template #modal-title>
                    {{ $t('luonti-tutkinnon-osa') }}
                  </template>
                  <template #footer-lisays-btn-text>
                    {{ $t('luonti-tutkinnon-osa') }}
                  </template>
                  <template #header>
                    {{ $t('tutkinnonosan-sijainti') }}
                  </template>
                  <template #default="{tekstikappale}: any">
                    <span class="text-muted mr-1">{{ (tekstikappale as any).chapter }}</span>
                    {{ $kaanna((tekstikappale as any).label) }}
                  </template>
                </EpTekstikappaleLisays>
              </div>
            </template>
          </EpTreeNavibar>
        </div>
      </template>

      <template #view>
        <router-view v-if="toteutussuunnitelma" />
      </template>

      <template #bottom>
        <div class="menu-item bottom-menu-item">
          <router-link
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
            :to="{ name: 'jarjesta' }"
          >
            <span class="text-nowrap">
              <EpMaterialIcon
                icon-shape="outlined"
                class="icon"
              >reorder</EpMaterialIcon>
              <a class="btn btn-link btn-link-nav">{{ $t('muokkaa-jarjestysta') }}</a>
            </span>
          </router-link>
        </div>
      </template>
    </EpSidebar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, provide, inject, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';
import _ from 'lodash';

import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpNavigationLabel from '@shared/components/EpTreeNavibar/EpNavigationLabel.vue';
import EpSisaltoLisays from '@/components/EpSisaltoLisays/EpSisaltoLisays.vue';

import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { SisaltoEditStore } from '@/stores/SisaltoEditStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KayttajaStore } from '@/stores/kayttaja';
import { KuvaStore } from '@/stores/KuvaStore';
import { OsaamismerkkiKappaleStore } from '@/stores/OsaamismerkkiKappaleStore';

import { MatalaTyyppiEnum, SisaltoviiteMatalaDto, NavigationNodeDtoTypeEnum, OpetussuunnitelmaDtoTilaEnum, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { Toteutus } from '@shared/utils/perusteet';

import { Murupolku } from '@shared/stores/murupolku';
import { ArkistointiTekstit, OpetussuunnitelmaTyyppi, ToteutussuunnitelmaTiedotKielistykset } from '@/utils/toteutustypes';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import { LinkkiHandler, routeToNode } from '@/utils/routing';
import { chapterStringSort } from '@shared/utils/NavigationBuilder';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';

import { $t, $kaanna, $hasOikeus } from '@shared/utils/globals';

interface Props {
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  toteutussuunnitelmaId: number;
  koulutustoimijaId: string;
  kayttajaStore: KayttajaStore;
  toteutus: Toteutus;
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

// Reactive data
const isInitializing = ref(false);
const naviStore = ref<EpTreeNavibarStore | null>(null);
const query = ref('');
const isValidating = ref(false);

// Computed properties
const opetussuunnitelmaTyyppi = computed(() => {
  return isOpsPohja.value ? OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA : props.toteutus;
});

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const navigation = computed(() => {
  return props.toteutussuunnitelmaStore.navigation;
});

const navigationValue = computed(() => {
  return props.toteutussuunnitelmaStore.navigation.value;
});

const koulutustoimija = computed(() => {
  return props.kayttajaStore.koulutustoimija.value || null;
});

const isAmmatillinen = computed((): boolean => {
  return props.toteutus === Toteutus.AMMATILLINEN;
});

const isVapaaSivistystyo = computed((): boolean => {
  return props.toteutus === Toteutus.VAPAASIVISTYSTYO;
});

const isTutkintoonValmentava = computed((): boolean => {
  return props.toteutus === Toteutus.TUTKINTOONVALMENTAVA;
});

const isKoto = computed((): boolean => {
  return props.toteutus === Toteutus.KOTOUTUMISKOULUTUS;
});

const isYhteinen = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.YHTEINEN);
});

const isJaettuOsa = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.YLEINEN);
});

const isOpsPohja = computed(() => {
  return toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
});

const julkaisut = computed(() => {
  return props.toteutussuunnitelmaStore.julkaisut.value;
});

const isPublished = computed((): boolean => {
  return toteutussuunnitelma.value?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.JULKAISTU) || _.size(julkaisut.value) > 0;
});

const isReady = computed((): boolean => {
  return toteutussuunnitelma.value?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.VALMIS);
});

const isDraft = computed((): boolean | undefined => {
  return !isPublished.value && toteutussuunnitelma.value?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.LUONNOS);
});

const isArchived = computed((): boolean => {
  return toteutussuunnitelma.value?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.POISTETTU);
});

const tekstikappaleet = computed(() => {
  if (naviStore.value?.connected) {
    return _.filter(naviStore.value.connected, node => node.type === (NavigationNodeDtoTypeEnum.Tekstikappale as string));
  }
  return [];
});

const opintokokonaisuudet = computed(() => {
  if (naviStore.value?.connected) {
    return _.filter(naviStore.value.connected, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
  }
  return [];
});

const koulutuksenosat = computed(() => {
  if (naviStore.value?.connected) {
    return _.filter(naviStore.value.connected, node => node.type === NavigationNodeDtoTypeEnum.Koulutuksenosa);
  }
  return [];
});

const laajaalaisetOsaamiset = computed(() => {
  if (naviStore.value?.connected) {
    return _.filter(naviStore.value.connected, node => node.type === NavigationNodeDtoTypeEnum.Laajaalainenosaaminen);
  }
  return [];
});

const perusteenOsat = computed(() => {
  return _.sortBy([
    ...tekstikappaleet.value,
    ...opintokokonaisuudet.value,
    ...koulutuksenosat.value,
    ...laajaalaisetOsaamiset.value,
  ], osa => chapterStringSort(osa.chapter));
});

const validoinnit = computed(() => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value) {
    return {
      virheet: _.chain(props.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value)
        .map('virheet')
        .flatMap()
        .map('kuvaus')
        .value(),
      huomautukset: _.chain(props.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value)
        .map('huomautukset')
        .flatMap()
        .map('kuvaus')
        .value(),
    };
  }

  return undefined;
});

const tila = computed(() => {
  if (julkaisut.value) {
    if (isPublished.value) {
      return _.toLower(OpetussuunnitelmaDtoTilaEnum.JULKAISTU);
    }

    return _.toLower(toteutussuunnitelma.value?.tila);
  }

  return undefined;
});

const poistonVaatimaOikeus = computed(() => {
  if (isArchived.value) {
    return undefined;
  }

  if (isDraft.value || props.toteutus !== Toteutus.VAPAASIVISTYSTYO) {
    return { oikeus: 'hallinta', kohde: 'toteutussuunnitelma' };
  }

  if ($hasOikeus('hallinta', 'oph')) {
    return { oikeus: 'hallinta', kohde: 'oph' };
  }

  return undefined;
});

const ratasvalinnat = computed(() => {
  let rattaat = [
    {
      text: ToteutussuunnitelmaTiedotKielistykset[opetussuunnitelmaTyyppi.value]['title'],
      route: 'toteutussuunnitelmantiedot',
      icon: 'info',
    },
    {
      text: 'ystava-organisaatioiden-kayttooikeudet',
      route: 'ystava-organisaatioiden-kayttooikeudet',
      icon: 'verified_user',
    },
    {
      text: 'luo-pdf',
      route: 'pdfLuonti',
      icon: 'picture_as_pdf',
    },
    {
      text: 'poistetut-sisallot',
      route: 'poistetutsisallot',
      icon: 'delete',
    },
  ];

  if (poistonVaatimaOikeus.value) {
    rattaat = [
      ...rattaat,
      {
        separator: true,
        oikeus: poistonVaatimaOikeus.value,
      } as any,
      {
        icon: 'archive',
        click: vaihdaOpetussunnitelmaTilaConfirm,
        ...ArkistointiTekstit.arkistointi[opetussuunnitelmaTyyppi.value],
        oikeus: poistonVaatimaOikeus.value,
      } as any,
    ];
  }

  return rattaat;
});

const onkoJulkaisemattomiaMuutoksia = computed(() => {
  return props.toteutussuunnitelmaStore.julkaisemattomiaMuutoksia.value;
});

// Methods
const fetch = async () => {
  isInitializing.value = true;
  try {
    Murupolku.aseta('toteutussuunnitelma', '...');
    await props.toteutussuunnitelmaStore.init(props.koulutustoimijaId, props.toteutussuunnitelmaId);
    Murupolku.aseta('toteutussuunnitelma', $t(OpetussuunnitelmaTyyppi[opetussuunnitelmaTyyppi.value]));

    if (navigation.value) {
      naviStore.value = new EpTreeNavibarStore(navigation.value, routeToNode);
    }
  }
  finally {
    isInitializing.value = false;
  }
};

const updateNavigation = async () => {
  await props.toteutussuunnitelmaStore.initNavigation();
};

const tallennaUusiTekstikappale = async (otsikko: any, valittuTekstikappale: any) => {
  const parentId = valittuTekstikappale?.id ? valittuTekstikappale.id : navigation.value!.value!.id!;

  await TekstikappaleStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.TEKSTIKAPPALE),
      tekstiKappale: {
        nimi: otsikko,
      },
    } as SisaltoviiteMatalaDto);
};

const lisaaUusiTutkinnonOsa = async (otsikko: any) => {
  const parent = props.toteutussuunnitelmaStore.naviFind('tutkinnonosat');
  const uusi = await SisaltoEditStore.addNewSisalto(
    props.toteutussuunnitelmaId,
    parent.id,
    props.koulutustoimijaId, {
      tyyppi: _.toLower(MatalaTyyppiEnum.TUTKINNONOSA),
      tekstiKappale: {
        nimi: otsikko,
      },
      tosa: {
        tyyppi: 'oma' as string,
        omatutkinnonosa: {},
      },
    });

  await updateNavigation();
  router.push({
    name: 'tutkinnonosa',
    params: {
      sisaltoviiteId: uusi.id as any,
    },
  });
};

const lisaaSuorituspolkuImpl = async (otsikko: any, osapolku: boolean) => {
  const parent = props.toteutussuunnitelmaStore.naviFind('suorituspolut');
  const uusi = await SisaltoEditStore.addNewSisalto(
    props.toteutussuunnitelmaId,
    parent.id,
    props.koulutustoimijaId, {
      tyyppi: osapolku
        ? _.toLower(MatalaTyyppiEnum.OSASUORITUSPOLKU)
        : _.toLower(MatalaTyyppiEnum.SUORITUSPOLKU),
      tekstiKappale: {
        nimi: otsikko,
      },
      tosa: {
        tyyppi: 'oma' as string,
        omatutkinnonosa: {},
      },
    });

  await updateNavigation();
  router.push({
    name: 'suorituspolku',
    params: {
      sisaltoviiteId: uusi.id as any,
    },
  });
};

const lisaaUusiSuorituspolku = (otsikko: any) => lisaaSuorituspolkuImpl(otsikko, false);
const lisaaUusiOsaSuorituspolku = (otsikko: any) => lisaaSuorituspolkuImpl(otsikko, true);

const tallennaUusiOpintokokonaisuus = async (otsikko: any, valittuOpintokokonaisuus: any) => {
  const parentId = valittuOpintokokonaisuus?.id ? valittuOpintokokonaisuus.id : navigation.value!.value!.id!;

  OpintokokonaisuusStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.OPINTOKOKONAISUUS),
      opintokokonaisuus: { tyyppi: 'oma' as string },
      tekstiKappale: {
        nimi: otsikko,
      },
    } as SisaltoviiteMatalaDto);
};

const tallennaUusiOsaamismerkkiKappale = async (otsikko: any, valittuParent: any) => {
  const parentId = valittuParent?.id ? valittuParent.id : navigation.value!.value!.id!;

  OsaamismerkkiKappaleStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.OSAAMISMERKKI),
      osaamismerkkiKappale: {},
    } as SisaltoviiteMatalaDto);
};

const palauta = async () => {
  await vaihdaOpetussunnitelmaTilaConfirm(
    { $t, $kaanna, route, router },
    {
      ...ArkistointiTekstit.palautus[opetussuunnitelmaTyyppi.value].meta,
      callback: async () => props.toteutussuunnitelmaStore.init(props.koulutustoimijaId, props.toteutussuunnitelmaId),
    },
  );
};

const asetaValmiiksi = async () => {
  await vaihdaOpetussunnitelmaTilaConfirm(
    { $t, $kaanna, route, router },
    {
      tila: 'VALMIS',
      title: 'aseta-pohja-valmiiksi',
      confirm: 'pohja-valmis-varmistus',
      okTitle: 'aseta-valmiiksi',
      callback: async () => props.toteutussuunnitelmaStore.init(props.koulutustoimijaId, props.toteutussuunnitelmaId),
    },
  );
};

const validoi = async () => {
  isValidating.value = true;
  await props.toteutussuunnitelmaStore.updateCurrent();
  isValidating.value = false;
};

const ratasClick = (clickFn: any, meta: any) => {
  clickFn(
    { $t, $kaanna, route, router },
    meta,
  );
};

// Watchers
watch(() => props.toteutussuunnitelmaId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue && !isInitializing.value) {
    fetch();
  }
}, { immediate: true });

watch(() => props.koulutustoimijaId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue && !isInitializing.value) {
    fetch();
  }
}, { immediate: true });

// Provides
provide('koulutustoimija', koulutustoimija);
provide('navigation', navigationValue);
provide('linkkiHandler', new LinkkiHandler());
provide('kuvaHandler', createKuvaHandler(new KuvaStore(_.toNumber(props.toteutussuunnitelmaId), props.koulutustoimijaId)));

// Head meta
useHead(() => {
  if (props.toteutussuunnitelmaStore
    && props.toteutussuunnitelmaStore.toteutussuunnitelma
    && props.toteutussuunnitelmaStore.toteutussuunnitelma.value
    && props.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi
    && !_.isEmpty($kaanna(props.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi))) {
    return {
      title: $kaanna(props.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi),
      titleTemplate: '%s - ' + $t('eperusteet-amosaa'),
    };
  }

  return {};
});
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables';

  :deep(.btn-sm) {
    font-size: 1rem;
    font-weight: 600;
    color: inherit;
  }

  :deep(.btn:focus) {
    box-shadow: unset;
  }

.portal-menu {
  height: 140px;

  h1 {
    margin: 0;
    padding: 0;
  }

  .asetukset {
    .hallinta {
      vertical-align: text-top;
    }

    :deep(.dropdown-item) {
      padding-left: 1rem;
      padding-right: 2rem;
    }

    svg:not(.hallinta) {
      width: 25px;
    }
  }

  .upper-left {
    @media (max-width: 991.98px) {
      padding: 0 30px;
    }
    @media (min-width: 992px) {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
    }
  }
}

.navigation {
  height: calc(100% - 160px);
}

.heading {
  margin-left: 28px;
  margin-right: 28px;
}

.menu-item {
  font-size: 14px;
  padding: 7px 5px 7px 10px;

  a {
    &.router-link-exact-active {
      font-weight: 600;
    }
  }
}

.menu-item:not(.bottom-menu-item) a{
  color: #000;
}

.navigation :deep(.ep-button .btn) {
  font-size: 14px;
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

.validation-text {
  font-size: 14px;
}

:deep(.structure-toggle) {
  margin-left: 35px;
  margin-bottom: 10px;
  margin-right: 35px;
}

.faded {
  color: $gray-lighten-1;
}

.icon {
  vertical-align: middle;
}

</style>

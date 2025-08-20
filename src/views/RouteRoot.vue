<template>
  <div
    class="home-container minfull"
    sticky-container
  >
    <EpTestiymparisto />

    <div class="view-container">
      <div
        id="scroll-anchor"
        ref="headerRef"
        class="header"
        :style="headerStyle"
        :class="toteutus"
      >
        <EpNavbar
          :class="toteutus"
          :kayttaja="kayttaja"
          :koulutustoimija="koulutustoimija"
          :koulutustoimijat="koulutustoimijatOikeuksilla"
          :root-navigation="rootNavigation"
          :sovellus-oikeudet="sovellusOikeudet"
          :logout-href="logoutHref"
          :sticky="routeStickyNavi"
        />
        <div id="headerExtension" />
      </div>
      <RouterView />
    </div>
    <ep-footer>
      <template #palaute>
        <EpPalauteLinkki yllapito-avain="amosaa-tyokalu-palaute-url" />
      </template>
    </ep-footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import Sticky from 'vue-sticky-directive';

import { KayttajaStore } from '@/stores/kayttaja';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import EpTestiymparisto from '@shared/components/EpTestiymparisto/EpTestiymparisto.vue';
import EpPalauteLinkki from '@shared/components/EpPalauteLinkki/EpPalauteLinkki.vue';

import { toteutusBanner } from '@shared/utils/bannerIcons';
import { FrontpageHeaderStyles, SovellusTitle } from '@/utils/toteutustypes';
import { Koulutustoimijat, KoulutustoimijaDto, baseURL } from '@shared/api/amosaa';
import { Toteutus } from '@shared/utils/perusteet';
import { $t } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  kayttajaStore: KayttajaStore;
  toteutus: Toteutus;
  koulutustoimijaId: number;
}>(), {
  toteutus: undefined,
});

const route = useRoute();

const headerRef = useTemplateRef('headerRef');

const koulutustoimija = ref<KoulutustoimijaDto | null>(null);

const routeStickyNavi = computed(() => {
  return route.name !== 'home';
});

const kayttaja = computed(() => {
  return props.kayttajaStore?.tiedot?.value || null;
});

const koulutustoimijat = computed(() => {
  return props.kayttajaStore?.koulutustoimijat?.value || null;
});

const koulutustoimijatOikeuksilla = computed(() => {
  return _.map(koulutustoimijat.value, kt => {
    return {
      ...kt,
      oikeus: props.kayttajaStore.organisaatioOikeudet.value[kt.id!],
    };
  });
});

const headerStyle = computed(() => {
  return {
    ...toteutusBanner(props.toteutus),
    ...FrontpageHeaderStyles[props.toteutus],
  };
});

const rootNavigation = computed(() => {
  return {
    name: 'rootToteutus',
    params: {
      toteutus: props.toteutus,
    },
  };
});

const sovellusOikeudet = computed(() => {
  return props.kayttajaStore?.sovellusOikeudet.value;
});

const logoutHref = computed(() => {
  return baseURL + '/api/logout';
});

// Meta information setup
const lang = computed(() => _.get(route, 'params.lang'));
const hasRouteName = computed(() => route && route.name);

useHead(computed(() => ({
  title: hasRouteName.value ? $t('route-' + route.name) : $t(SovellusTitle[props.toteutus!]),
  titleTemplate: hasRouteName.value ? '%s - ' + $t(SovellusTitle[props.toteutus!]) : null,
  htmlAttrs: {
    lang: lang.value || 'fi',
  },
  meta: [
    {
      name: 'description',
      content: $t('amosaa-tervetuloa-kuvaus'),
    },
    {
      name: 'keywords',
      content: $t('avainsanalista'),
    },
    {
      name: 'author',
      content: $t('opetushallitus'),
    },
    {
      property: 'og:site_name',
      content: $t('eperusteet'),
    },
    {
      property: 'og:description',
      content: $t('amosaa-tervetuloa-kuvaus'),
    },
    {
      property: 'og:locale',
      content: (lang.value || 'fi') + '_FI',
    },
  ],
})));

watch(() => props.koulutustoimijaId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    koulutustoimija.value = (await Koulutustoimijat.getKoulutustoimija(props.koulutustoimijaId)).data;
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
@import '@shared/styles/variables';

.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .header {
    color: white;
    background-position: 100% 0;
    background-repeat: none;
    background-size: cover;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }
  }
}

.header {
  &.kotoutumiskoulutus {
    :deep(.navbar .breadcrumb .breadcrumb-item),
    :deep(.navbar .breadcrumb .breadcrumb-item::before),
    :deep(.navbar .breadcrumb .breadcrumb-item a),
    :deep(.navbar #content-lang-selector a),
    :deep(.navbar #content-lang-selector a .kieli-valikko),
    :deep(.navbar #content-lang-selector a .kieli-valikko .kielivalitsin),
    :deep(.navbar .kayttaja #kayttaja-dropdown a),
    :deep(.navbar .kayttaja #kayttaja-dropdown a .kayttaja-valikko),
    :deep(.portal-menu h1 .asetukset .hallinta) {
      color: #000000;
    }
  }
}

.view-container {
  flex:1;
}

</style>

<template>
  <div class="home-container minfull">
    <div
      ref="header"
      class="header"
      :style="headerStyle"
    >
      <EpNavbar
        :kayttaja="kayttaja"
        :root-navigation="rootNavigation"
      />
    </div>
    <div>
      <div class="container my-5">
        <div v-if="koulutustoimijaId === null">
          <EpSpinner />
        </div>

        <div
          v-if="koulutustoimijaId === 0"
          class="px-3 px-md-0"
        >
          <h2>{{ $t('kayttajalla-ei-koulutustoimijaa') }}</h2>
          <div class="virhekuva">
            <img
              :src="virhekuva"
              :alt="$t('virhe-kuva-teksti')"
            >
          </div>

          <div class="d-flex flex-row-reverse">
            <div class="align-self-center">
              <a href="/virkailijan-tyopoyta">{{ $t('palaa-virkailijan-tyopyodalle') }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ep-footer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';

import { KayttajaStore } from '@/stores/kayttaja';
import { setItem, getItem } from '@shared/utils/localstorage';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import { getCasKayttajaKieli } from '@shared/api/common';
import { toteutusBanner } from '@shared/utils/bannerIcons';
import { localhostOrigin } from '@shared/utils/esikatselu';
import { Toteutus } from '@shared/utils/perusteet';
import { $t } from '@shared/utils/globals';
import { defaultToteutus } from '@/utils/toteutustypes';

const virhekuva = new URL('@assets/img/images/virhe.png', import.meta.url).href;

const props = defineProps<{
  kayttajaStore: KayttajaStore;
}>();

const route = useRoute();
const router = useRouter();
const header = useTemplateRef('header');

const koulutustoimijaId = ref<null | number>(null);

const toteutus = computed(() => {
  return _.has(route.params, 'toteutus') ? _.get(route.params, 'toteutus') : defaultToteutus();
});

const kayttaja = computed(() => {
  return props.kayttajaStore?.tiedot?.value || null;
});

const nimi = computed(() => {
  return props.kayttajaStore?.nimi?.value || null;
});

const headerStyle = computed(() => {
  return toteutusBanner(toteutus.value);
});

const rootNavigation = computed(() => {
  return {
    name: 'root',
    params: {
      toteutus: toteutus.value,
    },
  };
});

onMounted(async () => {
  // Ohjataan käyttäjän koulutustoimijan etusivulle
  const koulutustoimijat = props.kayttajaStore?.koulutustoimijat?.value || null;
  if (!_.isEmpty(koulutustoimijat)) {
    const koulutustoimija = getItem('koulutustoimija');
    let koulutustoimijaIdValue;
    if (koulutustoimija && _.includes(_.map(koulutustoimijat, 'id'), koulutustoimija)) {
      koulutustoimijaIdValue = _.toString(koulutustoimija);
    }
    else {
      const id = koulutustoimijat![0].id;
      koulutustoimijaIdValue = _.toString(id);
      setItem('koulutustoimija', id);
    }

    const toteutusValue = toteutus.value;
    const lang = props.kayttajaStore.casKayttaja.value?.lang || 'fi';
    koulutustoimijaId.value = parseInt(koulutustoimijaIdValue);

    router.push({
      path: `/${toteutusValue}/${lang}/koulutustoimija/${koulutustoimijaIdValue}`,
    });
  }
  else {
    koulutustoimijaId.value = 0;
  }
});
</script>

<style lang="scss" scoped>
@import '@shared/styles/variables';

.home-container {
  .header {
    color: white;
    background-position: 100% 0;
    background-repeat: none;
    background-repeat: no-repeat;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }
  }
}

</style>

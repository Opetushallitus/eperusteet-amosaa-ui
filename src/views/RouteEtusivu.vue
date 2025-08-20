<template>
  <div>
    <Teleport
      defer
      to="#headerExtension"
    >
      <div class="container">
        <div class="container-fluid">
          <div class="row no-gutters">
            <div class="col my-4 px-3 px-md-0">
              <h1>{{ $t(tervetuloaTeksti, { nimi }) }}</h1>
              <p>{{ $t(tervetuloaTekstiKuvaus) }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <component
          v-bind="tile.props"
          :is="tile.component"
          v-for="(tile, index) in tilesFiltered"
          :key="'tile'+index"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '@unhead/vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import TileToteutussuunnitelmat from './tiles/TileToteutussuunnitelmat.vue';
import TileKoulutustoimijanYhteinenOsuus from './tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from './tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from './tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileUkk from './tiles/TileUkk.vue';

import { KayttajaStore } from '@/stores/kayttaja';
import { KieliStore } from '@shared/stores/kieli';
import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import { EperusteetKoulutustyyppiRyhmat, Toteutus } from '@shared/utils/perusteet';
import { SovellusTitle } from '@/utils/toteutustypes';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  kayttajaStore: KayttajaStore;
  koulutustoimijaId: string;
  kieliStore: KieliStore;
  paivitettavatJaSiirrettavatTotsStore: PaivitettavatJaSiirrettavatTotsStore;
  toteutus: Toteutus;
  tervetuloaTeksti: string;
  tervetuloaTekstiKuvaus: string;
  tiles: any;
}>();

const tilesFiltered = computed(() => {
  return _.filter(props.tiles, tile => (!tile.oikeustarkastelu || props.kayttajaStore.hasOikeus(tile.oikeustarkastelu?.oikeus, tile.oikeustarkastelu?.kohde)));
});

const nimi = computed(() => {
  return props.kayttajaStore?.nimi?.value || null;
});

useHead(() => ({
  title: $t(SovellusTitle[props.toteutus]) as string,
  titleTemplate: null,
}));
</script>

<style lang="scss" scoped>
@import '@shared/styles/variables';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;
  min-height: 100vh;

  .header {
    color: white;
    background-color: $etusivu-header-background;
    background-image: url('@assets/img/banners/header.svg');
    background-position: 100% 0;
    background-repeat: no-repeat;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

    h1 {
      font-weight: 300;
    }
  }

  .tile-container {
    padding: 0;
    margin-top: 50px;
  }
}
</style>

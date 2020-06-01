<template>
  <div>
    <Portal to="headerExtension">
      <div class="container mt-5">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              <h1>{{ $t('amosaa-tervetuloa', { nimi }) }}</h1>
              <p>{{ $t('amosaa-tervetuloa-kuvaus') }}</p>
            </div>
          </div>
        </div>
      </div>
    </Portal>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <TileToteutussuunnitelmat :etusivu="etusivu" />
        <TileKoulutustoimijanYhteinenOsuus :etusivu="etusivu" />
        <TilePaivitettavatJaSiirrettavatToteutussuunnitelmat />
        <TileOrganisaationHallinta />
        <TileTiedotteet />
        <TileUkk />
        <TileTilastot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Prop } from 'vue-property-decorator';

import EpRoute from '@shared/mixins/EpRoute';
import { EtusivuDto } from '@shared/api/amosaa';
import { KayttajaStore } from '@/stores/kayttaja';
import TileToteutussuunnitelmat from './tiles/TileToteutussuunnitelmat.vue';
import TileKoulutustoimijanYhteinenOsuus from './tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from './tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from './tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileUkk from './tiles/TileUkk.vue';
import TileTilastot from './tiles/TileTilastot.vue';

@Component({
  components: {
    TileToteutussuunnitelmat,
    TileKoulutustoimijanYhteinenOsuus,
    TilePaivitettavatJaSiirrettavatToteutussuunnitelmat,
    TileOrganisaationHallinta,
    TileTiedotteet,
    TileUkk,
    TileTilastot,
  },
})
export default class RouteHome extends Mixins(EpRoute) {

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  //@Prop({ required: true })
  //private tiedotteetStore!: TiedotteetStore;

  async init() {
    await this.kayttajaStore.fetchEtusivu();
  }

  get nimi() {
    return this.kayttajaStore?.nimi?.value || null;
  }

  get etusivu() {
    return this.kayttajaStore?.etusivu?.value || null;
  }

}
</script>

<style lang="scss" scoped>
@import '~@shared/styles/variables';

.home-container {
  background-color: $etusivu-background;
  overflow: auto;
  min-height: 100vh;

  .header {
    color: white;
    background-color: $etusivu-header-background;
    background-image: url('~@assets/img/banners/header.svg');
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

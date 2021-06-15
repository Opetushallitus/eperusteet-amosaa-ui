<template>
  <div>
    <Portal to="headerExtension">
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
    </Portal>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <component v-for="(tile, index) in tiles" :key="'tile'+index"
          :is="tile.component"
          v-bind="tile.props"
          v-oikeustarkastelu="tile.oikeustarkastelu"
        />
      </div>
    </div>

  <EpFeedbackModal :palauteProvider="palautteetStore"/>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import EpRoute from '@shared/mixins/EpRoute';
import { EtusivuDto } from '@shared/api/amosaa';
import { KayttajaStore } from '@/stores/kayttaja';
import { Meta } from '@shared/utils/decorators';
import TileToteutussuunnitelmat from './tiles/TileToteutussuunnitelmat.vue';
import TileKoulutustoimijanYhteinenOsuus from './tiles/TileKoulutustoimijanYhteinenOsuus.vue';
import TilePaivitettavatJaSiirrettavatToteutussuunnitelmat from './tiles/TilePaivitettavatJaSiirrettavatToteutussuunnitelmat.vue';
import TileOrganisaationHallinta from './tiles/TileOrganisaationHallinta.vue';
import TileTiedotteet from './tiles/TileTiedotteet.vue';
import TileUkk from './tiles/TileUkk.vue';
import TileTilastot from './tiles/TileTilastot.vue';
import { KieliStore } from '@shared/stores/kieli';
import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';
import { SovellusTitle, Toteutus } from '@/utils/toteutustypes';
import EpFeedbackModal from '@shared/components/EpFeedback/EpFeedbackModal.vue';
import { PalautteetStore } from '@/stores/PalautteetStore';

@Component({
  components: {
    TileToteutussuunnitelmat,
    TileKoulutustoimijanYhteinenOsuus,
    TilePaivitettavatJaSiirrettavatToteutussuunnitelmat,
    TileOrganisaationHallinta,
    TileTiedotteet,
    TileUkk,
    TileTilastot,
    EpFeedbackModal,
  },
})
export default class RouteEtusivu extends Mixins(EpRoute) {
  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private kieliStore!: KieliStore;

  @Prop({ required: true })
  private paivitettavatJaSiirrettavatTotsStore!: PaivitettavatJaSiirrettavatTotsStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  private tervetuloaTeksti!: string;

  @Prop({ required: true })
  private tervetuloaTekstiKuvaus!: string;

  @Prop({ required: true })
  private tiles!: any;

  @Prop({ required: true })
  private palautteetStore!: PalautteetStore;

  @Meta
  getMetaInfo() {
    return {
      title: this.$t(SovellusTitle[this.toteutus]),
      titleTemplate: null,
    };
  }

  get nimi() {
    return this.kayttajaStore?.nimi?.value || null;
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

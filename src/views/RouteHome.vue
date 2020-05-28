<template>
  <div>
    <Portal to="headerExtension">
      <div class="container mt-5">
        <div class="container-fluid">
          <div class="row">
            <!-- <h1>{{ $t('tervetuloa', { nimi }) }}</h1> -->
            <p>{{ $t('tervetuloa-kuvaus') }}</p>
          </div>
        </div>
        <div class="row">
          <div class="col-md-4 mt-2 mb-5">
            <EpSearch v-model="rajain" />
          </div>
        </div>
      </div>
    </Portal>
    <div class="container tile-container">
      <div class="d-flex flex-row flex-wrap justify-content-center">
        <TileToteutussuunnitelmat />
        <!-- <TileTiedotteet :tiedotteetStore="tiedotteetStore" /> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import TileToteutussuunnitelmat from './tiles/TileToteutussuunnitelmat.vue';

@Component({
  components: {
    EpSearch,
    TileToteutussuunnitelmat,
  },
})
export default class RouteHome extends Vue {

  // @Prop({ required: true })
  // private tiedotteetStore!: TiedotteetStore;

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

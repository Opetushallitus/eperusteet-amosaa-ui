<template>
  <div class="home-container minfull">
    <div class="header" ref="header">
      <EpNavbar :kayttaja="kayttaja" />
      <PortalTarget ref="innerPortal" name="headerExtension" />
    </div>
    <RouterView />
    <ep-footer />
  </div>
</template>

<script lang="ts">
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import Sticky from 'vue-sticky-directive';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';

@Component({
  components: {
    EpNavbar,
    EpFooter,
  },
  directives: {
    Sticky,
  },
})
export default class RouteRoot extends Vue {
  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  get kayttaja() {
    return this.kayttajaStore?.tiedot?.value || null;
  }

  async mounted() {
    // await Kayttajat.init();
  }
}
</script>

<style lang="scss" scoped>
@import '~@shared/styles/variables';

.home-container {
  .header {
    color: white;
    background-image: url('../../public/img/banners/header_amosaa.svg');
    background-position: 100% 0;
    background-repeat: none;
    background-repeat: no-repeat;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }
  }
}

// .animate {
//   transition: max-height 0.2s ease-in-out;
// }

</style>

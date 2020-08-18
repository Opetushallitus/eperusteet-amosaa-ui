<template>
  <div class="home-container minfull">
    <div class="header" ref="header">
      <EpNavbar :kayttaja="kayttaja" :koulutustoimijat="koulutustoimijat" />
      <PortalTarget ref="innerPortal" name="headerExtension" />
    </div>
    <RouterView />
    <ep-footer />
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import Sticky from 'vue-sticky-directive';

import { KayttajaStore } from '@/stores/kayttaja';
import { Meta } from '@shared/utils/decorators';

import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
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
  
  private height = null as number | null;
  
  @Meta
  getMetaInfo() {
    const lang = _.get(this.$route, 'params.lang');
    const hasRouteName = this.$route && this.$route.name;
    return {
      title: hasRouteName ? this.$t('route-' + this.$route.name) : this.$t('eperusteet-amosaa'),
      titleTemplate: hasRouteName ? '%s - ' + this.$t('eperusteet-amosaa') : null,
      htmlAttrs: {
        lang: lang || 'fi',
      },
      meta: [
        {
          vmid: 'description',
          name: 'description',
          content: this.$t('amosaa-tervetuloa-kuvaus'),
        },
        {
          vmid: 'keywords',
          name: 'keywords',
          content: this.$t('avainsanalista'),
        },
        {
          vmid: 'author',
          name: 'author',
          content: this.$t('opetushallitus'),
        },
        {
          vmid: 'og:site_name',
          property: 'og:site_name',
          content: this.$t('eperusteet'),
        },
        {
          vmid: 'og:description',
          property: 'og:description',
          content: this.$t('amosaa-tervetuloa-kuvaus'),
        },
        {
          vmid: 'og:locale',
          property: 'og:locale',
          content: lang + '_FI',
        },
      ],
    };
  }

  get kayttaja() {
    return this.kayttajaStore?.tiedot?.value || null;
  }

  get koulutustoimijat() {
    return this.kayttajaStore?.koulutustoimijat?.value || null;
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

</style>

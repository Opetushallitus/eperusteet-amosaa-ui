<template>
  <div class="home-container minfull">
    <div class="header" ref="header" :style="headerStyle">
      <EpNavbar :kayttaja="kayttaja" :koulutustoimijat="koulutustoimijatOikeuksilla" :rootNavigation="rootNavigation" :sovellusOikeudet="sovellusOikeudet"/>
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
import { toteutusBanner } from '@shared/utils/bannerIcons';
import { SovellusTitle, Toteutus } from '@/utils/toteutustypes';
import { OIKEUS_KAANNOT } from '@shared/plugins/oikeustarkastelu';

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

  @Prop({ required: false, default: 'ammatillinen' })
  private toteutus!: Toteutus;

  private height = null as number | null;

  @Meta
  getMetaInfo() {
    const lang = _.get(this.$route, 'params.lang');
    const hasRouteName = this.$route && this.$route.name;
    return {
      title: hasRouteName ? this.$t('route-' + this.$route.name) : this.$t(SovellusTitle[this.toteutus]),
      titleTemplate: hasRouteName ? '%s - ' + this.$t(SovellusTitle[this.toteutus]) : null,
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

  get koulutustoimijatOikeuksilla() {
    return _.map(this.koulutustoimijat, kt => {
      return {
        ...kt,
        oikeus: this.kayttajaStore.organisaatioOikeudet.value[kt.id!],
      };
    });
  }

  get koulutustoimijat() {
    return this.kayttajaStore?.koulutustoimijat?.value || null;
  }

  get headerStyle() {
    return toteutusBanner(this.toteutus);
  }

  get rootNavigation() {
    return {
      name: 'root',
      params: {
        toteutus: this.toteutus,
      },
    };
  }

  get sovellusOikeudet() {
    return this.kayttajaStore?.sovellusOikeudet.value;
  }
}
</script>

<style lang="scss" scoped>
@import '~@shared/styles/variables';

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

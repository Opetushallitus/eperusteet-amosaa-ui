<template>
  <div class="home-container minfull">
    <div class="header" ref="header" :style="headerStyle" :class="toteutus" id="scroll-anchor">
      <EpNavbar
        :class="toteutus"
        :kayttaja="kayttaja"
        :koulutustoimija="koulutustoimija"
        :koulutustoimijat="koulutustoimijatOikeuksilla"
        :rootNavigation="rootNavigation"
        :sovellusOikeudet="sovellusOikeudet"/>
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
import { FrontpageHeaderStyles, SovellusTitle } from '@/utils/toteutustypes';
import { Koulutustoimijat, KoulutustoimijaDto } from '@shared/api/amosaa';
import { Toteutus } from '@shared/utils/perusteet';

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

  @Prop({ required: false })
  private toteutus!: Toteutus;

  private height = null as number | null;
  private koulutustoimija = null as KoulutustoimijaDto | null;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      this.koulutustoimija = (await Koulutustoimijat.getKoulutustoimija(this.koulutustoimijaId)).data;
    }
  }

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
    return {
      ...toteutusBanner(this.toteutus),
      ...FrontpageHeaderStyles[this.toteutus],
    };
  }

  get rootNavigation() {
    return {
      name: 'rootToteutus',
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

.header {
  &.kotoutumiskoulutus {
    ::v-deep .navbar .breadcrumb .breadcrumb-item,
    ::v-deep .navbar .breadcrumb .breadcrumb-item::before,
    ::v-deep .navbar .breadcrumb .breadcrumb-item a,
    ::v-deep .navbar #content-lang-selector a,
    ::v-deep .navbar #content-lang-selector a .kieli-valikko,
    ::v-deep .navbar #content-lang-selector a .kieli-valikko .kielivalitsin,
    ::v-deep .navbar .kayttaja #kayttaja-dropdown a,
    ::v-deep .navbar .kayttaja #kayttaja-dropdown a .kayttaja-valikko,
    ::v-deep .portal-menu h1 .asetukset .hallinta {
      color: #000000;
    }
  }
}

</style>

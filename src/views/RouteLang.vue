<template>
  <div class="home-container minfull">
    <div class="header" ref="header" :style="headerStyle">
      <EpNavbar :kayttaja="kayttaja" />
      <div class="container">
        <div class="container-fluid">
          <div class="row no-gutters">
            <div class="col my-4 px-3 px-md-0">
              <h1>{{ $t('amosaa-tervetuloa', { nimi }) }}</h1>
              <p>{{ $t('amosaa-tervetuloa-kuvaus') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
    <div class="container my-5">
      <div v-if="!koulutustoimijaId">
        <EpSpinner />
      </div>

      <div class="px-3 px-md-0" v-if="koulutustoimijaId === 0">
          <h2>{{ $t('kayttajalla-ei-koulutustoimijaa') }}</h2>
          <div class="virhekuva">
            <img :src="virhekuva" :alt="$t('virhe-kuva-teksti')">
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

<script lang="ts">
import _ from 'lodash';
import { Prop, Watch, Component, Vue } from 'vue-property-decorator';
import { KayttajaStore } from '@/stores/kayttaja';
import { setItem, getItem } from '@shared/utils/localstorage';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpNavbar from '@shared/components/EpNavbar/EpNavbar.vue';
import EpFooter from '@shared/components/EpFooter/EpFooter.vue';
import { getCasKayttajaKieli } from '@shared/api/common';
import { toteutusBanner } from '@shared/utils/bannerIcons';

const virhekuva = require('@assets/img/images/virhe.png');

@Component({
  components: {
    EpNavbar,
    EpFooter,
    EpSpinner,
  },
})
export default class RouteLang extends Vue {
  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  private koulutustoimijaId: null | number = null;

  async mounted() {
    // Ohjataan käyttäjän koulutustoimijan etusivulle
    const koulutustoimijat = this.kayttajaStore?.koulutustoimijat?.value || null;
    if (!_.isEmpty(koulutustoimijat)) {
      const koulutustoimija = getItem('koulutustoimija');
      let koulutustoimijaId;
      if (koulutustoimija && _.includes(_.map(koulutustoimijat, 'id'), koulutustoimija)) {
        koulutustoimijaId = _.toString(koulutustoimija);
      }
      else {
        const id = koulutustoimijat![0].id;
        koulutustoimijaId = _.toString(id);
        setItem('koulutustoimija', id);
      }

      const toteutus = this.toteutus;
      const lang = this.kayttajaStore.casKayttaja.value?.lang || 'fi';
      this.koulutustoimijaId = koulutustoimijaId;

      this.$router.push({
        path: `/${toteutus}/${lang}/koulutustoimija/${koulutustoimijaId}`,
      });
    }
    else {
      this.koulutustoimijaId = 0;
    }
  }

  get virhekuva() {
    return virhekuva;
  }

  get kayttaja() {
    return this.kayttajaStore?.tiedot?.value || null;
  }

  get nimi() {
    return this.kayttajaStore?.nimi?.value || null;
  }

  get toteutus() {
    return _.has(this.$route.params, 'toteutus') ? _.get(this.$route.params, 'toteutus') : '';
  }

  get headerStyle() {
    return toteutusBanner(this.toteutus);
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

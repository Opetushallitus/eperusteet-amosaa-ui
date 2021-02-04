<template>
  <ep-main-view :container="true" class="mt-5">
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tiedotteet') }}</h1>
        <ep-linkki
          :url="url"
          v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'pohja' }">
          <div class="d-flex">
            <span class="icon">
              <fas icon="plussa"></fas>
            </span>
            <span class="ml-2 link-text">{{ $t('lisaa-tiedote') }}</span>
          </div>
        </ep-linkki>
      </div>
    </template>

    <div class="row align-items-end mb-4">
      <div class="col-4">
        <ep-search v-model="nimiFilter" @input="nimiFilterChanged" :is-loading="isLoading" />
      </div>
    </div>

    <template v-if="tiedotteet">
      <ep-content-read-more
        v-for="tiedote in tiedotteet"
        :key="tiedote.id"
        :content="tiedote.sisalto">
        <template #preHeading>
          <p>{{ $sdt(tiedote.luotu) }}</p>
        </template>
        <template #heading>
          <h2 class="font-weight-normal">{{ $kaanna(tiedote.otsikko) }}</h2>
        </template>
      </ep-content-read-more>
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        @change="pageChanged"
        align="center" />
    </template>

  </ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Vue, Component, Watch } from 'vue-property-decorator';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContentReadMore from '@shared/components/EpContentReadMore/EpContentReadMore.vue';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';

import { KieliStore } from '@shared/stores/kieli';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { TiedoteJulkaisupaikka, Toteutus } from '@/utils/toteutustypes';

@Component({
  components: {
    EpMainView,
    EpSearch,
    EpTiedoteModal,
    EpSpinner,
    EpButton,
    EpContentReadMore,
    EpLinkki,
  },
})
export default class RouteTiedotteet extends Vue {
  private nimiFilter = '';
  private currentPage = 1;

  @Prop({ required: true })
  private tiedotteetStore!: TiedotteetStore;

  @Prop({ required: true })
  private kieliStore!: KieliStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Watch('sisaltoKieli', { immediate: true })
  async onSisaltoKieliChange(newValue: string, oldValue: string) {
    if (newValue && newValue !== oldValue) {
      this.currentPage = 1;
      this.tiedotteetStore.changeLang(newValue);
    }
  }

  async mounted() {
    this.tiedotteetStore.init({
      sivu: this.currentPage - 1,
      sivukoko: 10,
      tiedoteJulkaisuPaikka: [
        TiedoteJulkaisupaikka[this.toteutus],
      ],
    });
  }

  nimiFilterChanged(value) {
    this.nimiFilter = value;
    this.tiedotteetStore.changeNimiFilter(this.nimiFilter);
  }

  pageChanged(value) {
    this.currentPage = value;
    this.tiedotteetStore.changePage(this.currentPage - 1);
  }

  get sisaltoKieli() {
    return this.kieliStore.getSisaltoKieli.value || null;
  }

  get perPage() {
    return this.tiedotteetStore.options.value?.sivukoko;
  }

  get totalRows() {
    return this.tiedotteetStore.kokonaismaara.value;
  }

  get tiedotteet() {
    return this.tiedotteetStore.tiedotteet.value;
  }

  get isLoading() {
    return this.tiedotteetStore.isLoading.value;
  }

  get url() {
    return `/eperusteet-app/uusi/#/${this.sisaltoKieli}/tiedotteet`;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  width: 24px;
  border-radius: 100%;
  margin: 0;
  padding: 0;
  color: #fff;
  background-color: #3367E3;
}

.link-text {
  font-size: 1rem;
  color: $black;
}
</style>

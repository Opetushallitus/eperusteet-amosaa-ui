<template>
  <ep-main-view :container="true" class="mt-5">
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('tiedotteet') }}</h1>
        <ep-tiedote-modal ref="eptiedotemodal"
                          :tiedotteetStore="tiedotteetStore"
                          :editable="false"
                          :naytaJulkaisupaikka="false" />
      </div>
    </template>

    <div class="row align-items-end mb-4">
      <div class="col-4">
        <ep-search v-model="nimiFilter" @input="nimiFilterChanged" :is-loading="isLoading" />
      </div>
    </div>

    <template v-if="tiedotteet">
      <ep-tiedote v-for="tiedote in tiedotteet" :key="tiedote.id" :tiedote="tiedote" />
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
import EpTiedote from '@shared/components/EpTiedote/EpTiedote.vue';

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
    EpTiedote,
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
}
</script>

<style scoped lang="scss">

</style>

<template>
  <ep-tiedote-view :tiedotteet="tiedotteet">
    <template #search>
      <ep-search v-model="nimiFilter" @input="nimiFilterChanged" :is-loading="isLoading" />
    </template>
    <template #pagination>
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        @change="pageChanged"
        align="center" />
    </template>
  </ep-tiedote-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Vue, Component, Watch } from 'vue-property-decorator';

import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTiedoteView from '@shared/components/EpTiedoteView/EpTiedoteView.vue';

import { KieliStore } from '@shared/stores/kieli';
import { Debounced } from '@shared/utils/delay';

import { TiedotteetStore } from '@/stores/TiedotteetStore';

import { TiedoteJulkaisupaikka, Toteutus } from '@/utils/toteutustypes';

@Component({
  components: {
    EpSearch,
    EpTiedoteView,
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

  @Debounced(300)
  async nimiFilterChanged(value) {
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

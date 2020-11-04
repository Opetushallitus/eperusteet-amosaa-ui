<template>
  <ep-main-view>
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

    <div v-if="tiedotteet">
      <b-table responsive
              borderless
              striped
              fixed
              hover
              no-local-sorting
              @row-clicked="rowClicked"
              :items="tiedotteet"
              :fields="tableFields" />

      <b-pagination v-model="currentPage"
                    :total-rows="totalRows"
                    :per-page="perPage"
                    @change="pageChanged"
                    aria-controls="tiedotteet"
                    align="center" />
    </div>

  </ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

import { perustetila, perusteprojektitila } from '@shared/utils/perusteet';
import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { Perusteet, PerusteHakuDto, PerusteHakuInternalDto, TiedoteDto } from '@shared/api/eperusteet';
import { Kielet, KieliStore } from '@shared/stores/kieli';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import { julkaisupaikka, julkaisupaikkaSort } from '@shared/utils/tiedote';
import { TiedoteJulkaisupaikka, Toteutus } from '@/utils/toteutustypes';

@Component({
  components: {
    EpMainView,
    EpSearch,
    EpTiedoteModal,
    EpSpinner,
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

  rowClicked(item) {
    (this as any).$refs['eptiedotemodal'].muokkaa(item);
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

  get tableFields() {
    return [{
      key: 'luotu',
      label: this.$t('julkaistu'),
      sortable: false,
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$sdt(value);
      },
    }, {
      key: 'muokattu',
      label: this.$t('muokattu'),
      sortable: false,
      formatter: (value: any, key: any, item: any) => {
        if (item.luotu !== item.muokattu) {
          return (this as any).$sdt(value);
        }
        return '';
      },
    }, {
      key: 'otsikko',
      label: this.$t('tiedotteen-otsikko'),
      sortable: false,
      thStyle: { width: '65%' },
      formatter: (value: any, key: any, item: any) => {
        return (this as any).$kaanna(value);
      },
    }];
  }
}
</script>

<style scoped lang="scss">

</style>

<template>
  <div>
    <ep-button  @click="openModal" variant="outline-primary" icon="plussa" >
      {{ $t('tuo-tutkinnon-osa') }}
    </ep-button>
    <b-modal ref="tuotutkinnonosaModal"
            id="tuotutkinnonosa"
            size="lg"
            centered
            @close="close">
      <template v-slot:modal-title>
        {{ $t('tuo-tutkinnon-osa') }}
      </template>

      <div class="d-flex">
        <b-form-group class="w-50" :label="$t('tutkinnon-osan-nimi')">
          <ep-search v-model="query.nimi" :placeholder="$t('etsi-tutkinnon-osaa')"/>
        </b-form-group>

        <b-form-group class="ml-auto w-50" :label="$t('toteutussuunnitelma')">
          <ep-spinner v-if="!toteutussuunnitelmat" />
          <EpMultiSelect
            v-else
            v-model="toteutussuunnitelma"
            :placeholder="$t('valitse')"
            :is-editing="true"
            :options="toteutussuunnitelmat"
            :search-identity="kaannaNimi">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
          </EpMultiSelect>
        </b-form-group>
      </div>

      <ep-spinner v-if="!tutkinnonosat" />

      <div v-else-if="tutkinnonosat.length == 0">{{$t('ei-hakutuloksia')}}</div>

      <div v-else>
        <b-table
          responsive
          striped
          :items="tutkinnonosatWithSelected"
          no-local-sorting
          @sort-changed="sortingChanged"
          :sort-by.sync="sortBy"
          :sort-desc.sync="query.sortDesc"
          :fields="tutkinnonosatFields"
          no-sort-reset>
          <template v-slot:head(valitse-kaikki)="{ item }">
            <div class="selectable" @click="selectAllRows()">
              <fas v-if="valitseKaikki" icon="check-square" class="checked mr-2"/>
              <fas v-else :icon="['far', 'square']" class="checked mr-2"/>
            </div>
          </template>
          <template v-slot:cell(valitse-kaikki)="{ item }">
            <div class="selectable" @click="selectRow(item)">
              <fas v-if="item.selected" icon="check-square" class="checked mr-2"/>
              <fas v-else :icon="['far', 'square']" class="checked mr-2"/>
            </div>
          </template>
          <template v-slot:cell(tekstiKappale.nimi)="{ item }">
            <span>{{$kaanna(item.tekstiKappale.nimi)}}</span>
          </template>
        </b-table>
        <b-pagination v-if="totalRows > sisaltoSivuKoko"
            v-model="page"
            :total-rows="totalRows"
            :per-page="sisaltoSivuKoko"
            align="center"
            aria-controls="tuo-tutkinnon-osa"></b-pagination>
      </div>

      <div v-if="selectedTutkinnonosat.length > 0">
        <h3>{{$t('valittu')}} {{selectedTutkinnonosat.length}} {{$t('kpl')}}</h3>
        <b-table
          responsive
          striped
          :items="selectedTutkinnonosat"
          :fields="valittuFields">
        </b-table>
      </div>

      <div slot="modal-footer">
        <ep-button @click="close" variant="link">{{ $t('peruuta')}}</ep-button>
        <ep-button @click="save" :disabled="selectedTutkinnonosat.length == 0">{{ $t('tuo-valitut-sisallot')}}</ep-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins, Vue, Watch } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { SisaltoviiteLaajaDto } from '@shared/api/amosaa';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { Page } from '@shared/tyypit';

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpSearch,
    EpMultiSelect,
  },
})
export default class EpTutkinnonosaTuonti extends Vue {
  @Prop({ required: true })
  private tutkinnonosatTuontiStore!: TutkinnonosatTuontiStore;

  @Prop({ required: true })
  private updateNavigation!: Function;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private query = {} as any;
  private sivu = 0;
  private sisaltoSivuKoko = 10;
  private valitseKaikki = false;

  private selectedTutkinnonosat: SisaltoviiteLaajaDto[] = [];

  defaults() {
    this.query = {
      sivukoko: this.sisaltoSivuKoko,
      kieli: Kielet.getSisaltoKieli.value,
      nimi: '',
      tyyppi: 'TUTKINNONOSA',
      sortDesc: false,
      opetussuunnitelmaId: null,
      notInOpetussuunnitelmaId: this.toteutussuunnitelmaId,
    } as any;

    this.page = 0;
    this.selectedTutkinnonosat = [];
  }

  get toteutussuunnitelmat() {
    if (this.tutkinnonosatTuontiStore?.toteutussuunnitelmat.value) {
      return _.filter(this.tutkinnonosatTuontiStore?.toteutussuunnitelmat.value, tots => tots.id !== _.toNumber(this.toteutussuunnitelmaId));
    }

    return null;
  }

  kaannaNimi({ nimi }) {
    return this.$kaanna(nimi);
  }

  get tutkinnonosat() {
    return this.tutkinnonosatTuontiStore?.tutkinnonosatPage?.value?.data || null;
  }

  get tutkinnonosatWithSelected() {
    return _.map(this.tutkinnonosat, tutkinnonosa => {
      return {
        ...tutkinnonosa,
        selected: _.includes(_.map(this.selectedTutkinnonosat, 'id'), _.get(tutkinnonosa, 'id')),
      };
    });
  }

  get tutkinnonosatPage() {
    return this.tutkinnonosatTuontiStore?.tutkinnonosatPage.value || null;
  }

  async openModal() {
    (this as any).$bvModal.show('tuotutkinnonosa');
    this.defaults();
    await this.tutkinnonosatTuontiStore!.fetchOpetussuunnitelmat(this.koulutustoimijaId);
  }

  @Watch('query', { deep: true })
  async onQueryChange() {
    this.sivu = 0;
    await this.queryFetch();
  }

  @Watch('sivu')
  async onPageChange() {
    await this.queryFetch();
  }

  async queryFetch() {
    await this.tutkinnonosatTuontiStore!.fetch(this.toteutussuunnitelmaId, this.koulutustoimijaId, { ...this.query, sivu: this.sivu });
  }

  get totalRows() {
    return this.tutkinnonosatPage!.kokonaismäärä;
  }

  get page() {
    return this.tutkinnonosatPage!.sivu + 1;
  }

  set page(value: number) {
    this.sivu = value - 1;
  }

  async save() {
    await this.tutkinnonosatTuontiStore!.tuoSisaltoa(this.toteutussuunnitelmaId, this.koulutustoimijaId, _.map(this.selectedTutkinnonosat, 'id') as number[]);
    this.tutkinnonosatTuontiStore!.clear();
    this.$success(this.$t('tutkinnon-osat-tuotu-onnistuneesti') as string);
    this.close();
    this.updateNavigation();
  }

  close() {
    (this as any).$bvModal.hide('tuotutkinnonosa');
  }

  selectRow(item) {
    if (_.includes(_.map(this.selectedTutkinnonosat, 'id'), item.id)) {
      this.selectedTutkinnonosat = _.filter(this.selectedTutkinnonosat, tutkinnonosa => tutkinnonosa.id !== item.id);
    }
    else {
      this.selectedTutkinnonosat = [
        ...this.selectedTutkinnonosat,
        item,
      ];
    }
  }

  selectAllRows() {
    this.valitseKaikki = !this.valitseKaikki;
    if (this.valitseKaikki) {
      this.selectedTutkinnonosat = (this.tutkinnonosat || []) as SisaltoviiteLaajaDto[];
    }
    else {
      this.selectedTutkinnonosat = [];
    }
  }

  sortingChanged(sort) {
    this.query = {
      ...this.query,
      sortDesc: sort.sortDesc,
    };
  }

  get sortBy() {
    return 'tekstiKappale.nimi';
  }

  get tutkinnonosatFields() {
    return [
      {
        key: 'valitse-kaikki',
        sortable: false,
      },
      {
        key: 'tekstiKappale.nimi',
        label: this.$t('nimi'),
        sortable: true,
        thStyle: { width: '40%' },
      }, {
        key: 'opetussuunnitelma.voimaantulo',
        label: this.$t('voimaantulo'),
        sortable: false,
        formatter: (value: any, key: string, item: any) => {
          return value ? this.$sd(value) : '';
        },
      }, {
        key: 'laajuus',
        label: this.$t('laajuus'),
        sortable: false,
        formatter: (value: any, key: string, item: any) => {
          if (item.tosa.omatutkinnonosa && item.tosa.omatutkinnonosa.laajuus) {
            return item.tosa.omatutkinnonosa.laajuus;
          }

          if (item.perusteenTutkinnonosa) {
            return item.perusteenTutkinnonosa.laajuus;
          }

          return '';
        },
      }, {
        key: 'opetussuunnitelma.nimi',
        label: this.$t('opetussuunnitelma'),
        sortable: false,
        formatter: (value: any, key: string, item: any) => {
          return this.$kaanna(value);
        },
      }];
  }

  get valittuFields() {
    return [{
      key: 'tekstiKappale.nimi',
      label: this.$t('nimi'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }];
  }

  get toteutussuunnitelma() {
    return _.find(this.toteutussuunnitelmat, toteutussuunnitelma => toteutussuunnitelma.id === this.query.opetussuunnitelmaId);
  }

  set toteutussuunnitelma(toteutussuunnitelma) {
    if (toteutussuunnitelma) {
      this.query.opetussuunnitelmaId = toteutussuunnitelma.id;
    }
    else {
      this.query.opetussuunnitelmaId = null;
    }
  }
}

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep .filter {
    max-width: 100%;
  }

  .selectable {
    cursor: pointer;

    .checked {
      color: $paletti-blue;
    }
  }

</style>

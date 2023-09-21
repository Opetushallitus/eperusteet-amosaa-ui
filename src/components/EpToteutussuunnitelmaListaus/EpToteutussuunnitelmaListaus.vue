<template>
  <div>
    <div class="header">
      <slot name="header">
        <h1 class="bg-danger">slot: header</h1>
      </slot>
    </div>

    <div class="filters" v-if="items">
      <div class="row align-items-end">
        <div class="col-12 col-md-3 mt-2 mb-2 mr-2">
          <label>{{ $t(nameLabel) }}</label>
          <EpSearch v-model="query.nimi" :placeholder="$t('etsi')" :maxWidth="true"/>
        </div>
        <div class="col-12 col-lg-2 col-md-3 m-2" v-if="filtersInclude('tyyppi')">
          <label>{{ $t('tyyppi') }}</label>
          <EpMultiSelect v-model="tyyppi"
                    :enable-empty-option="true"
                    :placeholder="$t('kaikki')"
                    :is-editing="true"
                    :options="tyypit">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('amosaa-tyyppi-' + option) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('amosaa-tyyppi-' + option) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="col-12 col-lg-2 col-md-3 m-2" v-if="filtersInclude('voimassaolo')">
          <label>{{ $t('voimassaolo') }}</label>
          <EpMultiSelect v-model="voimassaolo"
                    :enable-empty-option="true"
                    :placeholder="$t('kaikki')"
                    :is-editing="true"
                    :options="vaihtoehdotVoimassaolo">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('ajoitus-' + option.toLowerCase()) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="col-12 col-lg-2 col-md-3 m-2" v-if="$isAdmin()">
          <label>{{$t('koulutustoimija')}}</label>
          <EpMultiSelect
            class="multiselect"
            v-model="valitutKoulutustoimijat"
            :enable-empty-option="true"
            :placeholder="$t('kaikki')"
            :is-editing="true"
            :options="koulutustoimijat"
            :multiple="true"
            track-by="id"
            :search-identity="koulutustoimijaSearchIdentity">
            <template slot="option" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>

            <template slot="selection" slot-scope="{ values }">
              <span v-if="values.length > 1">{{$t('valittu')}} {{values.length}} {{$t('koulutustoimijaa')}}</span>
              <span v-if="values.length === 1">{{$kaanna(values[0].nimi)}}</span>
            </template>
          </EpMultiSelect>
        </div>
        <div class="mb-3">
          <ep-spinner v-if="isLoading" />
        </div>
      </div>

      <div class="row align-items-end">
        <div class="col m-2" v-if="filtersInclude('tila')">
          <b-form-checkbox-group v-model="tila">
            <b-form-checkbox v-for="tila in vaihtoehdotTilat" :key="tila" :value="tila">
              {{ $t('tila-' + tila.toLowerCase()) }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </div>
      </div>

      <div v-if="items.data.length > 0">
        <b-table
          striped
          hover
          responsive
          :items="items.data"
          :fields="fields"
          no-local-sorting
          no-sort-reset
          @sort-changed="sortingChanged"
          :sort-by.sync="sort.sortBy"
          :sort-desc.sync="sort.sortDesc">
          <template v-slot:cell(nimi)="data">
            <router-link :to="{ name: 'toteutussuunnitelma', params: { koulutustoimijaId: data.item.koulutustoimija.id, toteutussuunnitelmaId: data.item.id } }">
              {{ $kaanna(data.item.nimi) }}
            </router-link>
          </template>
          <template v-slot:cell(tila)="data">
            <div class="d-flex">
              {{ $t(data.item.tila) }}
              <ep-button v-if="data.item.tila === 'poistettu'"
                         variant="link py-0"
                         icon="keyboard_return"
                         @click="restore(data.item)"
                         v-oikeustarkastelu="{ oikeus: 'tilanvaihto' }"
                         inherit-style>
                {{ $t('palauta') }}
              </ep-button>
            </div>
          </template>
        </b-table>
        <ep-pagination v-model="sivu"
                       :per-page="perPage"
                       :total-rows="total"/>
      </div>
      <div v-else class="m-2 alert alert-info">
        {{ $t('ei-hakutuloksia') }}
      </div>
    </div>
    <ep-spinner v-else />
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import * as _ from 'lodash';
import { BvTableFieldArray } from 'bootstrap-vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { IToteutussuunnitelmaProvider } from './types';
import { Toteutus } from '@shared/utils/perusteet';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import { KayttajaStore } from '@/stores/kayttaja';
import { Debounced } from '@shared/utils/delay';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpMainView,
    EpMultiSelect,
    EpPagination,
    EpSearch,
    EpSpinner,
    EpButton,
  },
})
export default class EpToteutussuunnitelmaListaus extends Vue {
  @Prop({ required: true })
  provider!: IToteutussuunnitelmaProvider;

  @Prop({ required: false })
  fieldKeys!: string[];

  @Prop({ required: false, default: 'nimi' })
  nameLabel!: string;

  @Prop({ required: false, default: () => ['tyyppi', 'voimassaolo', 'tila'] })
  filters!: ProjektiFilter[];

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private tyypit!: string[];

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  private tyyppi: string | null = 'ops';
  private voimassaolo: string | null = null;
  private tila: string[] | null = ['luonnos', 'julkaistu'];
  private isLoading = false;
  private sort = {};

  private query = {
    sivu: 0,
    sivukoko: 10,
    voimassaolo: true,
    siirtyma: true,
    tuleva: true,
    poistunut: true,
    tila: this.tila,
    tyyppi: ['ops'],
    nimi: '',
    jarjestysOrder: false,
    jarjestysTapa: 'nimi',
    koulutustoimijat: [],
  } as any;

  async mounted() {
    await this.fetch(_.toNumber(this.$route.params.koulutustoimijaId), this.query);
  }

  @Watch('koulutustoimijaId', { deep: true, immediate: true })
  async onKoulutustyyppiIdChange(koulutustoimijaId: string | number) {
    await this.fetch(koulutustoimijaId, this.query);
  }

  @Debounced(500)
  @Watch('query', { deep: true, immediate: true })
  async onQueryChange(query: any) {
    await this.fetch(_.toNumber(this.$route.params.koulutustoimijaId), query);
  }

  async fetch(koulutustoimijaId, query) {
    if (!this.isLoading) {
      this.isLoading = true;
      try {
        await this.provider.updateQuery(
          _.toNumber(koulutustoimijaId),
          this.$route.params.toteutus as Toteutus,
          query,
        );
      }
      finally {
        this.isLoading = false;
      }
    }
  }

  @Watch('voimassaolo')
  onChangeVoimassaolo(tila: string) {
    const defaults = {
      ...this.query,
      voimassaolo: false,
      siirtyma: false,
      tuleva: false,
      poistunut: false,
    };

    switch (tila) {
    case 'tuleva':
      this.query = { ...defaults, tuleva: true };
      break;
    case 'voimassaolo':
      this.query = { ...defaults, voimassaolo: true };
      break;
    case 'poistunut':
      this.query = { ...defaults, poistunut: true };
      break;
    default:
      this.query = {
        ...defaults,
        voimassaolo: true,
        tuleva: true,
        poistunut: true,
      };
      break;
    }
  }

  @Watch('tila')
  onTilaChange(tila: string) {
    this.query = {
      ...this.query,
      tila: tila
        ? [tila]
        : ['luonnos', 'julkaistu', 'poistettu'],
    };
  }

  @Watch('tyyppi')
  onTyyppiChange(tyyppi: string) {
    this.query = {
      ...this.query,
      tyyppi: tyyppi ? [tyyppi] : ['ops', 'yleinen'],
    };
  }

  sortingChanged(sort) {
    this.sort = sort;
    this.query = {
      ...this.query,
      sivu: 0,
      jarjestys: sort.sortBy,
      jarjestysNouseva: !sort.sortDesc,
    };
  }

  async restore(item) {
    await vaihdaOpetussunnitelmaTilaConfirm(
      this,
      {
        title: 'palauta-toteutussuunnitelma',
        confirm: 'palauta-toteutussuunnitelma-vahvistus',
        tila: 'LUONNOS',
        toteutussuunnitelmaId: item.id,
      }
    );
    await this.onQueryChange(this.query);
  }

  get vaihtoehdotVoimassaolo() {
    return [
      'kaikki',
      'tuleva',
      'voimassaolo',
      'poistunut',
    ];
  }

  get vaihtoehdotTilat() {
    return ['luonnos', 'julkaistu', 'poistettu'];
  }

  get sivu() {
    return this.query?.sivu! + 1;
  }

  set sivu(value: number) {
    this.query.sivu = value - 1;
  }

  get perPage() {
    return this.items?.sivukoko || 10;
  }

  get total() {
    return this.items?.kokonaismäärä || 0;
  }

  get items() {
    return this.provider.opetussuunnitelmat.value;
  }

  get fields() {
    return _.filter(this.initialFields, (field: any) => !this.fieldKeys || _.includes(this.fieldKeys, field.key));
  }

  get initialFields(): BvTableFieldArray {
    const dateFormatter = (value: Date) => {
      return value
        ? this.$sd(value)
        : '-';
    };

    return [{
      key: 'nimi',
      label: this.$t('nimi') as string,
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'tyyppi',
      sortable: true,
      label: this.$t('tyyppi') as string,
      formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
        return this.$t('amosaa-tyyppi-' + value);
      },
    }, {
      key: 'tila',
      sortable: true,
      label: this.$t('tila') as string,
      formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
        return this.$t('tila-' + item!.tila);
      },
    }, {
      key: 'koulutuskoodi',
      sortable: false,
      label: this.$t('koulutuskoodi') as string,
      thStyle: { borderBottom: '0px' },
      formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
        if (item.peruste && _.size(item.peruste.koulutukset) > 0) {
          return _.reduce(_.map(item!.peruste!.koulutukset, 'koulutuskoodiArvo'), (tulos, koulutus) => (tulos + (tulos !== '' ? ', ' : '') + koulutus), '');
        }
      },
    }, {
      key: 'luotu',
      sortable: true,
      label: this.$t('luotu') as string,
      formatter: dateFormatter,
    }, {
      key: 'muokattu',
      sortable: true,
      label: this.$t('muokattu') as string,
      formatter: dateFormatter,
    }, {
      key: 'voimaantulo',
      sortable: true,
      label: this.$t('voimassaolo-alkaa') as string,
      formatter: dateFormatter,
    }, {
      key: 'paatospaivamaara',
      sortable: true,
      label: this.$t('paatospaivamaara') as string,
      formatter: dateFormatter,
    }];
  }

  filtersInclude(filter: any) {
    return !this.filters || _.includes(this.filters, filter);
  }

  get koulutustoimijat() {
    return _.sortBy(this.kayttajaStore.koulutustoimijat.value, kt => this.$kaanna(kt.nimi!));
  }

  get valitutKoulutustoimijat() {
    return _.filter(this.koulutustoimijat, (kt: any) => _.includes(this.query.koulutustoimijat, kt.id));
  }

  set valitutKoulutustoimijat(value: any[]) {
    if (_.size(value) === 0) {
      this.query.koulutustoimijat = [];
    }
    else {
      this.query.koulutustoimijat = _.map(value, 'id');
    }
  }

  koulutustoimijaSearchIdentity(obj: any) {
    return _.toLower(this.$kaanna(obj.nimi));
  }
}
</script>

<style lang="scss" scoped>

.upper {
  margin-bottom: 3rem;
}

.lower {
  margin-top: 4rem;
}

.teksti {
  font-size: 22px;
  font-weight: 400;
}

.ikoni {
  font-size: 38px;
  font-weight: 100;
}

.card-wrapper {
  margin: 0 20px 20px 0;
}

.small-text {
  color: #1d346b;
}

</style>

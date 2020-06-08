<template>
  <div>
    <div class="header">
      <slot name="header">
        <h1 class="bg-danger">slot: header</h1>
      </slot>
    </div>

    <div class="filters" v-if="items">
      <div class="d-lg-flex align-items-end">
        <div class="mt-2 mb-2 mr-2 flex-fill">
          <EpSearch v-model="query.nimi" :placeholder="$t('etsi-toteutussuunnitelmaa-tai-jaettua-osaa')"/>
        </div>
        <div class="m-2 flex-fill" v-if="filtersInclude('tyyppi')">
          <label>{{ $t('tyyppi') }}</label>
          <EpMultiSelect v-model="tyyppi"
                    :enable-empty-option="true"
                    :placeholder="$t('kaikki')"
                    :is-editing="true"
                    :options="vaihtoehdotTyypit">
            <template slot="singleLabel" slot-scope="{ option }">
              {{ $t('amosaa-tyyppi-' + option) }}
            </template>
            <template slot="option" slot-scope="{ option }">
              {{ $t('amosaa-tyyppi-' + option) }}
            </template>
          </EpMultiSelect>
        </div>
        <div class="m-2 flex-fill" v-if="filtersInclude('voimassaolo')">
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
        <div class="mb-3">
          <ep-spinner v-if="isLoading" />
        </div>
      </div>

      <div class="d-lg-flex align-items-end">
        <div class="m-2" v-if="filtersInclude('tila')">
          <b-form-checkbox-group v-model="tila">
            <b-form-checkbox v-for="tila in vaihtoehdotTilat" :key="tila" :value="tila">
              {{ $t('tila-' + tila.toLowerCase()) }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </div>
      </div>

      <div v-if="items.data.length > 0">
        <b-table striped hover responsive :items="items.data" :fields="fields">
          <template v-slot:cell(nimi)="data">
            <router-link :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: data.item.id } }">
              {{ $kaanna(data.item.nimi) }}
            </router-link>
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
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Page } from '@shared/tyypit';
import { BvTableFieldArray } from 'bootstrap-vue';
import { IToteutussuunnitelmaProvider } from './types';
import * as _ from 'lodash';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpMultiSelect,
    EpPagination,
    EpSearch,
    EpSpinner,
  },
})
export default class EpToteutussuunnitelmaListaus extends Vue {
  @Prop({ required: true })
  provider!: IToteutussuunnitelmaProvider;

  @Prop({ required: false })
  fieldKeys!: string[];

  @Prop({ required: false, default: () => ['tyyppi', 'voimassaolo', 'tila'] })
  filters!: ProjektiFilter[];

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  private tyyppi: string | null = null;
  private voimassaolo: string | null = null;
  private tila: string[] | null = ['luonnos', 'julkaistu'];
  private isLoading = false;

  private query = {
    sivu: 0,
    sivukoko: 10,
    voimassaolo: true,
    siirtyma: true,
    tuleva: true,
    poistunut: true,
    tila: this.tila,
    tyyppi: ['pohja', 'ops', 'yleinen', 'yhteinen'],
    nimi: '',
    jarjestysOrder: false,
    jarjestysTapa: 'nimi',
  } as any;

  async mounted() {
    this.provider.updateQuery(_.toNumber(this.$route.params.koulutustoimijaId), this.query);
  }

  @Watch('koulutustoimijaId', { deep: true, immediate: true })
  async onKoulutustyyppiIdChange(koulutustoimijaId: string | number) {
    this.isLoading = true;
    try {
      this.query.sivu = 0;
      await this.provider.updateQuery(_.toNumber(koulutustoimijaId), this.query);
    }
    finally {
      this.isLoading = false;
    }
  }

  @Watch('query', { deep: true, immediate: true })
  async onQueryChange(query: any) {
    this.isLoading = true;
    try {
      await this.provider.updateQuery(
        _.toNumber(this.$route.params.koulutustoimijaId),
        {
          ...query,
        });
    }
    finally {
      this.isLoading = false;
    }
  }

  @Watch('voimassaolo')
  onChangeVoimassaolo(tila: string) {
    const defaults = {
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
    this.query.tyyppi = [tyyppi];
  }

  get vaihtoehdotTyypit() {
    return ['pohja', 'ops', 'yleinen', 'yhteinen'];
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
    return this.items?.sivu! + 1;
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
    }, {
      key: 'tila',
      sortable: true,
      label: this.$t('tila') as string,
      formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
        return this.$t('tila-' + item!.tila);
      },
    }, {
      key: 'koulutuskoodi',
      sortable: true,
      label: this.$t('koulutuskoodi') as string,
      formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
        if (item.peruste && _.size(item.peruste.koulutukset) > 0) {
          return _.head(item!.peruste!.koulutukset)!['koulutuskoodiArvo'];
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
      label: this.$t('voimassaolo-loppuu') as string,
      formatter: dateFormatter,
    }];
  }

  filtersInclude(filter: any) {
    return !this.filters || _.includes(this.filters, filter);
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

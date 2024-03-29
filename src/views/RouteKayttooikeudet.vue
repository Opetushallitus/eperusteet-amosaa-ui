<template>
  <div class="kayttooikeudet">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">{{$t('ystava-organisaatioiden-kayttooikeudet')}}</h2>
    </div>

    <ep-spinner v-if="!kayttajat" />

    <div class="ml-3 mt-2 mr-5" v-else>

      <div class="d-flex">
        <b-form-group :label="$t('henkilon-nimi')">
          <ep-search v-model="query" />
        </b-form-group>

        <b-form-group :label="$t('kayttooikeus')">
          <ep-select class="oikeusSelect" :isEditing="true" v-model="oikeusrajaus" :items="oikeusRajausVaihtoehdot" :enableEmptyOption="false">
            <template slot-scope="{ item }">
              {{$t('oikeus-'+item.text)}}
            </template>
          </ep-select>
        </b-form-group>
      </div>

      <b-table
        striped
        responsive
        :items="kayttajatFilled"
        :fields="fields"
        :per-page="sivukoko"
        :current-page="sivu"
        :tbody-tr-class="rowClass">

        <template v-slot:cell(nimi)="{value, item}">
          <ep-button variant="link" :href="'/henkilo-ui/admin/'+item.oid">
            {{value}}
          </ep-button>
        </template>

        <template v-slot:cell(kayttooikeus)="{ item }">
          <ep-select class="oikeusSelect" v-if="!item.self && hallintaOikeus" :items="oikeusVaihtoehdot" v-model="item.oikeus" :isEditing="true" :enableEmptyOption="false" @input="updateOikeus(item.id, item.oikeus.value)">
            <template slot-scope="{ item }">
              {{$t('oikeus-'+item.text)}}
            </template>
          </ep-select>

          <div v-else-if="item.self">{{$t('oikeus-' + currentKoulutustoimijaOikeus)}}</div>
          <div v-else>{{$t('oikeus-'+item.oikeus)}}</div>
        </template>

      </b-table>

      <b-pagination
          v-model="sivu"
          :per-page="sivukoko"
          :total-rows="kayttajat.length"
          align="center"
        />
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { KayttoOikeudetStore } from '@/stores/KayttoOikeudetStore';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { KayttajaStore } from '@/stores/kayttaja';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { createLogger } from '@shared/utils/logger';

interface KayttoOikeusText {
  value: string;
  text: string;
}

@Component({
  components: {
    EpButton,
    EpSelect,
    EpSpinner,
    EpSearch,
  },
})
export default class RouteKayttooikeudet extends Vue {
  @Prop({ required: true })
  private kayttoOikeudetStore!: KayttoOikeudetStore;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  private sivukoko = 10;
  private sivu = 1;
  private query = '';
  private oikeusrajaus: KayttoOikeusText = { value: 'kaikki', text: 'kaikki' };

  private logger = createLogger('RouteKayttooikeudet');

  get kayttajat() {
    return this.kayttoOikeudetStore.kayttajat.value;
  }

  get kayttajatFilled() {
    if (this.kayttoOikeudetStore.kayttajaOikeudet.value) {
      return _.chain(this.kayttajat)
        .map(kayttaja => {
          return {
            ...kayttaja,
            oikeus: kayttaja.id && this.oikeudetById[kayttaja.id]
              ? _.find(this.oikeusVaihtoehdot, { value: _.get(this.oldOikeusToNewConvert, (_.get(this.oikeudetById[kayttaja.id], 'oikeus') || 'estetty')) })
              : _.find(this.oikeusVaihtoehdot, { value: 'estetty' }),
            self: kayttaja.oid === _.toString(this.kayttajaStore.tiedot.value.oid),
          };
        })
        .filter(kayttaja => Kielet.search(this.query, parsiEsitysnimi(kayttaja)))
        .filter(kayttaja => this.oikeusrajaus.value === 'kaikki' || kayttaja.oikeus?.value === this.oikeusrajaus.value)
        .value();
    }
  }

  get oldOikeusToNewConvert() {
    return {
      'estetty': 'estetty',
      'luku': 'luku',
      'muokkaus': 'luku',
      'luonti': 'luku',
      'poisto': 'poisto',
      'hallinta': 'poisto',
    };
  }

  get oikeudetById() {
    return _.keyBy(this.kayttoOikeudetStore.kayttajaOikeudet.value, '_kayttaja');
  }

  get ktYstavatByOid() {
    return _.keyBy(this.kayttoOikeudetStore.ktYstavat.value, 'organisaatio');
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('henkilon-nimi') as string,
      sortable: false,
      tdClass: 'align-middle',
      formatter: (value: any, key: string, item: any) => {
        return parsiEsitysnimi(item);
      },
    }, {
      key: 'organisaatioOid',
      label: this.$t('organisaatio') as string,
      sortable: false,
      tdClass: 'align-middle',
      formatter: (value: any, key: string, item: any) => {
        if (this.ktYstavatByOid[value]) {
          return this.$kaanna(this.ktYstavatByOid[value].nimi!);
        }

        return '';
      },
    }, {
      key: 'kayttooikeus',
      sortable: false,
      tdClass: 'align-middle',
      label: this.$t('kayttooikeus') as string,
    }];
  }

  get oikeusRajausVaihtoehdot(): KayttoOikeusText[] {
    return [{ value: 'kaikki', text: 'kaikki' }, ...this.oikeusVaihtoehdot];
  }

  get oikeusVaihtoehdot(): KayttoOikeusText[] {
    return [
      { value: 'estetty', text: 'estetty' },
      { value: 'luku', text: 'luku' },
      { value: 'poisto', text: 'muokkaus' },
    ];
  }

  async updateOikeus(id, oikeus) {
    try {
      await this.kayttoOikeudetStore.updateOikeus(id, { oikeus });
      this.$success(this.$t('kayttooikeus-paivitetty') as string);
    }
    catch (e) {
      this.logger.error(e);
      this.$fail(this.$t('kayttooikeus-paivitys-virhe') as string);
    }
  }

  rowClass(item, type) {
    if (item.self) {
      return 'self';
    }

    return '';
  }

  get hallintaOikeus() {
    return this.$hasOikeus('hallinta', 'koulutustoimija');
  }

  get kayttajaId() {
    return _.get(this.kayttajaStore.tiedot.value, 'id');
  }

  get currentKoulutustoimijaOikeus() {
    return _.get(_.find(this.oikeusVaihtoehdot, { value: _.get(this.oldOikeusToNewConvert, (_.get(this.oikeudetById[this.kayttajaId], 'oikeus') || 'estetty')) }), 'text');
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

  .kayttooikeudet {
    margin-top: 4px;

    .ylapaneeli {
      border-bottom: 1px solid #eee;
      font-weight: 600;
      padding: 5px 15px 5px 15px;
      height: 50px;

      .otsikko {
        margin-bottom: 0;
      }
    }

    .oikeusSelect {
      width: 200px;
    }

  }

  ::v-deep table tr.self {
    background-color: $green-lighten-4;
  }

</style>

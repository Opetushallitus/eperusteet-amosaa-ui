<template>
<div>
  <div v-b-modal.sisallontuonti>
    <span @click="openModal">
      {{$t(kaannokset['tuoBtn'])}}
    </span>
  </div>
  <b-modal ref="sisallontuontiModal"
           id="sisallontuonti"
           size="lg"
           centered
           @close="clear">
    <template v-slot:modal-title>
      {{ $t('tuo-sisaltoa') }}
    </template>

    <div v-if="!toteutussuunnitelma">
      <p>{{$t(kaannokset['topicNoOps'])}}</p>
      <ep-search v-model="query.nimi" :placeholder="$t(kaannokset['searchPlaceholder'])"/>
      <ep-spinner v-if="!opetussuunnitelmatpage" />

      <div v-else>
        <b-table responsive striped :items="opetussuunnitelmatFiltered" :fields="opetussuunnitelmaFields">
          <template v-slot:cell(nimi)="data">
            <ep-button variant="link" @click="valitseToteutussuunnitelma(data.item)">
              {{ $kaanna(data.item.nimi) }}
            </ep-button>
          </template>
        </b-table>

        <b-pagination
          v-model="page"
          :total-rows="totalRows"
          :per-page="query.sivukoko"
          align="center"
          aria-controls="tuo-sisaltoa-modaali"></b-pagination>
      </div>
    </div>

    <div v-else>
      <p>{{$t(kaannokset['topicOps'])}} {{$kaanna(toteutussuunnitelma.nimi)}}</p>
      <ep-spinner v-if="!sisaltoviitteet" />

      <div v-else>
        <div v-for="(sisaltoTaulu, index) in sisaltoTaulut" :key="'sisaltotaulu'+index">
          <b-table
            responsive
            striped
            :items="sisaltoTaulu.items"
            :fields="sisaltoTaulu.fields"
            :per-page="sisaltoSivuKoko"
            :current-page="sisaltoPages[sisaltoTaulu.page]"
            >
            <template v-slot:cell(nimi)="{ item }">
              <div class="selectable" @click="selectRow(item.id)">
                <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
                <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
                <span>{{$kaanna(item.tekstiKappale.nimi)}}</span>
              </div>
            </template>
          </b-table>
          <b-pagination v-if="sisaltoTaulu.items.length > sisaltoSivuKoko"
              v-model="sisaltoPages[sisaltoTaulu.page]"
              :total-rows="sisaltoTaulu.items.length"
              :per-page="sisaltoSivuKoko"
              align="center"
              aria-controls="tuo-sisaltoa-tekstikappaleet"></b-pagination>
        </div>
      </div>

    </div>

    <div slot="modal-footer">
      <ep-button @click="back" variant="link" v-if="toteutussuunnitelma">{{ $t('edellinen')}}</ep-button>
      <ep-button @click="clear" variant="link">{{ $t('peruuta')}}</ep-button>
      <ep-button @click="save" v-if="toteutussuunnitelma">{{ $t('tuo-valitut-sisallot')}}</ep-button>
    </div>
  </b-modal>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue, Watch, InjectReactive } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { SisaltotuontiStore } from '@/stores/SisaltotuontiStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

const kaannokset = {
  default: {
    tuoBtn: 'tuo-sisaltoa-muista-toteutussuunnitelmista',
    topicNoOps: 'valitse-ensin-mista-suunnitelmasta-haluat-tuoda-sisaltoa',
    topicOps: 'valitse-mitka-sisallot-haluat-tuoda-toteutussuunnitelmasta',
    searchPlaceholder: 'etsi-toteutussuunnitelmaa-tai-jaettua-osaa-tai-yhteista-osaa',

  },
  organisaatioRyhma: {
    tuoBtn: 'tuo-sisaltoa-toisesta-raportista',
    topicNoOps: 'valitse-ensin-mista-tunnistamisrapostista-haluat-tuoda-sisaltoa',
    topicOps: 'valitse-mitka-sisallot-haluat-tuoda-tunnistamisraportista',
    searchPlaceholder: 'etsi',
  },
};

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpSearch,
    EpMaterialIcon,
  },
})
export default class EpSisallonTuonti extends Vue {
  @Prop({ required: true })
  private opetussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private updateNavigation!: Function;

  @InjectReactive('koulutustoimija')
  private readonly koulutustoimija!: any;

  private query = {} as any;
  private sisaltoPages = {};
  private sisaltoSivuKoko = 5;

  private sisaltotuontiStore: SisaltotuontiStore | null = null;
  private toteutussuunnitelma: OpetussuunnitelmaDto | null = null;
  private valitutSisaltoviitteet: number[] = [];

  mounted() {
    this.sisaltotuontiStore = new SisaltotuontiStore(this.opetussuunnitelmaId, this.koulutustoimijaId);
  }

  defaults() {
    this.query = {
      sivu: 0,
      sivukoko: 10,
      kieli: Kielet.getSisaltoKieli.value,
      tila: ['luonnos', 'valmis', 'julkaistu'],
      nimi: '',
    } as any;

    this.sisaltoPages = {
      tekstikappaleet: 1,
      suorituspolut: 1,
      tutkinnonosat: 1,
    };
  }

  get opetussuunnitelmat() {
    if (this.sisaltotuontiStore && this.sisaltotuontiStore.opetussuunnitelmat.value) {
      return (this.sisaltotuontiStore.opetussuunnitelmat.value as any).data;
    }
  }

  get opetussuunnitelmatFiltered() {
    return _.filter(this.opetussuunnitelmat, ops => ops.id !== this.opetussuunnitelmaId);
  }

  get sisaltoviitteet() {
    if (this.sisaltotuontiStore) {
      return this.sisaltotuontiStore.sisaltoviitteet.value;
    }
  }

  get tekstikappaleet() {
    if (this.sisaltotuontiStore) {
      return this.sisaltotuontiStore.tekstikappaleet.value;
    }
  }

  get suorituspolut() {
    if (this.sisaltotuontiStore) {
      return this.sisaltotuontiStore.suorituspolut.value;
    }
  }

  get tutkinnonosat() {
    if (this.sisaltotuontiStore) {
      return this.sisaltotuontiStore.tutkinnonosat.value;
    }
  }

  get opetussuunnitelmatpage() {
    if (this.sisaltotuontiStore) {
      return this.sisaltotuontiStore.opetussuunnitelmat.value;
    }
  }

  async openModal() {
    (this as any).$bvModal.show('sisallontuonti');
    this.defaults();
    await this.sisaltotuontiStore!.fetch(this.query);
  }

  @Watch('query', { deep: true })
  async onQueryChange(query: any) {
    await this.sisaltotuontiStore!.fetch(this.query);
  }

  get totalRows() {
    return _.get(this.opetussuunnitelmatpage, 'kokonaismäärä');
  }

  get page() {
    return _.get(this.opetussuunnitelmatpage as any, 'sivu') + 1;
  }

  set page(value: number) {
    this.query.sivu = value - 1;
  }

  get okDisabled() {
    return true;
  }

  async save() {
    await this.sisaltotuontiStore!.tuoSisaltoa(this.valitutSisaltoviitteet);
    this.sisaltotuontiStore!.clear();
    this.clear();
    this.$success(this.$t('sisallot-tuotu-onnistuneesti') as string);
    await this.updateNavigation();
  }

  back() {
    this.toteutussuunnitelma = null;
    this.valitutSisaltoviitteet = [];
  }

  clear() {
    this.toteutussuunnitelma = null;
    this.valitutSisaltoviitteet = [];
    this.sisaltotuontiStore!.clear();
    (this as any).$bvModal.hide('sisallontuonti');
  }

  get opetussuunnitelmaFields() {
    let tableFields: any[] = [{
      key: 'nimi',
      label: this.$t('nimi') as string,
      sortable: false,
    }];

    if (!this.koulutustoimija?.organisaatioRyhma) {
      tableFields = [
        ...tableFields,
        {
          key: 'tyyppi',
          sortable: false,
          label: this.$t('tyyppi') as string,
          formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
            return this.$t('amosaa-tyyppi-' + value);
          },
        }, {
          key: 'perusteDiaarinumero',
          sortable: false,
          label: this.$t('diaarinumero') as string,
        }];
    }

    return tableFields;
  }

  get sisaltoTaulut() {
    return [
      {
        items: this.sisaltoviiteMap(this.tekstikappaleet),
        fields: this.sisaltoviiteFields('tekstikappale'),
        page: 'tekstikappaleet',
      },
      {
        items: this.sisaltoviiteMap(this.suorituspolut),
        fields: this.sisaltoviiteFields('suorituspolku'),
        page: 'suorituspolut',
      },
      {
        items: this.sisaltoviiteMap(this.tutkinnonosat),
        fields: this.sisaltoviiteFields('tutkinnonosa'),
        page: 'tutkinnonosat',
      },
    ];
  }

  sisaltoviiteMap(sisaltoviitteet) {
    return _.map(sisaltoviitteet, sisaltoviite => {
      return {
        ...sisaltoviite,
        selected: this.itemSelected(sisaltoviite.id),
      };
    });
  };

  itemSelected(itemId) {
    return _.includes(this.valitutSisaltoviitteet, itemId);
  }

  selectRow(itemId) {
    if (this.itemSelected(itemId)) {
      this.valitutSisaltoviitteet = _.filter(this.valitutSisaltoviitteet, id => id !== itemId);
    }
    else {
      this.valitutSisaltoviitteet = [
        ...this.valitutSisaltoviitteet,
        itemId,
      ];
    }
  }

  sisaltoviiteFields(tyyppi: string) {
    return [{
      key: 'nimi',
      label: this.$t(tyyppi) as string,
      sortable: false,
    }];
  }

  valitseToteutussuunnitelma(toteutussuunnitelma) {
    this.toteutussuunnitelma = toteutussuunnitelma;
    this.sisaltotuontiStore!.fetchSisallot(toteutussuunnitelma.id);
  }

  get kaannokset() {
    return kaannokset[this.koulutustoimija?.organisaatioRyhma ? 'organisaatioRyhma' : 'default'];
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

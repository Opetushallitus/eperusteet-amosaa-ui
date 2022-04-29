<template>
  <ep-main-view :container="true">
    <h2>{{$t('toteutussuunnitelmat-joissa-perusteet-paivittyneet')}}</h2>

    <ep-spinner v-if="!vanhentuneetToteutussuunnitelmat" />
    <div v-else-if="vanhentuneetToteutussuunnitelmat.length === 0" class="disabled-text">{{$t('toteutussuunnitelmat-eivat-vaadi-paivitysta')}}</div>
    <b-table
      v-else
      responsive
      striped
      borderless
      :items="vanhentuneetToteutussuunnitelmat"
      :fields="vanhentuneetFields">

      <template v-slot:cell(opetussuunnitelma.nimi)="{ item }">
        <router-link :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: item.opetussuunnitelma.id } }">
          {{ $kaanna(item.opetussuunnitelma.nimi) }}
        </router-link>
      </template>

      <template v-slot:cell(paivita)="{ item }">
        <ep-button @click="paivita(item.opetussuunnitelma.id)" :showSpinner="spinning(item.opetussuunnitelma.id)">
          {{$t('paivita')}}
        </ep-button>
      </template>

    </b-table>

    <h2 class="mt-5">{{$t('siirra-toteutussuunnitelmat-aiemmasta-organisaatiosta')}}</h2>

    <ep-spinner v-if="!historialiitoksienToteutussuunnitelmat" />
    <div v-else-if="historialiitoksienToteutussuunnitelmat.length === 0" class="disabled-text">{{$t('yhtaan-vanhaa-toteutussuunnitelmaa-ei-loytynyt')}}</div>
    <b-table
      v-else
      responsive
      striped
      borderless
      :items="historialiitoksienToteutussuunnitelmat"
      :fields="historiaFields">

      <template v-slot:cell(opetussuunnitelma.nimi)="{ item }">
        <router-link :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: item.opetussuunnitelma.id } }">
          {{ $kaanna(item.opetussuunnitelma.nimi) }}
        </router-link>
      </template>

      <template v-slot:cell(siirra)="{ item }">
        <ep-button @click="siirra(item.opetussuunnitelma.id)" :showSpinner="spinning(item.opetussuunnitelma.id)">
          {{$t('siirra')}}
        </ep-button>
      </template>

    </b-table>

  </ep-main-view>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import { PaivitettavatJaSiirrettavatTotsStore } from '@/stores/PaivitettavatJaSiirrettavatTotsStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import * as _ from 'lodash';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
    EpMainView,
    EpButton,
  },
})
export default class RoutePaivitettavatJaSiirrettavatToteutussuunnitelmat extends Vue {
  @Prop({ required: true })
  private paivitettavatJaSiirrettavatTotsStore!: PaivitettavatJaSiirrettavatTotsStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private spinners: number[] = [];

  get vanhentuneetToteutussuunnitelmat() {
    return this.paivitettavatJaSiirrettavatTotsStore.vanhentuneetToteutussuunnitelmat.value;
  }

  get historialiitoksienToteutussuunnitelmat() {
    return this.paivitettavatJaSiirrettavatTotsStore.historialiitoksienToteutussuunnitelmat.value;
  }

  spinning(id) {
    return _.includes(this.spinners, id);
  }

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      await this.paivitettavatJaSiirrettavatTotsStore.fetch(this.koulutustoimijaId);
    }
  }

  async paivita(toteutussuunnitelmaId) {
    try {
      this.spinners = [...this.spinners, toteutussuunnitelmaId];
      await this.paivitettavatJaSiirrettavatTotsStore.paivita(toteutussuunnitelmaId, this.koulutustoimijaId);
      this.$success(this.$t('toteutussuunnitelma-paivitetty-onnistuneesti') as string);
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }

  async siirra(toteutussuunnitelmaId) {
    this.spinners = [...this.spinners, toteutussuunnitelmaId];
    await this.paivitettavatJaSiirrettavatTotsStore.siirra(toteutussuunnitelmaId, this.koulutustoimijaId);
    this.$success(this.$t('toteutussuunnitelma-siirretty-onnistuneesti') as string);
  }

  get vanhentuneetFields() {
    return [{
      key: 'opetussuunnitelma.nimi',
      label: this.$t('nimi'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'opetussuunnitelma.peruste.nimi',
      label: this.$t('peruste'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return value ? this.$kaanna(value) : '';
      },
    }, {
      key: 'edellinenPaivitys',
      label: this.$t('edellinen-paivitys'),
      sortable: true,
      formatter: (value: any, key: string, item: any) => {
        return value ? this.$sdt(value) : '';
      },
    }, {
      key: 'perustePaivittynyt',
      label: this.$t('peruste-paivittynyt'),
      sortable: true,
      formatter: (value: any, key: string, item: any) => {
        return value ? this.$sd(value) : '';
      },
    }, {
      key: 'paivita',
      label: '',
      sortable: false,
      thStyle: 'border: none',
    }];
  }

  get historiaFields() {
    return [{
      key: 'opetussuunnitelma.nimi',
      label: this.$t('nimi'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'historialiitos.organisaatio.nimi',
      label: this.$t('organisaatio'),
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return value ? this.$kaanna(value) : '';
      },
    }, {
      key: 'siirra',
      label: '',
      sortable: false,
      thStyle: 'border: none',
    }];
  }
}
</script>

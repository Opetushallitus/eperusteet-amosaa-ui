<template>
  <div class="poistetutsisallot">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">{{ $t('poistetut-sisallot') }}</h2>
    </div>

    <ep-spinner v-if="!poistetutsisallot" />
    <div class="mt-3 ml-2 disabled-text" v-else-if="poistetutsisallot.length === 0">{{$t('yhtaan-palautettavaa-sisaltoa-ei-loytynyt')}}</div>
    <b-tabs v-else class="mt-3 ml-2">
      <b-tab class="ml-2" v-for="(valilehti, index) in poistetutsisallotValilehdet" :key="'valilehti'+index" :title="$t(valilehti.otsikko)">

        <ep-search v-model="query" class="mt-3"/>

        <div v-if="valilehti.poistetut.length > 0">
          <b-table :items="valilehti.poistetut" :fields="fields" :current-page="pages[valilehti.otsikko]" :per-page="perPage">
            <template v-slot:cell(palauta)="{ item }">
              <ep-button variant="link"
                         icon="keyboard_return"
                         @click="palauta(item)">
                {{ $t('palauta') }}
              </ep-button>
            </template>
          </b-table>

          <b-pagination
            v-model="pages[valilehti.otsikko]"
            :per-page="perPage"
            :total-rows="valilehti.poistetut.length"/>
        </div>

        <div v-else class="mt-4 disabled-text">{{$t('ei-palautettavaa-sisaltoa-annetuilla-hakuehdoilla')}}</div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { PoistetutStore } from '@/stores/PoistetutStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpSearch,
  },
})
export default class RoutePoistetutSisallot extends Vue {
  @Prop({ required: true })
  private poistetutStore!: PoistetutStore;

  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private perPage = 10;
  private query = '';
  private pages = {
    tutkinnonosat: 1,
    tekstikappaleet: 1,
    suorituspolut: 1,
  };

  async mounted() {
    await this.poistetutStore.fetchPoistetut();
  }

  get poistetutsisallotValilehdet() {
    return _.filter([
      {
        otsikko: 'tutkinnonosat',
        poistetut: this.poistetutTyypeilla(['tutkinnonosa']),
      },
      {
        otsikko: 'suorituspolut',
        poistetut: this.poistetutTyypeilla(['suorituspolku', 'osasuorituspolku']),
      },
      {
        otsikko: 'tekstikappaleet',
        poistetut: this.poistetutTyypeilla(['tekstikappale']),
      },
      {
        otsikko: 'opintokokonaisuudet',
        poistetut: this.poistetutTyypeilla(['opintokokonaisuus']),
      },
    ], valilehti => _.size(valilehti.poistetut) > 0);
  }

  get poistetutsisallot() {
    return this.poistetutStore.poistetut.value;
  }

  get poistetutSisallotFiltered() {
    return _.filter(this.poistetutsisallot, poistettuSisalto => Kielet.search(this.query, poistettuSisalto.nimi));
  }

  poistetutTyypeilla(tyypit: string[]) {
    return _.filter(this.poistetutSisallotFiltered, poistettusisalto => _.includes(tyypit, poistettusisalto.tyyppi));
  }

  async palauta(poistettu) {
    try {
      const palauta = await this.$vahvista(
        this.$t('sisallon-palautus') as string,
        this.$t('palautetaanko-sisalto') as string + ': ' + this.$kaanna(poistettu.nimi) + '?');

      if (palauta) {
        await this.poistetutStore.palauta(poistettu.id);
        await this.toteutussuunnitelmaStore.initNavigation();
        this.$success(this.$t('sisalto-palautettu-onnistuneesti') as string);
      };
    }
    catch (e) {
      console.log(e);
      this.$fail(this.$t('sisallon-palautus-epaonnistui') as string);
    }
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi') as string,
      sortable: true,
      sortByFormatted: true,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'pvm',
      label: this.$t('poistoajankohta') as string,
      sortable: true,
      formatter: (value: any, key: string, item: any) => {
        return this.$sd(value);
      },
    }, {
      key: 'muokkaajaOid',
      sortable: true,
      label: this.$t('poistaja') as string,
      formatter: (value: any, key: string, item: any) => {
        if (item.poistaja && item.poistaja.sukunimi) {
          return parsiEsitysnimi(item.poistaja);
        }
        return this.$t('muokkaajaa-ei-loytynyt') + ' (' + value + ')';
      },
    }, {
      key: 'palauta',
      sortable: false,
      label: '' as string,
      thStyle: 'border: none',
    }];
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .poistetutsisallot {
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
  }

</style>

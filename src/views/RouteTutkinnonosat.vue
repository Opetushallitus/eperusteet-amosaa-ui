<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header>
        <h2 class="m-0">{{ $t('tutkinnon-osat') }}</h2>
      </template>
      <template v-slot:default>

        <ep-spinner v-if="!tutkinnonosat"></ep-spinner>

        <div v-else>
          <div class="d-flex justify-content-between mb-4">

            <EpSearch v-model="queryNimi" :placeholder="$t('etsi')"/>

            <div class="d-flex">
              <ep-tutkinnonosa-tuonti
                :tutkinnonosatTuontiStore="tutkinnonosatTuontiStore"
                :toteutussuunnitelmaId="toteutussuunnitelmaId"
                :koulutustoimijaId="koulutustoimijaId"
                :updateNavigation="updateNavigation" />
            </div>
          </div>

          <b-table striped hover responsive :items="tutkinnonosat" :fields="fields">
            <template v-slot:cell(tutkinnonosaViite.tekstiKappale.nimi)="data">
              <router-link :to="{ name: 'tutkinnonosa', params: { sisaltoviiteId: data.item.tutkinnonosaViite.id } }">
                {{ $kaanna(data.item.nimi) }}
              </router-link>
            </template>
          </b-table>
        </div>

      </template>

    </EpEditointi>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import { TutkinnonOsatStore } from '@/stores/TutkinnonOsatStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpTutkinnonosaTuonti from '@/components/EpSisaltoLisays/EpTutkinnonosaTuonti.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';

@Component({
  components: {
    EpEditointi,
    EpButton,
    EpSearch,
    EpSpinner,
    EpTutkinnonosaTuonti,
  },
})
export default class RouteTutkinnonosat extends Vue {
  @Prop({ required: true })
  private tutkinnonOsatStore!: TutkinnonOsatStore;

  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private tutkinnonosatTuontiStore!: TutkinnonosatTuontiStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private editointiStore: EditointiStore | null = null;

  private queryNimi: string = '';

  async mounted() {
    this.editointiStore = new EditointiStore(this.tutkinnonOsatStore);
  }

  get tutkinnonosat() {
    if (this.tutkinnonOsatStore.tutkinnonosat.value) {
      return _.chain(this.tutkinnonOsatStore.tutkinnonosat.value)
        .filter(tutkinnonosa => _.includes(
          _.toLower(_.get(tutkinnonosa, 'tutkinnonosaViite.tekstiKappale.nimi.' + Kielet.getSisaltoKieli.value)),
          _.toLower(this.queryNimi)
        ))
        .map(tutkinnonosa => {
          return {
            ...tutkinnonosa,
            nimi: _.has(tutkinnonosa.tutkinnonosaViite.tekstiKappale.nimi, Kielet.getSisaltoKieli.value) ? tutkinnonosa.tutkinnonosaViite.tekstiKappale.nimi : this.$t('uusi-tutkinnonosa'),
          };
        })
        .value();
    }
  }

  get fields() {
    return [{
      key: 'jarjestysnro',
      label: this.$t('nro') as string,
      sortable: true,
    }, {
      key: 'tutkinnonosaViite.tekstiKappale.nimi',
      sortable: true,
      sortByFormatted: true,
      label: this.$t('nimi') as string,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'perusteenTutkinnonosaViite.laajuus',
      sortable: true,
      label: this.$t('laajuus') as string,
      formatter: (value: any, key: string, item: any) => {
        const laajuus = item.perusteenTutkinnonosaViite?.laajuus || item.tutkinnonosaViite?.tosa?.omatutkinnonosa?.laajuus;
        return laajuus ? laajuus + ' ' + this.$t('osaamispiste') : '';
      },
    }, {
      key: 'tutkinnonosaViite.tosa.muokattu',
      sortable: true,
      label: this.$t('muokattu') as string,
      formatter: (value: any, key: string, item: any) => {
        return this.$sdt(item.tutkinnonosaViite.tosa.muokattu);
      },
    }];
  }

  async updateNavigation() {
    await this.toteutussuunnitelmaStore.initNavigation();
    await this.tutkinnonOsatStore.refetch();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

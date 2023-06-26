<template>
  <div class="m-3" id="scroll-anchor">
    <h2 class="m-0">{{ $t('tutkinnon-osat') }}</h2>

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
            <span class="paikallinen" v-if="data.item.tutkinnonosaViite.tosa.tyyppi === 'oma'">({{$t('tutkinnon-osa-paikallinen-merkki')}})</span>
          </router-link>
        </template>
        <template v-slot:cell(actions)="data">
          <EpSpinner v-if="data.item.poistossa" small/>
          <EpButton variant="link" v-else class="btn btn-link p-0" @click="remove(data.item.tutkinnonosaViite.id)">
            <fas icon="trash"/>
          </EpButton>
        </template>
      </b-table>

    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import { TutkinnonOsatStore } from '@/stores/TutkinnonOsatStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpTutkinnonosaTuonti from '@/components/EpSisaltoLisays/EpTutkinnonosaTuonti.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import { Sisaltoviitteet } from '@shared/api/amosaa';

@Component({
  components: {
    EpButton,
    EpSearch,
    EpSpinner,
    EpTutkinnonosaTuonti,
  },
})
export default class RouteTutkinnonosat extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private tutkinnonosatTuontiStore!: TutkinnonosatTuontiStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private tutkinnonOsatStore = new TutkinnonOsatStore();

  private queryNimi: string = '';
  private poistossa: number[] = [];

  @Watch('opetussuunnitelma', { immediate: true })
  async opetussuunnitelmachange() {
    await this.fetch();
  }

  async fetch() {
    if (this.opetussuunnitelma) {
      await this.tutkinnonOsatStore.fetch(this.opetussuunnitelma.id!,
        _.toString(this.opetussuunnitelma.koulutustoimija?.id),
        this.opetussuunnitelma.peruste?.id!);
    }
  }

  async remove(tutkinnonosaId) {
    try {
      if (await this.confirm()) {
        this.poistossa.push(tutkinnonosaId);
        await Sisaltoviitteet.removeSisaltoViite(this.toteutussuunnitelmaId, tutkinnonosaId, this.koulutustoimijaId);
        await this.updateNavigation();
        await this.fetch();
        _.pull(this.poistossa, tutkinnonosaId);
      }
    }
    catch (err) {
      this.$fail(this.$t('poisto-epaonnistui') as string);
    }
  }

  async confirm() {
    let modalContent = [
      this.$createElement('strong', this.$t('tata-toimintoa-ei-voida-perua') as string),
    ];
    const vahvistusSisalto = this.$createElement('div', {}, modalContent).children;

    return this.$bvModal.msgBoxConfirm((vahvistusSisalto as any), {
      title: this.$t('varmista-poisto'),
      okVariant: 'primary',
      okTitle: this.$t('poista'),
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta'),
      centered: true,
      ...{} as any,
    });
  }

  async updateNavigation() {
    await this.toteutussuunnitelmaStore.initNavigation();
  }

  get opetussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get tutkinnonosat() {
    if (this.tutkinnonOsatStore?.tutkinnonosat.value) {
      return _.chain(this.tutkinnonOsatStore.tutkinnonosat.value)
        .filter(tutkinnonosa => _.includes(
          _.toLower(_.get(tutkinnonosa, 'tutkinnonosaViite.tekstiKappale.nimi.' + Kielet.getSisaltoKieli.value)),
          _.toLower(this.queryNimi)
        ))
        .map(tutkinnonosa => {
          return {
            ...tutkinnonosa,
            nimi: _.has(tutkinnonosa.tutkinnonosaViite.tekstiKappale.nimi, Kielet.getSisaltoKieli.value) ? tutkinnonosa.tutkinnonosaViite.tekstiKappale.nimi : this.$t('uusi-tutkinnonosa'),
            poistossa: _.includes(this.poistossa, tutkinnonosa.tutkinnonosaViite.id),
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
    }, {
      key: 'actions',
      label: '',
      thStyle: { borderBottom: '0px' },
      tdStyle: { width: '50px' },
      tdClass: 'text-center',
    }];
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.paikallinen {
  color: $black;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>

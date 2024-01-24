<template>
  <div class="m-3" id="scroll-anchor">
    <h2 class="m-0">{{ $t('tutkinnon-osat') }}</h2>

    <ep-spinner v-if="!tutkinnonosat || isDeleting"></ep-spinner>

    <div v-else>
      <div class="d-flex justify-content-between mb-4">

        <EpSearch v-model="queryNimi" :placeholder="$t('etsi')"/>

        <div class="d-flex">
          <EpButton variant="link"
                    icon="delete"
                    class="btn btn-link p-0"
                    @click="removeSelected()"
                    :disabled="selectedTutkinnonosat.length === 0">
            {{$t('poista-valitut')}}
          </EpButton>
          <ep-tutkinnonosa-tuonti
            :tutkinnonosatTuontiStore="tutkinnonosatTuontiStore"
            :toteutussuunnitelmaId="toteutussuunnitelmaId"
            :koulutustoimijaId="koulutustoimijaId"
            :updateNavigation="updateNavigation" />
        </div>
      </div>

      <b-table responsive striped hover no-local-sorting no-sort-reset
               :items="tutkinnonosatWithSelected"
               :fields="fields"
               @row-clicked="selectRow"
      class="vertical-middle">
        <template v-slot:head(valitse-kaikki)>
          <div class="selectable" @click="selectAllRows()">
            <EpMaterialIcon v-if="valitseKaikki" class="checked mr-2">check_box</EpMaterialIcon>
            <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
          </div>
        </template>
        <template v-slot:cell(valitse-kaikki)="{ item }">
          <div class="selectable">
            <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
            <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
          </div>
        </template>
        <template v-slot:cell(nimi)="data">
          <router-link :to="{ name: 'tutkinnonosa', params: { sisaltoviiteId: data.item.tutkinnonosaViite.id } }">
            {{ $kaanna(data.item.nimi) }}
            <span class="paikallinen" v-if="data.item.tutkinnonosaViite.tosa.tyyppi === 'oma'">({{$t('tutkinnon-osa-paikallinen-merkki')}})</span>
          </router-link>
        </template>
        <template v-slot:cell(actions)="data">
          <EpSpinner v-if="data.item.poistossa" small/>
          <EpButton v-else
                    variant="link"
                    icon="delete"
                    class="btn btn-link p-0"
                    @click="remove(data.item.tutkinnonosaViite.id)">
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
import { SisaltoviiteLaajaDto, Sisaltoviitteet } from '@shared/api/amosaa';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpButton,
    EpSearch,
    EpSpinner,
    EpTutkinnonosaTuonti,
    EpMaterialIcon,
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
  private isDeleting: boolean = false;
  private valitseKaikki = false;
  private selectedTutkinnonosat: SisaltoviiteLaajaDto[] = [];

  @Watch('opetussuunnitelma', { immediate: true })
  async opetussuunnitelmachange() {
    await this.fetch();
  }

  async fetch() {
    this.valitseKaikki = false;
    if (this.opetussuunnitelma) {
      await this.tutkinnonOsatStore.fetch(this.opetussuunnitelma.id!,
        _.toString(this.opetussuunnitelma.koulutustoimija?.id),
        this.opetussuunnitelma.peruste?.id!);
    }
    this.selectedTutkinnonosat = [];
  }

  async remove(tutkinnonosaId) {
    if (await this.confirm()) {
      this.poistossa.push(tutkinnonosaId);
      await Sisaltoviitteet.removeSisaltoViite(this.toteutussuunnitelmaId, tutkinnonosaId, this.koulutustoimijaId);
      await this.updateNavigation();
      await this.fetch();
      _.pull(this.poistossa, tutkinnonosaId);
    }
  }

  async removeSelected() {
    let ids = _.chain(this.selectedTutkinnonosat)
      .map(osa => _.toNumber(_.get(osa, 'tutkinnonosaViite.id')))
      .value();
    if (await this.confirm()) {
      this.isDeleting = true;
      await Sisaltoviitteet.removeSisaltoViitteet(this.toteutussuunnitelmaId, this.koulutustoimijaId, ids);
      await this.updateNavigation();
      await this.fetch();
      this.isDeleting = false;
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

  selectAllRows() {
    this.valitseKaikki = !this.valitseKaikki;
    if (this.valitseKaikki) {
      this.selectedTutkinnonosat = [
        ...(this.tutkinnonosat || []) as SisaltoviiteLaajaDto[],
      ];
    }
    else {
      this.selectedTutkinnonosat = [];
    }
  }

  selectRow(item) {
    if (_.includes(_.map(this.selectedTutkinnonosat, 'tutkinnonosaViite.id'), item.tutkinnonosaViite.id)) {
      this.selectedTutkinnonosat = _.filter(this.selectedTutkinnonosat, tutkinnonosa => {
        return _.get(tutkinnonosa, 'tutkinnonosaViite.id') !== item.tutkinnonosaViite.id;
      });
    }
    else {
      this.selectedTutkinnonosat = [
        ...this.selectedTutkinnonosat,
        item,
      ];
    }
  }

  get tutkinnonosatWithSelected() {
    return _.map(this.tutkinnonosat, tutkinnonosa => {
      return {
        ...tutkinnonosa,
        selected: _.includes(_.map(this.selectedTutkinnonosat, 'tutkinnonosaViite.id'), _.get(tutkinnonosa, 'tutkinnonosaViite.id')),
      };
    });
  }

  get opetussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get tutkinnonosat() {
    if (this.tutkinnonOsatStore?.tutkinnonosat.value) {
      return _.chain(this.tutkinnonOsatStore.tutkinnonosat.value)
        .filter(tutkinnonosa => _.includes(
          _.toLower(_.get(tutkinnonosa, 'tutkinnonosaViite.tekstiKappale.nimi.' + Kielet.getSisaltoKieli.value)),
          _.toLower(this.queryNimi),
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
      key: 'valitse-kaikki',
      sortable: false,
      tdClass: 'align-middle',
    }, {
      key: 'jarjestysnro',
      label: this.$t('nro') as string,
      sortable: true,
      tdClass: 'align-middle',
    }, {
      key: 'nimi',
      sortable: true,
      sortByFormatted: true,
      label: this.$t('nimi') as string,
      tdClass: 'align-middle',
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'perusteenTutkinnonosaViite.laajuus',
      sortable: true,
      label: this.$t('laajuus') as string,
      tdClass: 'align-middle',
      formatter: (value: any, key: string, item: any) => {
        const laajuus = item.perusteenTutkinnonosaViite?.laajuus || item.tutkinnonosaViite?.tosa?.omatutkinnonosa?.laajuus;
        return laajuus ? laajuus + ' ' + this.$t('osaamispiste') : '';
      },
    }, {
      key: 'tutkinnonosaViite.tosa.muokattu',
      sortable: true,
      label: this.$t('muokattu') as string,
      tdClass: 'align-middle',
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

.selectable {
  cursor: pointer;

  .checked {
    color: $paletti-blue;
  }
}
</style>

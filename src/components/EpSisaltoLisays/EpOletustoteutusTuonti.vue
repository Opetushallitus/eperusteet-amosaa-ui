<template>
  <div>
    <ep-button  @click="openModal" variant="outline-primary" icon="plussa" >
      {{ $t('tuo-oletustoteutus') }}
    </ep-button>
    <b-modal id="tuoOletusotteutus"
            size="lg"
            centered
            hide-footer>
      <template v-slot:modal-title>
        {{ $t('tuo-oletustoteutus-tutkinnon-osaan') }}
      </template>

      <ep-spinner v-if="!oletustoteutukset" />

      <div v-else>
        <b-table
          responsive
          striped
          hover
          :per-page="10"
          :current-page="page"
          :fields="fields"
          :items="oletustoteutuksetSisaltoviitteella"
          @row-clicked="selectRow">
        </b-table>
        <b-pagination v-if="oletustoteutukset"
            v-model="page"
            :total-rows="oletustoteutukset.length"
            :per-page="10"
            align="center"
            aria-controls="tuo-tutkinnon-osa"></b-pagination>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { TutkinnonosaApi, TutkinnonosaDto } from '@shared/api/amosaa';
import { SisaltoViiteDto } from '@shared/generated/amosaa';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpButton,
    EpSpinner,
  },
})
export default class EpOletustoteutusTuonti extends Vue {
  private page = 1;
  private sisaltoviitteet: SisaltoViiteDto[] | null = null;

  get oletustoteutukset() {
    if (this.sisaltoviitteet) {
      return _.filter(_.flatMap(_.map(this.sisaltoviitteet, 'tosa.toteutukset')), 'oletustoteutus');
    }
  }

  get oletustoteutuksetSisaltoviitteella() {
    return _.map(this.oletustoteutukset, oletustoteutus => {
      return {
        ...oletustoteutus,
        sisaltoviite: _.find(this.sisaltoviitteet, sisaltoviite => _.includes(sisaltoviite.tosa?.toteutukset, oletustoteutus)),
      };
    });
  }

  get fields() {
    return [
      {
        key: 'toteutus',
        label: this.$t('toteutuksen-nimi'),
        sortable: false,
        formatter: (value: any, key: string, item: any) => {
          return this.$kaanna(item.otsikko);
        },
      }, {
        key: 'tutkinnonosa',
        label: this.$t('luotu-tutkinnon-osassa'),
        sortable: false,
        formatter: (value: any, key: string, item: any) => {
          return this.$kaanna(item.sisaltoviite.tekstiKappale.nimi);
        },
      }];
  }

  get toteutussuunnitelmaId() {
    return _.toNumber(this.$route.params.toteutussuunnitelmaId);
  }

  get koulutustoimijaId() {
    return this.$route.params.toteutussuunnitelmaId;
  }

  selectRow(toteutus) {
    this.$emit('lisaaOletustoteutus', {
      ..._.omit(toteutus, ['id', 'sisaltoviite', 'oletustoteutus']),
      vapaat: _.map(toteutus.vapaat, vapaa => _.omit(vapaa, 'id')),
    });
    (this as any).$bvModal.hide('tuoOletusotteutus');
  }

  async openModal() {
    (this as any).$bvModal.show('tuoOletusotteutus');
    this.sisaltoviitteet = (await TutkinnonosaApi.haeOletusTutkinnonosaToteutukset(this.toteutussuunnitelmaId, this.koulutustoimijaId)).data;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

<template>
  <div>
    <ep-button  @click="openModal" variant="outline-primary" icon="add" >
      {{ $t('tuo-oletustoteutus') }}
    </ep-button>
    <b-modal id="tuoOletusotteutus"
            size="lg"
            centered
            hide-footer>
      <template v-slot:modal-title>
        <slot name="title">
          {{ $t('tuo-oletustoteutus-tutkinnon-osaan') }}
        </slot>
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
          :items="oletustoteutukset"
          @row-clicked="selectRow">
          <template #head(lahde)>
            <slot name="luotu">
              {{ $t('luotu-tutkinnon-osassa') }}
            </slot>
          </template>
        </b-table>
        <b-pagination v-if="oletustoteutukset"
            v-model="page"
            :total-rows="oletustoteutukset.length"
            :per-page="10"
            align="center"
            aria-controls="tuo-oletustoteutus"></b-pagination>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { OletusToteutusDto } from '@shared/api/amosaa';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpButton,
    EpSpinner,
  },
})
export default class EpOletustoteutusTuonti extends Vue {
  private page = 1;
  private oletustoteutukset: OletusToteutusDto[] | null = null;

  @Prop({ required: true })
  private fetch!: Function;

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
        key: 'lahde',
        label: this.$t('luotu-tutkinnon-osassa'),
        sortable: false,
        formatter: (value: any, key: string, item: any) => {
          return this.$kaanna(item.lahdeNimi);
        },
      }];
  }

  selectRow(toteutus) {
    this.$emit('lisaaOletustoteutus', {
      ..._.omit(toteutus, ['id']),
      tavatjaymparisto: { ..._.omit(toteutus.tavatjaymparisto, ['id']) },
      arvioinnista: { ..._.omit(toteutus.arvioinnista, ['id']) },
      vapaat: _.map(toteutus.vapaat, obj => _.omit(obj, 'id')),
    });
    (this as any).$bvModal.hide('tuoOletusotteutus');
  }

  async openModal() {
    (this as any).$bvModal.show('tuoOletusotteutus');
    this.oletustoteutukset = await this.fetch();
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

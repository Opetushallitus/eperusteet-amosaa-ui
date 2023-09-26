<template>
  <div>
    <EpButton v-b-modal.arkistoidutopetussuunnitelmatmodal variant="link">
      <EpMaterialIcon class="mr-2">folder</EpMaterialIcon>
      <span>{{ $t(title) }}</span>
    </EpButton>
    <b-modal
      ref="arkistoidutOpsModal"
      id="arkistoidutopetussuunnitelmatmodal"
      size="lg"
      :title="$t(title) + ' (' + arkistoidut.length + ')'"
      :hide-footer="true">
      <div class="search">
        <EpSearch v-model="query" />
      </div>
      <b-table
        responsive
        borderless
        striped
        :items="arkistoidut"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage">
        <template #cell(nimi)="data">
          {{ $kaanna(data.value) }}
        </template>
        <template #cell(muokattu)="data">
          {{ $sdt(data.value) }}
        </template>
        <template #cell(siirtyminen)="data">
          <EpButton variant="link"
                    icon="keyboard_return"
                    @click="$emit('restore', data.item)"
                    v-if="$hasOikeus('luonti') || $isAdmin()">
            {{ $t('palauta') }}
          </EpButton>
        </template>
      </b-table>
      <b-pagination
        v-model="currentPage"
        :total-rows="arkistoidut.length"
        :per-page="perPage"
        aria-controls="arkistoidut-opetussuunnitelmat"
        align="center">
      </b-pagination>
    </b-modal>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpButton,
    EpSearch,
    EpMaterialIcon,
  },
})
export default class EpArkistoidutOps extends Vue {
  @Prop()
  private opetussuunnitelmat!: OpetussuunnitelmaDto[];

  @Prop()
  private title!: string;

  private query = '';
  private currentPage = 1;
  private perPage = 10;

  get arkistoidut() {
    return _.chain(this.opetussuunnitelmat)
      .filter(ops => Kielet.search(this.query, ops.nimi))
      .orderBy('muokattu', 'desc')
      .value();
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('ops-nimi'),
    }, {
      key: 'muokattu',
      label: this.$t('poistettu'),
      sortable: true,
    }, {
      key: 'siirtyminen',
      label: '',
    }];
  }
}
</script>

<style lang="scss" scoped>
::v-deep .b-table.table-borderless thead th {
  border: none;
}
</style>

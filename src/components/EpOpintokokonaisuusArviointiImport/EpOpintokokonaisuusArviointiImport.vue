<template>
  <div>
    <EpButton variant="outline" micon="add" @click="open()" >
      {{ $t('tuo-arvioinnin-kohteet-pohjan-opintokokonaisuudesta') }}
    </EpButton>

    <b-modal
      id="arviointiImportModal"
      ref="arviointiImportModal"
      size="lg"
      :title="$t('valitse-pohjan-opintokokonaisuus')"
      :ok-title="$t('peruuta')"
      :ok-only="true">
      <div v-if="pohjanOpintokokonaisuudet">
        <b-table
          responsive
          borderless
          striped
          fixed
          hover
          :items="pohjanOpintokokonaisuudet"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          :selectable="true"
          @row-selected="onRowSelected"
          select-mode="single"
          selected-variant=''>
          <template v-slot:cell(nimi)="{ item }">
            <span class="btn-link">
              {{ $kaanna(item.tekstiKappale.nimi) }}
            </span>
          </template>
        </b-table>
        <b-pagination v-model="currentPage"
                      :total-rows="rows"
                      :per-page="perPage"
                      align="center"
                      aria-controls="arviointiImportModal"></b-pagination>
      </div>
      <ep-spinner v-else />
    </b-modal>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Sisaltoviitteet } from '@shared/api/amosaa';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpSearch,
  },
})
export default class EpOpintokokonaisuusArviointiImport extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: any;

  @Prop({ required: true })
  private addArvioinnit!: Function;

  private currentPage = 1;
  private perPage = 10;
  private pohjanOpintokokonaisuudet: any[] | null = null;

  async open() {
    (this.$refs['arviointiImportModal'] as any).show();
    this.pohjanOpintokokonaisuudet = (await Sisaltoviitteet.getOpetussuunnitelmanPohjanSisaltoviitteet(
      this.toteutussuunnitelmaId,
      'opintokokonaisuus',
      this.koulutustoimijaId,
    )).data;
  }

  onRowSelected(opintokokonaisuusViite) {
    this.addArvioinnit(_.map(opintokokonaisuusViite[0].opintokokonaisuus.arvioinnit, arviointi => {
      return {
        ..._.pick(arviointi.arviointi, UiKielet),
      };
    }));
    (this.$refs['arviointiImportModal'] as any).hide();
  }

  get rows() {
    return _.size(this.pohjanOpintokokonaisuudet);
  }

  get fields() {
    return [{
      key: 'nimi',
      sortable: true,
      sortByFormatted: true,
      label: this.$t('nimi'),
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(item.tekstiKappale.nimi);
      },
    }];
  }

  get kieli() {
    return Kielet.uiKieli;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

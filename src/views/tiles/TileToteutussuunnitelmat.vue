<template>
  <EpHomeTile icon="opetussuunnitelma" :route="{ name: targetRoute }">
    <template slot="header">
      <span>{{ $t(title) }}</span>
    </template>
    <template slot="content">
      <div v-if="etusivu">
        <table class="count-table">
          <tr>
            <td width="50%">
              <div class="bignumber">{{ etusivu.toteutussuunnitelmatKeskeneraiset }}</div>
              <div class="description">{{ $t('keskeneraista') }}</div>
            </td>
            <td class="spacer" width="50%">
              <div class="bignumber">{{ etusivu.toteutussuunnitelmatJulkaistut }}</div>
              <div class="description">{{ $t('julkaistua') }}</div>
            </td>
          </tr>
        </table>
      </div>
      <ep-spinner v-else></ep-spinner>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop, Provide, Watch } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import { EtusivuDto } from '@shared/api/amosaa';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';
import { watch } from '@vue/composition-api';
import { Toteutus, SuunnitelmaListausRoute } from '@/utils/toteutustypes';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileToteutussuunnitelmat extends Vue {
  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  private title!: string;

  @Prop({ required: false })
  private headerStyle!: string;

  @Provide('tileHeaderStyle')
  private tileHeaderStyle = this.headerStyle;

  async mounted() {
    await this.fetch();
  }

  @Watch('koulutustoimijaId')
  async koulutustoimijaChange() {
    await this.fetch();
  }

  async fetch() {
    await this.kayttajaStore.fetchEtusivu(this.koulutustoimijaId, EperusteetKoulutustyyppiRyhmat[this.toteutus]);
  }

  get etusivu() {
    return this.kayttajaStore?.etusivu?.value || null;
  }

  get targetRoute() {
    return SuunnitelmaListausRoute[this.toteutus];
  }
}
</script>

<style scoped lang="scss">
.ops {
  .ops-container {
    align-items: center;
  }
  .data {
    text-align: left;
    .name {
      font-weight: bold;
    }
    .tiedot {
      .description {
        font-size: 70%;
      }
      .muokattu {
        font-size: 70%;
      }
    }
  }
}
.count-table {
  width: 100%;
  .spacer {
    border-left: 1px solid #DADADA;;
  }
  td {
    padding: 8px;
    .bignumber {
      color: #28344F;
      font-size: 32px;
    }
    .description {
    }
  }
}
</style>

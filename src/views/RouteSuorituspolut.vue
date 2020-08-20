<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.suorituspolkuViiteRoot.tekstiKappale.nimi) }}</h2>
      </template>

      <template v-slot:default="{ data, isEditing, validation }">

        <ep-content layout="normal" v-model="data.suorituspolkuViiteRoot.tekstiKappale.teksti" :is-editable="isEditing" />

        <div class="d-flex justify-content-end" v-if="!isEditing">
          <ep-button variant="outline-primary" icon="plussa" @click="lisaaUusiSuorituspolku">
            {{ $t('lisaa-suorituspolku') }}
          </ep-button>
          <ep-button variant="outline-primary" icon="plussa" @click="lisaaUusiOsaSuorituspolku">
            {{ $t('lisaa-osasuorituspolku') }}
          </ep-button>
        </div>

        <b-table striped hover responsive :items="data.suorituspolkuViitteet" :fields="fields">
          <template v-slot:cell(tekstiKappale.nimi)="data">
            <router-link :to="{ name: 'suorituspolku', params: { sisaltoviiteId: data.item.id } }">
              {{ $kaanna(data.item.tekstiKappale.nimi) }}
            </router-link>
          </template>
        </b-table>

      </template>

    </EpEditointi>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { SuorituspolutStore } from '@/stores/SuorituspolutStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { MatalaTyyppiEnum, SisaltoviiteMatalaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpEditointi,
    EpContent,
    EpButton,
  },
})
export default class RouteSuorituspolut extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private sisaltoviiteId!: number;

  private editointiStore: EditointiStore | null = null;

  @Watch('toteutussuunnitelma', { immediate: true })
  toteutussuunnitelmaChange() {
    this.fetch();
  }

  @Watch('sisaltoviiteId', { immediate: true })
  sisaltoviiteChange() {
    this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  fetch() {
    if (this.toteutussuunnitelma) {
      this.editointiStore = new EditointiStore(
        new SuorituspolutStore(
          this.toteutussuunnitelmaId,
          this.koulutustoimijaId,
          this.sisaltoviiteId,
          this.toteutussuunnitelma.peruste!.id!,
          this.toteutussuunnitelma.suoritustapa!,
          this.versionumero));
    }
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get fields() {
    return [{
      key: 'tekstiKappale.nimi',
      sortable: true,
      sortByFormatted: true,
      label: this.$t('nimi') as string,
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'laajuus',
      sortable: true,
      label: this.$t('laajuus') as string,
      formatter: (value: any, key: string, item: any) => {
        if (value) {
          return value + ' ' + this.$t('osp');
        }

        return '';
      },
    }, {
      key: 'suorituspolku.muokattu',
      sortable: true,
      label: this.$t('muokattu') as string,
      formatter: (value: any, key: string, item: any) => {
        return this.$sdt(item.suorituspolku.muokattu);
      },
    }];
  }

  async lisaaUusiSuorituspolku() {
    await this.lisaaSuorituspolkuStoreen(MatalaTyyppiEnum.SUORITUSPOLKU);
  }

  async lisaaUusiOsaSuorituspolku() {
    await this.lisaaSuorituspolkuStoreen(MatalaTyyppiEnum.OSASUORITUSPOLKU);
  }

  private async lisaaSuorituspolkuStoreen(tyyppi: MatalaTyyppiEnum) {
    await SisaltoViiteStore.add(
      this.toteutussuunnitelmaId,
      this.sisaltoviiteId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(tyyppi),
        tekstiKappale: {
          nimi: { [Kielet.getSisaltoKieli.value]: '' },
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }

  async updateNavigation() {
    await this.toteutussuunnitelmaStore.initNavigation(this.koulutustoimijaId, this.toteutussuunnitelmaId);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

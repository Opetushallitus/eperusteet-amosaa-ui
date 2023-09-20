<template>
  <EpHomeTile icon="article"
              :route="{ name: 'paivitettavat' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }"
              :count="vanhatJaHistoriaToteutussuunnitelmatCount">
    <template slot="header">
      <span>{{ $t('tile-paivitettavat-ja-siirrettavat-toteutussuunnitelmat') }}</span>
    </template>
    <template slot="content">
      <ep-spinner v-if="!vanhatJaHistoriaToteutussuunnitelmat" />

      <div v-else-if="vanhatJaHistoriaToteutussuunnitelmatCount === 0" class="disabled-text">
        {{$t('ei-paivitettavia-tai-siirrettavia-toteutussuunnitelmia')}}
      </div>

      <div v-else class="text-left ml-5">
        <div v-for="(vanhaJaHistoria, index) in rajatut" :key="'tot'+index">
          <span>{{$kaanna(vanhaJaHistoria.opetussuunnitelma.nimi)}}</span>
        </div>

        <ep-button variant="link" v-if="rajatut.length < vanhatJaHistoriaToteutussuunnitelmatCount">
          {{vanhatJaHistoriaToteutussuunnitelmatCount - rajatut.length}} {{$t('muuta-toteutussuunnitelmaa')}}
        </ep-button>
      </div>

    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PaivitettavatJaSiirrettavatTotsStore } from '../../stores/PaivitettavatJaSiirrettavatTotsStore';
import * as _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
    EpButton,
  },
})
export default class TilePaivitettavatJaSiirrettavatToteutussuunnitelmat extends Vue {
  @Prop({ required: true })
  private paivitettavatJaSiirrettavatTotsStore!: PaivitettavatJaSiirrettavatTotsStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private limit = 3;

  async mounted() {
    await this.paivitettavatJaSiirrettavatTotsStore.fetch(this.koulutustoimijaId);
  }

  get vanhatJaHistoriaToteutussuunnitelmat(): any[] | null {
    if (this.paivitettavatJaSiirrettavatTotsStore.vanhentuneetToteutussuunnitelmat.value
      && this.paivitettavatJaSiirrettavatTotsStore.historialiitoksienToteutussuunnitelmat.value) {
      return [
        ...this.paivitettavatJaSiirrettavatTotsStore.vanhentuneetToteutussuunnitelmat.value,
        ...this.paivitettavatJaSiirrettavatTotsStore.historialiitoksienToteutussuunnitelmat.value,
      ];
    }

    return null;
  }

  get vanhatJaHistoriaToteutussuunnitelmatCount() {
    return this.vanhatJaHistoriaToteutussuunnitelmat?.length || 0;
  }

  get rajatut() {
    return _.take(this.vanhatJaHistoriaToteutussuunnitelmat, this.limit);
  }
}
</script>

<style scoped lang="scss">
  ::v-deep .ep-button .teksti, ::v-deep .ep-button .btn-link {
    padding-left: 0px !important;
  }
</style>

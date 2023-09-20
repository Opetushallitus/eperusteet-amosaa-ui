<template>
  <EpHomeTile icon="description"
              :route="{ name: 'tiedotteet' }"
              :count="uudetTiedotteetCount">
    <template slot="header">
      <span>{{ $t('tile-tiedotteet') }}</span>
    </template>
    <template slot="content">
      <ep-spinner v-if="!tiedotteet"></ep-spinner>
      <div v-else>
        <div v-if="tiedotteet && tiedotteet.length > 0">
          <div class="tiedote row justify-content-center text-left" v-for="(tiedote, idx) in tiedotteetFormatted" :key="idx">
            <div class="col-3">{{ $sd(tiedote.luotu) }}</div>
            <div class="col-7 otsikko" :class="{'font-weight-bold': tiedote.uusi}">{{ $kaanna(tiedote.otsikko) }}</div>
          </div>
        </div>
        <p v-else>{{ $t('tile-tiedotteet-kuvaus') }}</p>
      </div>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Watch, Provide } from 'vue-property-decorator';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { onkoUusi } from '@shared/utils/tiedote';
import { Debounced } from '@shared/utils/delay';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
  @Prop({ required: true })
  private kieli!: string;

  @Prop({ required: false })
  private headerStyle!: string;

  @Prop({ required: false, default: 'amosaa' })
  private julkaisupaikka!: string;

  @Provide('tileHeaderStyle')
  private tileHeaderStyle = this.headerStyle;

  private tiedotteetStore: TiedotteetStore | null = null;

  @Watch('kieli', { immediate: true })
  async onSisaltoKieliChange(newValue: string, oldValue: string) {
    if (newValue && newValue !== oldValue) {
      this.fetch();
    }
  }

  async mounted() {
    this.tiedotteetStore = new TiedotteetStore();
    this.fetch();
  }

  @Debounced()
  async fetch() {
    try {
      await this.tiedotteetStore!.init(
        {
          sivu: 0,
          sivukoko: 3,
          kieli: [_.toUpper(this.kieli)],
          tiedoteJulkaisuPaikka: [this.julkaisupaikka],
        });
    }
    catch (err) {
      throw err;
    }
  }

  get tiedotteet() {
    return this.tiedotteetStore?.tiedotteet.value;
  }

  get tiedotteetFormatted() {
    return _.map(this.tiedotteet, tiedote => {
      return {
        ...tiedote,
        uusi: onkoUusi(tiedote.luotu),
      };
    });
  }

  get uudetTiedotteetCount() {
    return _.size(_.filter(this.tiedotteetFormatted, 'uusi'));
  }
}
</script>

<style scoped lang="scss">
.tiedotteet {
  text-align: left;
  display: grid;
  padding: 1rem;
  padding-bottom: 0;
  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    small {
      color: #071A58;
    }
  }

  .otsikko {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>

<template>
  <EpHomeTile icon="muistikirja"
              :route="{ name: 'tiedotteet' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }"
              :count="uudetTiedotteetCount">
    <template slot="header">
      <span>{{ $t('tile-tiedotteet') }}</span>
    </template>
    <template slot="content">
      <ep-spinner v-if="isLoading"></ep-spinner>
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { Tiedotteet, TiedoteDto } from '@shared/api/eperusteet';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { julkaisupaikka, onkoUusi } from '@shared/utils/tiedote';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
  private isLoading = true;
  private tiedotteet: any[] = [];

  @Prop({ required: true })
  private kieli!: string;

  @Watch('kieli', { immediate: true })
  async onSisaltoKieliChange(newValue: string, oldValue: string) {
    if (newValue && newValue !== oldValue) {
      this.fetch();
    }
  }

  async mounted() {
    this.fetch();
  }

  async fetch() {
    try {
      this.isLoading = true;
      this.tiedotteet = ((await Tiedotteet.findTiedotteetBy(
        0,
        3,
        [_.toUpper(this.kieli)],
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        [julkaisupaikka.amosaa],
      )).data as any).data;
    }
    catch (err) {
      throw err;
    }
    finally {
      this.isLoading = false;
    }
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

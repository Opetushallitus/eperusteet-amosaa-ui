<template>
  <EpHomeTile icon="muistikirja"
              :route="{ name: 'tiedotteet' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }">
    <template slot="header">
      <span>{{ $t('tile-tiedotteet') }}</span>
    </template>
    <template slot="content">
      <ep-spinner v-if="isLoading"></ep-spinner>
      <div v-else>
        <div class="tiedotteet" v-if="tiedotteet && tiedotteet.length > 0">
          <div class="tiedote" v-for="(tiedote, idx) in tiedotteet" :key="idx">
            <small class="mr-4">{{ $cdt(tiedote.luotu, 'L') }}</small>
            <span>{{ $kaanna(tiedote.otsikko) }}</span>
          </div>
        </div>
        <p v-else>{{ $t('tile-tiedotteet-kuvaus') }}</p>
      </div>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TiedotteetStore } from '@/stores/TiedotteetStore';
import { Ulkopuoliset } from '@shared/api/amosaa';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
  private isLoading = true;
  private tiedotteet: any[] = [];
  private sivu = 1;
  private sivukoko = 5;

  async mounted() {
    try {
      const tiedoteHaku = (await Ulkopuoliset.getTiedotteetHaku(
        this.sivu - 1,
        this.sivukoko,
        undefined, // kieli
        undefined, // nimi
        undefined, // perusteId
        true, // perusteeton
        true, // julkinen
        true // yleinen
      )).data as any;
      this.tiedotteet = _(tiedoteHaku.data)
        .sortBy('luotu')
        .reverse()
        .value();
    }
    catch (err) {
      throw err;
    }
    finally {
      this.isLoading = false;
    }
  }

}
</script>

<style scoped lang="scss">
.tiedotteet {
  text-align: left;
  display: grid;
  .tiedote {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
    small {
      color: #071A58;
    }
  }
}
</style>
<template>
  <EpHomeTile icon="muistikirja"
              :route="{ name: 'tiedotteet' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }">
    <template slot="header">
      <span>{{ $t('tile-tiedotteet') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-wip') }}</p>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TileTiedotteet extends Vue {
}
</script>

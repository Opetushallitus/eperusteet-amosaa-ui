<template>
  <EpHomeTile icon="menu_book"
              :route="{ name: 'oppaat' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }">
    <template slot="header">
      <span>{{ $t('tile-ohjeet-ja-materiaalit') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-ohjeet-ja-materiaalit-kuvaus') }}</p>
    </template>
  </EpHomeTile>
</template>

<script lang="ts">
import { Vue, Component, Prop, Provide } from 'vue-property-decorator';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

@Component({
  components: {
    EpHomeTile,
    EpSpinner,
  },
})
export default class TIleOppaat extends Vue {
  @Prop({ required: false })
  private headerStyle!: string;

  @Provide('tileHeaderStyle')
  private tileHeaderStyle = this.headerStyle;
}
</script>

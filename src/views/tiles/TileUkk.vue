<template>
  <EpHomeTile icon="quiz"
              :route="{ name: 'ukk' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }">
    <template slot="header">
      <span>{{ $t('tile-usein-kysytyt-kysymykset') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t(text) }}</p>
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
export default class TileUkk extends Vue {
  @Prop({ required: false })
  private headerStyle!: string;

  @Prop({ required: false })
  private text!: string;

  @Provide('tileHeaderStyle')
  private tileHeaderStyle = this.headerStyle;
}
</script>

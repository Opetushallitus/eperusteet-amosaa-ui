<template>
  <EpHomeTile icon="groups"
              :route="{ name: 'organisaatio' }"
              :header-bg-color="{ top: '#009700', bottom: '#007500' }">
    <template slot="header">
      <span>{{ $t('tile-organisaation-hallinta') }}</span>
    </template>
    <template slot="content">
      <p>{{ $t('tile-organisaatio-yhteistyo-kuvaus') }}</p>
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
export default class TileOrganisaationHallinta extends Vue {
  @Prop({ required: false })
  private headerStyle!: string;

  @Provide('tileHeaderStyle')
  private tileHeaderStyle = this.headerStyle;
}
</script>

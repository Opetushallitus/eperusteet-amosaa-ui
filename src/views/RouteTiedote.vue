<template>
  <ep-main-view>
    <template slot="header">
      <div class="d-flex justify-content-between">
        <h1>{{ $t('otsikko') }}</h1>
      </div>
    </template>
    <p>teksti</p>
  </ep-main-view>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';

@Component({
  components: {
    EpMainView,
  },
})
export default class RouteTiedote extends Vue {
}
</script>

<style scoped lang="scss">

</style>

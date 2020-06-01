<template>
<div v-if="!isInitializing">
  <router-view/>
  <notifications style="margin-right: 6px; margin-top: 90px;"
                 position="top right"
                 :max="3" />
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';

@Component
export default class App extends Vue {
  private isInitializing = true;

  public async mounted() {
    const loader = (this as any).$loading.show({
      color: '#007500',
    });

    await Kayttajat.init();
    await delay(500);
    this.isInitializing = false;
    loader.hide();
  }
}
</script>

<style lang="scss">
@import "~@shared/styles/app";

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

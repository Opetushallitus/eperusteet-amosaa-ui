<template>
<div v-if="!isInitializing">
  <router-view/>
  <EpNotification></EpNotification>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';
import EpNotification from '@shared/components/EpNotification/EpNotification.vue';

@Component({
  components: {
    EpNotification,
  },
})
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

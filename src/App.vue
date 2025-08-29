<template>
  <div class="minfull h-100">
    <router-view v-if="mounted" />
    <EpNotification />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import { getCurrentInstance } from 'vue';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';
import EpNotification from '@shared/components/EpNotification/EpNotification.vue';
import { nextTick } from 'vue';
import { setGlobalBvModal } from '@shared/utils/globals';
import { useLoading } from 'vue-loading-overlay';
import { loadingOptions } from './utils/loading';
import { Kielet } from '@shared/stores/kieli';
import { getKaannokset } from '@shared/api/eperusteet';

const $loading = useLoading({
  ...loadingOptions,
  opacity: 1,
});

const mounted = ref(false);

onMounted(async () => {
  const instance = getCurrentInstance() as any;
  await nextTick();
  setGlobalBvModal(instance.ctx._bv__modal);

  const loading = $loading.show();
  Kielet.load(await getKaannokset());
  await Kayttajat.init();
  loading.hide();
  mounted.value = true;
});

</script>

<style lang="scss">
@import "@shared/styles/app.scss";

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

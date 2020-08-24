<template>
<div class="container my-5">
  <div class="px-3 px-md-0">
    <h2>{{ $t('virhe-nakyma-otsikko') }}</h2>
    <div class="virhekuva">
      <img :src="virhekuva" :alt="$t('virhe-kuva-teksti')">
    </div>

    <div class="d-flex flex-row-reverse">
      <div class="align-self-center">
        <router-link :to="{ name: 'root'}">{{ $t('palaa-etusivulle') }}</router-link>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" >
import { Component, Vue } from 'vue-property-decorator';
import { createLogger } from '@shared/utils/logger';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import { SovellusVirhe } from '@shared/tyypit';

const virhekuva = require('@assets/img/images/virhe.png');

const logger = createLogger('Virhe');

@Component({
  components: {
    EpField,
    EpFormContent,
  },
})
export default class VirheRoute extends Vue {
  get virhekuva() {
    return virhekuva;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.virhekuva {
  img {
    width: 100%;
  }
  padding: 0 10% 0 10%;
}
</style>

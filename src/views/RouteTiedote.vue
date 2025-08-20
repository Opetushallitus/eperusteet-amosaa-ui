<template>
  <ep-main-view>
    <template #header>
      <div class="d-flex justify-content-between">
        <h1>{{ $t('otsikko') }}</h1>
      </div>
    </template>
    <p>teksti</p>
  </ep-main-view>
</template>

<script setup lang="ts">
/**
 * @deprecated
 */
import _ from 'lodash';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import { $t } from '@shared/utils/globals';
</script>

<style scoped lang="scss">

</style>

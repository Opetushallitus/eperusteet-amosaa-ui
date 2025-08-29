<template>
  <div class="opsbox">
    <RouterLink
      :key="ops.id"
      tag="a"
      :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: ops.id, koulutustoimijaId: ops.koulutustoimija.id } }"
    >
      <div
        class="opsbox__chart"
        :style="backgroundStyle"
      >
        <div class="opsbox__progress-clamper">
          <EpProgress :slices="[0.2, 0.5, 1]" />
        </div>
      </div>
      <div class="opsbox__info">
        <div class="opsbox__name">
          {{ $kaanna(ops.nimi) }}
        </div>
        <div
          v-if="ops.jotpatyyppi"
          class="opsbox__jotpa"
        >
          {{ $t('jotpa') }}
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TileBackground } from '@/utils/toteutustypes';
import * as _ from 'lodash';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';
import { Toteutus } from '@shared/utils/perusteet';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  toteutus: Toteutus;
  ops: any;
}>();

const backgroundStyle = computed(() => {
  return TileBackground[props.toteutus];
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

$box-radius: 10px;
$box-height: 230px;
$box-width: 192px;
$new-tile-top-bg-color:#1E49CF;
$new-tile-bottom-bg-color:#0f3284;

.opsbox {
  user-select: none;
  margin: 10px;
  border-radius: $box-radius;
  @include tile-background-shadow;

  &:hover {
    @include tile-background-shadow-selected;
  }

  &__chart {
    height: 138px;
    padding-top: 28px;
  }

  &__progress-clamper {
    width: 80px;
    text-align: center;
    margin: 0 auto;
  }

  &__chart {
    width: $box-width;
    border-radius: $box-radius $box-radius 0 0;
    background-size: contain;
    margin: 0 auto;
    text-align: center;
  }

  &__info {
    border-radius: 0 0 $box-radius $box-radius;
    text-align: center;
    height: 92px;
    width: $box-width;
    padding: 10px 10px;
    margin: 0 auto;
    border: 1px solid #E7E7E7;
    border-top-width: 0;
    overflow-y: auto;
  }

  &__name {
    color: #2B2B2B;
    text-align: center;
    hyphens: none;
    font-size: 14px;
    font-weight: 600;
  }

  &__jotpa {
    padding: 2px 15px;
    display: inline-block;
    margin-top: 5px;
    color: $white;
    background-color: $jotpa-color;
    border-radius: 1rem;
    font-size: 0.8rem;
  }
}
</style>

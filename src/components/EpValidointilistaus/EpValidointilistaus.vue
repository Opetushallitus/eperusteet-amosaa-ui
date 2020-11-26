<template>
  <EpCollapse :borderTop="borderTop">
    <template v-slot:header>
      <h4 class="pb-3" v-if="title">
        {{ $t(title) }}
      </h4>
    </template>
    <table class="table table-striped table-borderless" v-if="items">
      <tbody>
        <tr v-for="(item, i) in items" :key="item.nimi + i">
          <td>
            <div class="d-flex align-items-center">
              <span :class="'text-' + type" class="mr-2 align-self-start">
                <fas icon="info" />
              </span>
              <span>{{ item.nimi ? $kaanna(item.nimi) + ': ' : '' }} {{ $t(item.syy) }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </EpCollapse>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';

  @Component({
    components: {
      EpCollapse,
    },
  })
export default class EpValidointilistaus extends Vue {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    items!: { nimi: string, syy: string}[];

    @Prop({ required: false, default: false })
    borderTop!: boolean;

    @Prop({ required: true })
    type!: 'danger' | 'warning';
}
</script>

<style scoped lang="scss">

</style>

<template>
  <EpCollapse :borderTop="borderTop"
              :border-bottom="false">
    <template v-slot:header>
      <h4 v-if="title">
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
              <router-link v-if="item.route" :to="item.route">
                {{ item.nimi}}
              </router-link>
              <span v-else>
                {{ item.nimi }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </EpCollapse>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';
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
    items!: { nimi: string, syy: string, route: any}[];

    @Prop({ required: false, default: false })
    borderTop!: boolean;

    @Prop({ required: true })
    type!: 'danger' | 'warning';
}
</script>

<style scoped lang="scss">

::v-deep .ep-collapse {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

</style>

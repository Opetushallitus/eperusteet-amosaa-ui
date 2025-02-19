<template>
<div class="d-flex align-content-stretch mb-3 organisaatio-box-container">
<div class="organisaatio-box-color"
        :style="nodeStyle" />
<div class="d-flex justify-content-between align-items-center organisaatio-box">
    <div class="p-3">{{ $kaanna(value.nimi) }}</div>
    <div v-if="!isEditing && !value.oid">
      <div v-if="status === 'oma'"></div>
      <ep-button variant="link" v-else-if="status === 'odotetaan'" @click="OrgEventBus.$emit('peruuta-yhteistyopyynto', value)">
        {{ $t('peruuta-yhteistyopyynto') }}
      </ep-button>
      <div v-else-if="status === 'pyynto'">
        <ep-button variant="link" @click="OrgEventBus.$emit('hylkaa-yhteistyopyynto', value)">
          {{ $t('hylkaa') }}
        </ep-button>
        <ep-button variant="primary" class="custom-margin" @click="OrgEventBus.$emit('hyvaksy-yhteistyopyynto', value)">
          {{ $t('hyvaksy-yhteistyopyynto') }}
        </ep-button>
      </div>
      <ep-button variant="link" v-else-if="status === 'yhteistyo'" @click="OrgEventBus.$emit('lopeta-yhteistyo', value)">
        {{ $t('lopeta-yhteistyo') }}
      </ep-button>
      <ep-button variant="link" v-else @click="OrgEventBus.$emit('laheta-yhteistyopyynto', value)">
        {{ $t('laheta-yhteistyopyynto') }}
      </ep-button>
    </div>
</div>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';

import { OrganizationEventBus } from '@/components/EpOrganizationTree/OrganizationEventBus';

import EpButton from '@shared/components/EpButton/EpButton.vue';

const colors = Object.freeze({
  'oma': '#E60895',
  'odotetaan': '#99B3F1',
  'pyynto': '#FFCD32',
  'yhteistyo': '#BEEAA0',
});

@Component({
  components: {
    EpButton,
  },
})
export default class EpOrganizationNode extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ required: true })
  private isEditing!: boolean;

  @Prop({ required: false, default: [] })
  private yhteistyoMap!: any[];

  get yhteistyo() {
    return this.yhteistyoMap[this.value.oid || this.value.organisaatio];
  }

  get status() {
    if (this.yhteistyo) {
      return this.yhteistyo.status;
    }
  }

  get ktId() {
    if (this.yhteistyo) {
      return this.yhteistyo.id;
    }
  }

  get color() {
    return colors[this.status];
  }

  get nodeStyle() {
    return this.color ? { 'background': this.color, 'border-color': this.color } : {};
  }

  get OrgEventBus() {
    return OrganizationEventBus;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.organisaatio-title {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.organisaatio-box {
  border: 1px solid #E3E3E3;
  border-left-style: none;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  width: 100%;
}

.organisaatio-box-color {
  border: 1px solid #E3E3E3;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  background-color: none;
  min-width: 8px;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact
}

.custom-margin {
  margin-right: 1.625rem;
}

</style>

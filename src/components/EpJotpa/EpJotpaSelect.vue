<template>
  <b-row v-if="toteutus === 'vapaasivistystyo'">
    <b-col :cols="asRows ? 12 : 6">
      <b-form-group :label="$t('jotpa-koulutus')">
        <EpToggle v-model="jotpaSelect" checkbox v-if="isEditing">{{$t('koulutus-on-jotpa-rahoitteinen')}}</EpToggle>
        <div v-if="!isEditing && !model.jotpatyyppi">{{$t('ei-asetettu')}}</div>
        <div v-if="!isEditing && model.jotpatyyppi">{{$t('koulutus-on-jotpa-rahoitteinen')}}</div>
      </b-form-group>
    </b-col>
    <b-col :cols="asRows ? 12 : 6">
      <b-form-group v-if="jotpaSelect">
        <div slot="label">
          {{$t('onko-kyseessa-vapaan-sivistystyon-jotpa-koulutus')}} <span v-if="isEditing">*</span>
        </div>
        <template v-if="isEditing">
          <b-form-radio v-for="(jotpaValinta, index) in jotpaValinnat" :key="'jotparadiobutton'+index" v-model="model.jotpatyyppi" :value="jotpaValinta.value">
            {{$t(jotpaValinta.text)}}
          </b-form-radio>
        </template>
        <div v-else>
          {{$t(jotpaValinnatValueAsKey[model.jotpatyyppi].text)}}
        </div>
      </b-form-group>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { Toteutus } from '@shared/utils/perusteet';
import { OpetussuunnitelmaBaseDtoJotpatyyppiEnum } from '@shared/generated/amosaa';

export interface JotpaType {
  jotpa: boolean;
  jotpatyyppi: OpetussuunnitelmaBaseDtoJotpatyyppiEnum | null;
}

@Component({
  components: {
    EpToggle,
  },
})
export default class EpJotpaSelect extends Vue {
  @Prop({ required: true })
  private value!: JotpaType;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: false, default: false, type: Boolean })
  private isEditing!: Boolean;

  @Prop({ required: false, default: false, type: Boolean })
  private asRows!: Boolean;

  get model() {
    return this.value;
  }

  set model(value) {
    this.$emit('input', value);
  }

  get jotpaValinnat() {
    return [
      {
        value: OpetussuunnitelmaBaseDtoJotpatyyppiEnum.VST,
        text: 'kylla',
      },
      {
        value: OpetussuunnitelmaBaseDtoJotpatyyppiEnum.MUU,
        text: 'ei',
      },
    ];
  }

  get jotpaValinnatValueAsKey() {
    return _.keyBy(this.jotpaValinnat, 'value');
  }

  get jotpa() {
    return this.value.jotpa;
  }

  get jotpaSelect() {
    return !!this.model.jotpa || !!this.model.jotpatyyppi;
  }

  set jotpaSelect(value) {
    this.model = {
      ...this.model,
      jotpa: value,
      jotpatyyppi: !value ? null : this.model.jotpatyyppi,
    };
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

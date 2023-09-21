<template>
  <div>
   <draggable
      v-bind="defaultDragOptions"
      tag="div"
      v-model="model">

        <EpCollapse
          v-for="(toteutus, toteutusIndex) in model"
          :key="'toteutus'+toteutusIndex"
          class="toteutus p-3 mb-4 w-100"
          :borderBottom="false"
          :collapsable="!isEditing"
          :usePadding="false">

          <div slot="header" v-if="!isEditing">
            <h4 class="ml-3">{{$kaanna(toteutus.otsikko)}}</h4>
          </div>

          <div class="d-flex">
            <div class="order-handle mr-3">
              <fas icon="grip-vertical" v-if="isEditing"></fas>
            </div>

            <EpPaikallinenToteutus v-model="model[toteutusIndex]" :isEditing="isEditing" @poista="poistaToteutus(model[toteutusIndex])">
              <div slot="oletustoteutus">
                {{ $t('tallenna-oletustoteutuksena-osa-alueeseen') }}
              </div>
            </EpPaikallinenToteutus>

          </div>
        </EpCollapse>
    </draggable>

    <div class="d-flex">
      <ep-button v-if="isEditing" @click="lisaaToteutus()" variant="outline" icon="add">
        {{ $t('lisaa-toteutus') }}
      </ep-button>

      <EpOletustoteutusTuonti v-if="isEditing" @lisaaOletustoteutus="lisaaOletustoteutus" :fetch="haeOletusOsaAlueToteutukset">
        <div slot="title">
          {{ $t('tuo-oletustoteutus-osa-alueeseen') }}
        </div>
        <div slot="luotu">
          {{ $t('luotu-osa-alueessa') }}
        </div>
      </EpOletustoteutusTuonti>

    </div>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpVapaatTekstit from '@/components/common/EpVapaatTekstit.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import draggable from 'vuedraggable';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';
import EpPaikallinenToteutus from '@/components/EpAmmatillinen/EpPaikallinenToteutus.vue';
import { OsaAlueApi, OmaOsaAlueToteutusDto } from '@shared/api/amosaa';
import EpOletustoteutusTuonti from '@/components/EpSisaltoLisays/EpOletustoteutusTuonti.vue';

@Component({
  components: {
    EpVapaatTekstit,
    EpInput,
    draggable,
    EpCollapse,
    EpContent,
    EpButton,
    EpPaikallinenToteutus,
    EpOletustoteutusTuonti,
  },
})
export default class EpOsaAlueToteutukset extends Vue {
  @Prop({ required: true })
  value!: OmaOsaAlueToteutusDto[];

  @Prop({ required: false, default: false })
  isEditing!: boolean;

  set model(value) {
    this.$emit('input', value);
  }

  get model() {
    return this.value;
  }

  lisaaToteutus() {
    this.$emit('input', [
      ...this.value,
      {
        tavatjaymparisto: {},
        arvioinnista: {},
        vapaat: [],
      },
    ]);
  }

  poistaToteutus(poistettavaOsaalue) {
    this.$emit('input', _.filter(this.value, toteutus => toteutus !== poistettavaOsaalue));
  }

  async haeOletusOsaAlueToteutukset() {
    return (await OsaAlueApi.haeOletusOsaAlueToteutukset(this.toteutussuunnitelmaId, this.koulutustoimijaId)).data;
  }

  lisaaOletustoteutus(toteutus) {
    this.model = [
      ...(this.model || []),
      toteutus,
    ];
  }

  get defaultDragOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
    };
  }

  get toteutussuunnitelmaId() {
    return _.toNumber(this.$route.params.toteutussuunnitelmaId);
  }

  get koulutustoimijaId() {
    return this.$route.params.toteutussuunnitelmaId;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

.toteutus {
  @include tile-background-shadow;
  border-radius: 10px;
}
</style>

<template>
  <div>
    <div v-if="!isEditing && toteutukset && toteutukset.length === 0">
      <EpAlert
        :text="$t('ei-sisaltoa') + '. ' + (tyyppi !== 'linkki' ? $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.' : '')"
        class="pb-3"/>
    </div>
    <div v-else>
      <draggable
          v-bind="toteutuksetOptions"
          tag="div"
          v-model="toteutukset">

        <ep-collapse class="toteutus pr-3 mb-4" v-for="(toteutus, index) in toteutukset" :key="'toteutus'+index" :borderBottom="false" >
          <div slot="header" slot-scope="{ toggled }" class="px-3">
            <div v-if="isEditing" class="d-flex align-items-end">
              <fas icon="raahaus" class="order-handle"/>
              <h4 class="mb-0">
                <span v-if="toggled || !toteutus.otsikko || !toteutus.otsikko[kieli]">{{$t('toteutuksen-otsikko')}}<span v-if="isEditing"> *</span></span>
                <span v-else-if="!toggled">{{$kaanna(toteutus.otsikko)}}</span>
              </h4>
            </div>
            <h4 v-else>{{$kaanna(toteutus.otsikko)}}</h4>
          </div>
          <EpTutkinnonosanPaikallinenToteutus v-model="toteutukset[index]" @poista="poistaToteutus(index)" :isEditing="isEditing"/>
        </ep-collapse>
      </draggable>
    </div>

    <div class="d-flex">
      <ep-button v-if="isEditing" variant="outline-primary" icon="plussa" @click="lisaaToteutus()">
        {{ $t('lisaa-toteutus') }}
      </ep-button>

      <EpOletustoteutusTuonti v-if="isEditing" @lisaaOletustoteutus="lisaaOletustoteutus"/>
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, InjectReactive } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpTutkinnonosanPaikallinenToteutus from './EpTutkinnonosanPaikallinenToteutus.vue';
import EpOletustoteutusTuonti from '@/components/EpSisaltoLisays/EpOletustoteutusTuonti.vue';
import draggable from 'vuedraggable';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpAlert,
    EpButton,
    EpCollapse,
    EpContent,
    EpField,
    EpTutkinnonosanPaikallinenToteutus,
    draggable,
    EpOletustoteutusTuonti,
  },
})
export default class EpTutkinnonosanPaikallisetToteutukset extends Vue {
  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  tyyppi!: any;

  get toteutukset() {
    return this.value;
  }

  set toteutukset(value) {
    this.$emit('input', value);
  }

  get toteutuksetOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      disabled: !this.isEditing,
      forceFallback: true,
      handle: '.order-handle',
      group: {
        name: 'toteutukset',
        pull: 'clone',
        put: false,
        revertClone: true,
      },
    };
  }

  lisaaToteutus() {
    this.toteutukset = [
      ...(this.toteutukset || []), {
        tavatjaymparisto: {},
        arvioinnista: {},
        vapaat: [],
        koodit: [],
      },
    ];
  }

  lisaaOletustoteutus(toteutus) {
    this.toteutukset = [
      ...(this.toteutukset || []),
      toteutus,
    ];
  }

  poistaToteutus(idx: number) {
    this.toteutukset = _.reject(this.toteutukset, (v, tIdx: number) => idx === tIdx);
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.toteutus {
  @include tile-background-shadow;
  border-radius: 10px;
}

</style>

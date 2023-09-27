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
              <EpMaterialIcon class="order-handle">drag_indicator</EpMaterialIcon>
              <h4 class="mb-0">
                <span v-if="toggled || !toteutus.otsikko || !toteutus.otsikko[kieli]">{{$t('toteutuksen-otsikko')}}<span v-if="isEditing"> *</span></span>
                <span v-else-if="!toggled">{{$kaanna(toteutus.otsikko)}}</span>
              </h4>
            </div>
            <h4 v-else>{{$kaanna(toteutus.otsikko)}}</h4>
          </div>
          <EpPaikallinenToteutus v-model="toteutukset[index]" @poista="poistaToteutus(index)" :isEditing="isEditing"/>
        </ep-collapse>
      </draggable>
    </div>

    <div class="d-flex">
      <ep-button v-if="isEditing" variant="outline-primary" icon="add" @click="lisaaToteutus()">
        {{ $t('lisaa-toteutus') }}
      </ep-button>

      <EpOletustoteutusTuonti v-if="isEditing" @lisaaOletustoteutus="lisaaOletustoteutus" :fetch="haeOletusTutkinnonosaToteutukset"/>
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpPaikallinenToteutus from '@/components/EpAmmatillinen/EpPaikallinenToteutus.vue';
import EpOletustoteutusTuonti from '@/components/EpSisaltoLisays/EpOletustoteutusTuonti.vue';
import draggable from 'vuedraggable';
import { Kielet } from '@shared/stores/kieli';
import { TutkinnonosaApi } from '@shared/api/amosaa';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpAlert,
    EpButton,
    EpCollapse,
    EpContent,
    EpField,
    EpPaikallinenToteutus,
    draggable,
    EpOletustoteutusTuonti,
    EpMaterialIcon,
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

  get toteutussuunnitelmaId() {
    return _.toNumber(this.$route.params.toteutussuunnitelmaId);
  }

  get koulutustoimijaId() {
    return this.$route.params.koulutustoimijaId;
  }

  async haeOletusTutkinnonosaToteutukset() {
    return (await TutkinnonosaApi.haeOletusTutkinnonosaToteutukset(this.toteutussuunnitelmaId, this.koulutustoimijaId)).data;
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

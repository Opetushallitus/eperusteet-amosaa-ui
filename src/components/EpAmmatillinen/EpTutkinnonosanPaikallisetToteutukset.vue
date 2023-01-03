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

        <ep-collapse class="toteutus" v-for="(toteutus, index) in toteutukset" :key="'toteutus'+index" :borderBottom="false" >
          <template slot="header">
            <div v-if="isEditing" class="d-flex align-items-end">
              <fas icon="raahaus" class="raahaus"/>
              <h4 class="mb-0">{{$t('toteutuksen-otsikko')}}</h4>
            </div>
            <h4 v-else>{{$kaanna(toteutus.otsikko)}}</h4>
          </template>
          <EpTutkinnonosanPaikallinenToteutus v-model="toteutukset[index]"
                                 @poista="poistaToteutus(index)"
                                 :isEditing="isEditing"
                                 :osaamisalat="osaamisalat"
                                 :tutkintonimikkeet="tutkintonimikkeet" />
        </ep-collapse>
      </draggable>
    </div>

    <ep-button v-if="isEditing" variant="outline-primary" icon="plussa" @click="lisaaToteutus()">
      {{ $t('lisaa-toteutus') }}
    </ep-button>

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
import draggable from 'vuedraggable';

@Component({
  components: {
    EpAlert,
    EpButton,
    EpCollapse,
    EpContent,
    EpField,
    EpTutkinnonosanPaikallinenToteutus,
    draggable,
  },
})
export default class EpTutkinnonosanPaikallisetToteutukset extends Vue {
  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  tutkintonimikkeet!: any;

  @Prop({ required: true })
  osaamisalat!: any;

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

  poistaToteutus(idx: number) {
    this.toteutukset = _.reject(this.toteutukset, (v, tIdx: number) => idx === tIdx);
  }
}
</script>

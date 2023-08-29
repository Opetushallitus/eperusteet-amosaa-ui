<template>
  <div>
    <ep-collapse :borderBottom="true" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
      <h3 slot="header">{{ $t('pakolliset-osa-alueet') }}</h3>

      <draggable
        v-bind="pakollisetDraggableOptions"
        tag="div"
        v-model="pakollisetOsaAlueet">
        <div class="osaalue d-flex" v-for="(osaalue, idx) in pakollisetOsaAlueet" :key="'pakollinen-' + idx">
          <div class="order-handle mr-2" v-if="isEditing">
            <fas icon="grip-vertical"></fas>
          </div>
          <div class="nimi">
            <router-link :to="{ name: 'osaalue', params: { osaalueId: osaalue.id } }" :is="isEditing ? 'span' : 'router-link'">
              {{ $kaanna(osaalue.perusteenData.nimi) }}
            </router-link>
          </div>
          <div class="koodi ml-1"> ({{ osaalue.perusteenData.koodi.arvo }})</div>
        </div>
      </draggable>
    </ep-collapse>

    <ep-collapse :borderBottom="true" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
      <h3 slot="header">{{ $t('valinnaiset-osa-alueet') }}</h3>

      <draggable
        v-bind="valinnaisetDraggableOptions"
        tag="div"
        v-model="valinnaisetOsaAlueet">
        <div class="osaalue d-flex" :class="{ 'piilotettu': osaalue.piilotettu }" v-for="(osaalue, idx) in valinnaisetOsaAlueet" :key="'valinnainen-' + idx">
          <div class="order-handle mr-2" v-if="isEditing">
            <fas icon="grip-vertical"></fas>
          </div>
          <div class="nimi">
            <router-link :to="{ name: 'osaalue', params: { osaalueId: osaalue.id } }" :is="isEditing ? 'span' : 'router-link'">
              {{ $kaanna(osaalue.perusteenData.nimi) }}
              <span v-if="osaalue.piilotettu">
                ({{ $t('piilotettu') }})
              </span>
            </router-link>
          </div>
          <div class="koodi ml-1"> ({{ osaalue.perusteenData.koodi.arvo }})</div>
        </div>
      </draggable>
    </ep-collapse>

    <ep-collapse :borderBottom="false" :class="{'pt-0 pb-0': isEditing}">
      <h3 slot="header">{{ $t('paikalliset-osa-alueet') }}</h3>

      <draggable
        v-bind="paikallisetDraggableOptions"
        tag="div"
        v-model="paikallisetOsaAlueet">
        <div class="osaalue d-flex" v-for="(osaalue, idx) in paikallisetOsaAlueet" :key="'paikallinen-' + idx">
          <div class="order-handle mr-2" v-if="isEditing">
            <fas icon="grip-vertical"></fas>
          </div>
          <div class="nimi">
            <router-link :to="{ name: 'osaalue', params: { osaalueId: osaalue.id } }" :is="isEditing ? 'span' : 'router-link'">
              {{ $kaanna(osaalue.nimi) }}
            </router-link>
          </div>
          <div class="koodi ml-1" v-if="osaalue.koodi"> ({{ osaalue.koodi }})</div>
        </div>
      </draggable>
    </ep-collapse>

    <slot name="uusiosaalue" />

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, InjectReactive } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import draggable from 'vuedraggable';
import { DEFAULT_DRAGGABLE_PROPERTIES } from '@shared/utils/defaults';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpField,
    EpInput,
    draggable,
  },
})
export default class EpYhteiset extends Vue {
  @Prop({ required: true })
  private isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  perusteen!: any;

  private uudenNimi = null as any | null;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get perusteenOsaAlueet() {
    return _(this.perusteen.osaAlueet)
      .filter((oa) => oa.tyyppi === 'osaalue2020')
      .keyBy('id')
      .value();
  }

  get osaAlueet() {
    return _(this.value.osaAlueet)
      .map(oa => ({
        ...oa,
        perusteenData: this.perusteenOsaAlueet[oa.perusteenOsaAlueId],
      }))
      .value();
  }

  set osaAlueet(val) {
    this.model.osaAlueet = val;
  }

  get pakollisetOsaAlueet() {
    return _.filter(this.osaAlueet, oa => oa.tyyppi === 'pakollinen');
  }

  set pakollisetOsaAlueet(val) {
    this.osaAlueet = [
      ...val,
      ...this.valinnaisetOsaAlueet,
      ...this.paikallisetOsaAlueet,
    ];
  }

  get valinnaisetOsaAlueet() {
    return _.filter(this.osaAlueet, oa => oa.tyyppi === 'valinnainen');
  }

  set valinnaisetOsaAlueet(val) {
    this.osaAlueet = [
      ...this.pakollisetOsaAlueet,
      ...val,
      ...this.paikallisetOsaAlueet,
    ];
  }

  get paikallisetOsaAlueet() {
    return _.filter(this.osaAlueet, oa => oa.tyyppi === 'paikallinen');
  }

  set paikallisetOsaAlueet(val) {
    this.osaAlueet = [
      ...this.pakollisetOsaAlueet,
      ...this.valinnaisetOsaAlueet,
      ...val,
    ];
  }

  lisaaPaikallinen() {
    this.value.osaAlueet.push({
      tyyppi: 'paikallinen',
      nimi: this.uudenNimi,
    });
    this.uudenNimi = null;
  }

  get pakollisetDraggableOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'pakolliset',
      },
    };
  }

  get valinnaisetDraggableOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'valinnaiset',
      },
    };
  }

  get paikallisetDraggableOptions() {
    return {
      ...DEFAULT_DRAGGABLE_PROPERTIES,
      disabled: !this.isEditing,
      group: {
        name: 'paikalliset',
      },
    };
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.osaalue {
  background: #e6f6ff;
  padding: 14px;
  border-radius: 40px;
  margin-bottom: 5px;

  .nimi {
  }

  .koodi {
    color: #414141;
  }
}

.piilotettu {
  background: #ccc;
}

</style>

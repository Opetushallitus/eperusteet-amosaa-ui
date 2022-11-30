<template>
  <div>
    <ep-collapse :borderBottom="true" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
      <h3 slot="header">{{ $t('pakolliset-osa-alueet') }}</h3>
      <div class="osaalue" v-for="(osaalue, idx) in pakollisetOsaAlueet" :key="'pakollinen-' + idx">
        <span class="nimi">
          <router-link :to="{ name: 'osaalue', params: { osaalueId: osaalue.id, tyyppi: 'pakollinen' } }">
            {{ $kaanna(osaalue.perusteenData.nimi) }}
          </router-link>
        </span>
        <span class="koodi"> ({{ osaalue.perusteenData.koodi.arvo }})</span>
      </div>
    </ep-collapse>

    <ep-collapse :borderBottom="true" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
      <h3 slot="header">{{ $t('valinnaiset-osa-alueet') }}</h3>
      <div class="osaalue" :class="{ 'piilotettu': osaalue.piilotettu }" v-for="(osaalue, idx) in valinnaisetOsaAlueet" :key="'valinnainen-' + idx">
        <span class="nimi">
          <router-link :to="{ name: 'osaalue', params: { osaalueId: osaalue.id, tyyppi: 'valinnainen' } }">
            {{ $kaanna(osaalue.perusteenData.nimi) }}
            <span v-if="osaalue.piilotettu">
              ({{ $t('piilotettu') }})
            </span>
          </router-link>
        </span>
        <span class="koodi"> ({{ osaalue.perusteenData.koodi.arvo }})</span>
      </div>
    </ep-collapse>

    <ep-collapse :borderBottom="false" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
      <h3 slot="header">{{ $t('paikalliset-osa-alueet') }}</h3>
      <div class="osaalue" v-for="(osaalue, idx) in paikallisetOsaAlueet" :key="'paikallinen-' + idx">
        <span class="nimi">
          <router-link :to="{ name: 'osaalue', params: { osaalueId: osaalue.id, tyyppi: 'paikallinen' } }">
            {{ $kaanna(osaalue.nimi) }}
          </router-link>
        </span>
        <span class="koodi" v-if="osaalue.koodi"> ({{ osaalue.koodi }})</span>
      </div>
      <div v-if="isEditing">
        <EpInput v-model="uudenNimi" is-editing="true"></EpInput>
        <EpButton class="mt-2" @click="lisaaPaikallinen()">{{ $t('lisaa-uusi') }}</EpButton>
      </div>
    </ep-collapse>

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

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpField,
    EpInput,
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

  get pakollisetOsaAlueet() {
    return _.filter(this.osaAlueet, oa => oa.tyyppi === 'pakollinen');
  }

  get valinnaisetOsaAlueet() {
    return _.filter(this.osaAlueet, oa => oa.tyyppi === 'valinnainen');
  }

  get paikallisetOsaAlueet() {
    return _.filter(this.osaAlueet, oa => oa.tyyppi === 'paikallinen');
  }

  lisaaPaikallinen() {
    this.value.osaAlueet.push({
      tyyppi: 'paikallinen',
      nimi: this.uudenNimi,
    });
    this.uudenNimi = null;
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

<template>
  <div>
    <h2>{{$t('laaja-alainen-osaaminen')}}</h2>
    <div class="mb-4">{{$t('koto-laaja-alainen-osaaminen-paikallinen-tarkennus-selite')}}</div>

    <div v-for="(lao, index) in laajaAlaisetOsaamiset" :key="'lao' + index">

      <div class="d-flex align-items-center justify-content-between">
        <h3>{{$kaanna(perusteenLaotByUri[lao.koodiUri].koodi.nimi)}}</h3>
        <ep-button variant="link" icon="roskalaatikko" @click="poistaLaajaAlainenOsaaminen(lao)" v-if="isEditing">
          {{ $t('poista') }}
        </ep-button>
      </div>
      <EpContent
        class="mb-4"
        v-model="perusteenLaotByUri[lao.koodiUri].kuvaus"
        layout="normal"
        :is-editable="false"
        :kuvaHandler="kuvaHandler"/>

      <b-form-group class="mb-4">
        <h4 slot="label">{{$t('paikallinen-teksti')}}</h4>
        <EpContent
          layout="normal"
          v-model="lao.teksti"
          :is-editable="isEditing"
          :kuvaHandler="kuvaHandler"/>
      </b-form-group>

    </div>

    <b-dropdown v-if="isEditing" :text="$t('lisaa-laaja-alaisen-osaamisen-kuvaus')" variant="primary" class="mb-4">
      <b-dropdown-item-button
        v-for="(perusteenLao, index) in perusteenLaajaAlaisetOsaamiset"
        @click="addLaajaAlainenOsaaminen(perusteenLao)"
        :key="index+'addlaaja'"
        :disabled="laotByUri[perusteenLao.koodi.uri] !== undefined">
        {{ perusteenLao.koodi.arvo + '. ' + $kaanna(perusteenLao.koodi.nimi) }}
      </b-dropdown-item-button>
    </b-dropdown>

    <EpAlert
      v-if="!isEditing && laajaAlaisetOsaamiset.length === 0"
      :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
  </div>
</template>

<script lang="ts">
import { PerusteenOsaDto, KotoTaitotasoLaajaAlainenOsaaminenDto } from '@shared/api/amosaa';
import { IKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import * as _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpContent,
    EpAlert,
    EpButton,
  },
})
export default class EpKotoLaajaAlainenOsaaminen extends Vue {
  @Prop({ required: true })
  private perusteenLaajaAlaisetOsaamiset!: PerusteenOsaDto[];

  @Prop({ required: true })
  private value!: KotoTaitotasoLaajaAlainenOsaaminenDto[];

  @Prop({ required: false })
  private kuvaHandler!: IKuvaHandler;

  @Prop({ required: false, default: false, type: Boolean })
  private isEditing!: boolean;

  get laajaAlaisetOsaamiset() {
    return this.value;
  }

  set laajaAlaisetOsaamiset(value) {
    this.$emit('input', value);
  }

  get perusteenLaotByUri() {
    return _.keyBy(this.perusteenLaajaAlaisetOsaamiset, 'koodi.uri');
  }

  get laotByUri() {
    return _.keyBy(this.laajaAlaisetOsaamiset, 'koodiUri');
  }

  addLaajaAlainenOsaaminen(perusteenLao) {
    this.laajaAlaisetOsaamiset = [
      ...this.laajaAlaisetOsaamiset,
      {
        koodiUri: perusteenLao.koodi.uri,
      },
    ];
  }

  poistaLaajaAlainenOsaaminen(poistettavaLao) {
    this.laajaAlaisetOsaamiset = _.reject(this.laajaAlaisetOsaamiset, lao => lao.koodiUri === poistettavaLao.koodiUri);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

<template>
  <div>
    <div v-for="(vaatimuksenKohde, kohdeIndex) in model"
      :key="'vaatimuksenkohde' + kohdeIndex"
      class="mb-4" :class="{'vaatimuksen-kohde': isEditing, 'p-3': isEditing}">

      <div class="font-weight-bold mb-2" v-if="isEditing">{{$t('otsikko')}}</div>
      <ep-field :class="{'mb-3': isEditing}" v-model="vaatimuksenKohde.otsikko" :is-editing="isEditing"/>

      <ul v-if="!isEditing">
        <li v-for="(vaatimus, index) in vaatimuksenKohde.vaatimukset" :key="'vaatimus' + kohdeIndex + index">
          {{$kaanna(vaatimus.selite)}} <span v-if="vaatimus.ammattitaitovaatimusKoodi">({{ vaatimus.ammattitaitovaatimusKoodi }})</span>
        </li>
      </ul>

      <div v-else>
        <div class="font-weight-bold mb-2" v-if="isEditing">{{$t('vaatimukset')}}</div>
        <div v-for="(vaatimus, index) in vaatimuksenKohde.vaatimukset"
          :key="'vaatimus' + kohdeIndex + index"
          class="d-flex ml-2 mb-2 w-100 justify-content-between align-items-center">
          <ep-field v-model="vaatimus.selite" :is-editing="true" class="w-100"/>
          <div class="d-flex ml-5">
            <div class="d-flex align-items-center">{{ $t('koodi') }}</div>
            <ep-input type="string" class="ml-2" v-model="vaatimus.ammattitaitovaatimusKoodi" :is-editing="true"/>
          </div>
          <div @click="poistaVaatimus(vaatimus, vaatimuksenKohde)">
            <EpMaterialIcon class="default-icon clickable">delete</EpMaterialIcon>
          </div>
        </div>

        <div class="d-flex justify-content-between">
          <ep-button @click="lisaaVaatimus(vaatimuksenKohde)"
            variant="outline"
            icon="add">
            {{ $t('lisaa-ammattitaitovaatimus') }}
          </ep-button>

          <ep-button @click="poistaKohdealue(vaatimuksenKohde)" variant="link" icon="delete">
            {{ $t('poista-kohdealue') }}
          </ep-button>
        </div>
      </div>
    </div>

    <ep-button
        v-if="isEditing"
        @click="lisaaKohdealue()"
        variant="outline"
        icon="add">
      {{ $t('lisaa-kohdealue') }}
    </ep-button>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpField from '@shared/components/forms/EpField.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpInput from '@shared/components/forms/EpInput.vue';

@Component({
  components: {
    EpField,
    EpButton,
    EpMaterialIcon,
    EpInput,
  },
})
export default class EpAmmattitaitovaatimuksetLista extends Vue {
  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  get model() {
    return this.value;
  }

  set model(value) {
    this.$emit('input', value);
  }

  lisaaVaatimus(vaatimuksenKohde) {
    vaatimuksenKohde.vaatimukset = [...vaatimuksenKohde.vaatimukset, {}];
  }

  lisaaKohdealue() {
    this.model = [...this.model, { vaatimukset: [] }];
  }

  poistaVaatimus(poistettavaVaatimus, vaatimuksenKohde) {
    vaatimuksenKohde.vaatimukset = _.without(vaatimuksenKohde.vaatimukset, poistettavaVaatimus);
  }

  poistaKohdealue(poistettavaKohdeAlue) {
    this.model = _.without(this.model, poistettavaKohdeAlue);
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.vaatimuksen-kohde {
  border: 1px solid #eee;
}

</style>

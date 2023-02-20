<template>
  <div>
    <div v-for="(vapaateksti, index) in value" :key="'vapaateksti'+index" class="mt-4">
      <h4 slot="header" v-if="!isEditing">{{$kaanna(vapaateksti.nimi)}}</h4>
      <h4 slot="header" v-if="isEditing">{{$t('tekstikappaleen-otsikko')}}</h4>
      <ep-field v-if="isEditing" v-model="vapaateksti.nimi" :is-editing="isEditing"></ep-field>

      <h4 class="pt-3" v-if="isEditing">{{$t('tekstikappaleen-sisalto')}}</h4>
      <ep-content layout="normal" v-model="vapaateksti.teksti" :is-editable="isEditing"> </ep-content>

      <div class="d-flex justify-content-between mt-1" v-if="isEditing">
        <ep-button variant="outline-primary" icon="plussa" v-if="index+1 === value.length" @click="lisaaTekstikappale()">
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>
        <div v-else/>

        <ep-button variant="link" icon="roskalaatikko" @click="poistaTekstikappale(vapaateksti)">
          {{ $t('poista-tekstikappale') }}
        </ep-button>
      </div>

      <hr v-if="value.length > index+1" />
    </div>

    <ep-button variant="outline-primary" icon="plussa" v-if="isEditing &&value.length === 0" @click="lisaaTekstikappale()">
      {{ $t('lisaa-tekstikappale') }}
    </ep-button>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { VapaaTekstiDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpButton,
    EpContent,
    EpCollapse,
    EpField,
  },
})
export default class EpVapaatTekstit extends Vue {
  @Prop({ required: true })
  value!: Array<VapaaTekstiDto>;

  @Prop({ default: false })
  isEditing!: boolean;

  lisaaTekstikappale() {
    this.$emit('input',
      [
        ...this.value,
        {},
      ]);
  }

  poistaTekstikappale(poistettava: any) {
    this.$emit('input', _.filter(this.value, vpTeksti => vpTeksti !== poistettava));
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

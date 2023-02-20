<template>
  <div class="paikallinentoteutus px-3">
    <ep-field v-if="isEditing" v-model="toteutus.otsikko" :is-editing="isEditing"></ep-field>

    <div class="pl-1 mt-3">
      <h4 slot="header" class="mt-3">{{$t('tavat-ja-ymparisto')}}</h4>
      <ep-content flayout="normal" v-model="toteutus.tavatjaymparisto.teksti" :is-editable="isEditing"> </ep-content>

      <h4 slot="header" class="mt-3">{{$t('osaamisen-arvioinnista')}}</h4>
      <ep-content layout="normal" v-model="toteutus.arvioinnista.teksti" :is-editable="isEditing"> </ep-content>

      <hr v-if="toteutus.vapaat.length > 0" />

      <EpVapaatTekstit v-model="toteutus.vapaat" :isEditing="isEditing"/>

    </div>

    <div class="d-flex justify-content-between align-items-center pt-3" v-if="isEditing">
      <EpToggle
        class="oletustoteutus"
        v-if="isEditing"
        checkbox
        v-model="toteutus.oletustoteutus">
        {{$t('tallenna-oletustoteutuksena')}}
      </EpToggle>
      <ep-button v-if="isEditing" variant="link" icon="roskalaatikko" @click="poistaToteutus">
        {{ $t('poista-toteutus') }}
      </ep-button>
    </div>

  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { TutkinnonosaToteutusDto } from '@shared/api/amosaa';
import EpVapaatTekstit from '@/components/common/EpVapaatTekstit.vue';

@Component({
  components: {
    EpButton,
    EpContent,
    EpCollapse,
    EpField,
    EpVapaatTekstit,
    EpToggle,
  },
})
export default class EpTutkinnonosanPaikallinenToteutus extends Vue {
  @Prop({ default: false })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  private valittuToteutus: TutkinnonosaToteutusDto | null = null;
  private fetching = false;

  get toteutus() {
    return this.value;
  }

  set toteutus(value) {
    this.$emit('input', value);
  }

  poistaToteutus() {
    this.$emit('poista');
  }

  lisaaTekstikappale() {
    this.toteutus = {
      ...this.toteutus,
      vapaat: [...(this.toteutus.vapaat || []), {}],
    };
  }

  poistaTekstikappale(poistettava: any) {
    this.toteutus = {
      ...this.toteutus,
      vapaat: _.filter(this.toteutus.vapaat, vpTeksti => vpTeksti !== poistettava),
    };
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.paikallinentoteutus {

  .oletustoteutus {
    margin-left: 17px;
  }

}

</style>

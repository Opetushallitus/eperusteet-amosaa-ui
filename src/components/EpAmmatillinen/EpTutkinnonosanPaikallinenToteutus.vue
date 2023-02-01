<template>
  <div>
    <ep-field v-if="isEditing" v-model="toteutus.otsikko" :is-editing="isEditing"></ep-field>

    <div class="pl-1 pr-4">
      <ep-collapse :collapsable="!isEditing">
        <h4 slot="header">{{$t('tavat-ja-ymparisto')}}</h4>
        <ep-content layout="normal" v-model="toteutus.tavatjaymparisto.teksti" :is-editable="isEditing"> </ep-content>
      </ep-collapse>

      <ep-collapse :borderBottom="toteutus.vapaat.length > 0" :collapsable="!isEditing">
        <h4 slot="header">{{$t('osaamisen-arvioinnista')}}</h4>
        <ep-content layout="normal" v-model="toteutus.arvioinnista.teksti" :is-editable="isEditing"> </ep-content>
      </ep-collapse>

      <EpVapaatTekstit v-model="toteutus.vapaat" :isEditing="isEditing"/>
    </div>

    <div class="d-flex justify-content-end pt-2 pr-4" v-if="isEditing">
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

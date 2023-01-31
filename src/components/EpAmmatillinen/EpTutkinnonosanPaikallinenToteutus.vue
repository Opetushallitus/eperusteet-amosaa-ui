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

      <ep-collapse v-for="(vapaateksti, index) in toteutus.vapaat" :key="'vapaateksti'+index" :borderBottom="toteutus.vapaat.length > index+1" :collapsable="!isEditing">
        <h4 slot="header" v-if="!isEditing">{{$kaanna(vapaateksti.nimi)}}</h4>
        <h4 slot="header" v-if="isEditing">{{$t('tekstikappaleen-otsikko')}}</h4>
        <ep-field v-if="isEditing" v-model="vapaateksti.nimi" :is-editing="isEditing"></ep-field>

        <h4 class="pt-3" v-if="isEditing">{{$t('tekstikappaleen-sisalto')}}</h4>
        <ep-content layout="normal" v-model="vapaateksti.teksti" :is-editable="isEditing"> </ep-content>

        <div class="d-flex justify-content-between pt-3" v-if="isEditing">
          <ep-button variant="outline-primary" icon="plussa" v-if="index+1 === toteutus.vapaat.length" @click="lisaaTekstikappale()">
            {{ $t('lisaa-tekstikappale') }}
          </ep-button>
          <div v-else/>

          <ep-button variant="link" icon="roskalaatikko" @click="poistaTekstikappale(toteutus, vapaateksti)">
            {{ $t('poista-tekstikappale') }}
          </ep-button>
        </div>
      </ep-collapse>

      <ep-button variant="outline-primary" icon="plussa" v-if="isEditing && toteutus.vapaat.length === 0" @click="lisaaTekstikappale()">
        {{ $t('lisaa-tekstikappale') }}
      </ep-button>
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
import { Prop, Mixins, Component, Vue, InjectReactive } from 'vue-property-decorator';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import EpPerusteenTutkinnonOsa from '@/components/EpAmmatillinen/EpPerusteenTutkinnonOsa.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { VapaaTekstiDto, TutkinnonosaToteutusDto, TutkinnonosaDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpButton,
    EpContent,
    EpCollapse,
    EpField,
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

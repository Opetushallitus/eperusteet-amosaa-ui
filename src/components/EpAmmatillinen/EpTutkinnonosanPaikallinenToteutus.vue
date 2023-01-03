<template>
  <div>
    <ep-field v-if="isEditing" v-model="toteutus.otsikko" :is-editing="isEditing"></ep-field>

    <div class="pl-1 pr-4">
      <ep-collapse :collapsable="!isEditing">
        <h4 slot="header">{{$t('tutkintonimikkeet-ja-osaamisalat')}}</h4>
        <b-table striped responsive :items="tutkintonimiketaulu" :fields="tutkintonimikeFields" v-if="toteutus.koodit.length > 0">
          <template v-slot:cell(poista)="data">
            <ep-button class="p-0" variant="link" icon="roskalaatikko" @click="poistaTutkintonimike(data.item.koodiUri)">
              {{ $t('poista') }}
            </ep-button>
          </template>
        </b-table>

        <ep-button v-if="isEditing" variant="outline-primary" icon="plussa" @click="avaaTutkintonimikeModal(toteutus)">
          {{ $t('liita-tutkintonimike-tai-osaamisala') }}
        </ep-button>

      </ep-collapse>

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

    <b-modal ref="tutkintonimikeModal" size="lg" :hide-header-close="true" @ok="lisaaTutkintonimikeOsaamisalat">

      <template v-slot:modal-title>
        {{$t('liita-tutkintonimike-tai-osaamisala')}}
      </template>

      <b-table striped responsive :items="tutkintonimikkeet" :fields="modalFields" selectable select-mode="multi" @row-selected="onTutkintonimikeSelected" selected-variant=''>
        <template v-slot:cell(nimi)="data">
          <fas v-if="data.rowSelected" icon="check-square" class="checked mr-2"/>
          <fas v-else :icon="['far', 'square']" class="checked mr-2"/>
          {{$kaanna(data.item.nimi)}}
        </template>
      </b-table>

      <b-table striped responsive :items="osaamisalat" :fields="modalFields" selectable select-mode="multi" @row-selected="onOsaamisalaSelected" selected-variant=''>
        <template v-slot:cell(nimi)="data">
          <fas v-if="data.rowSelected" icon="check-square" class="checked mr-2"/>
          <fas v-else :icon="['far', 'square']" class="checked mr-2"/>
          {{$kaanna(data.item.nimi)}}
        </template>
      </b-table>

      <template v-slot:modal-cancel>
        {{ $t('peruuta')}}
      </template>
      <template v-slot:modal-ok >
        {{ $t('liita-valitut')}}
      </template>

    </b-modal>
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

  @Prop({ required: true })
  tutkintonimikkeet!: any;

  @Prop({ required: true })
  osaamisalat!: any;

  private valitutTutkintonimikkeet: any[] = [];
  private valitutOsaamisalat: any[] = [];
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

  get defaultFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi') as string,
      thStyle: { width: '40%' },
      formatter: (value: any, key: string, item: any) => {
        return this.$kaanna(value);
      },
    }, {
      key: 'koodiArvo',
      label: this.$t('koodi') as string,
    }] as any[];
  }

  get modalFields() {
    return this.defaultFields;
  }

  get tutkintonimikeFields() {
    let fields = this.defaultFields;

    if (this.isEditing) {
      fields = [
        ...fields,
        {
          key: 'poista',
          label: '',
          class: 'text-right',
        },
      ];
    }

    return fields;
  }

  get kaikkiKoodit() {
    return {
      ..._.keyBy(this.osaamisalat, 'koodiUri'),
      ..._.keyBy(this.tutkintonimikkeet, 'koodiUri'),
    };
  }

  get tutkintonimiketaulu() {
    return _.map(this.toteutus.koodit, koodi => this.kaikkiKoodit[koodi]);
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

  poistaTutkintonimike(koodiUri: string) {
    this.toteutus = {
      ...this.toteutus,
      koodit: _.filter(this.toteutus.koodit, koodi => koodi !== koodiUri),
    };
  }

  avaaTutkintonimikeModal(toteutus: TutkinnonosaToteutusDto) {
    (this as any).$refs.tutkintonimikeModal.show();
  }

  lisaaTutkintonimikeOsaamisalat() {
    this.toteutus = {
      ...this.toteutus,
      koodit: _.uniq([
        ...(this.toteutus.koodit || []),
        ...this.valitutTutkintonimikkeet,
        ...this.valitutOsaamisalat,
      ]),
    };
  }

  onTutkintonimikeSelected(items: any) {
    this.valitutTutkintonimikkeet = _.map(items, 'koodiUri');
  }

  onOsaamisalaSelected(items: any) {
    this.valitutOsaamisalat = _.map(items, 'koodiUri');
  }
}
</script>

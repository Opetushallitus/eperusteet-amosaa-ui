<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.tutkinnonosaViite.tekstiKappale.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">

        <b-form-group :label="$t('laajuus')">
          <span>{{data.perusteenTutkinnonosaViite.laajuus}} {{$t('osaamispiste')}}</span>
        </b-form-group>

        <h3 v-if="isEditing">{{$t('tutkinnon-osan-kuvaus')}}</h3>
        <ep-content layout="normal" v-model="data.tutkinnonosaViite.tekstiKappale.teksti" :is-editable="isEditing"> </ep-content>

        <h3 v-if="isEditing && data.tutkinnonosaViite.tosa.vapaat.length > 0" class="pt-5 pb-3">{{$t('tekstikappaleet')}}</h3>
        <ep-collapse v-for="(vapaaTk, index) in data.tutkinnonosaViite.tosa.vapaat" :key="'vapaatk'+index" :borderBottom="false" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
          <h3 slot="header" v-if="!isEditing">{{$kaanna(vapaaTk.nimi)}}</h3>
          <h4 slot="header" v-if="isEditing">{{$t('tekstikappaleen-otsikko')}}</h4>
          <ep-field v-if="isEditing" v-model="vapaaTk.nimi" :is-editing="isEditing"></ep-field>

          <h4 v-if="isEditing" class="pt-3">{{$t('tekstikappaleen-sisalto')}}</h4>
          <ep-content layout="normal" v-model="vapaaTk.teksti" :is-editable="isEditing"> </ep-content>

          <div class="d-flex justify-content-between pt-3" v-if="isEditing">
            <ep-button variant="outline-primary" icon="plussa" v-if="index+1 === data.tutkinnonosaViite.tosa.vapaat.length" @click="lisaaTekstikappale(data.tutkinnonosaViite.tosa)">
              {{ $t('lisaa-tekstikappale') }}
            </ep-button>
            <div v-else/>

            <ep-button variant="link" icon="roskalaatikko" @click="poistaTekstikappale(data.tutkinnonosaViite.tosa, vapaaTk)">
              {{ $t('poista-tekstikappale') }}
            </ep-button>
          </div>
        </ep-collapse>

        <ep-button class="pb-4 pt-3" variant="outline-primary" icon="plussa" v-if="isEditing && data.tutkinnonosaViite.tosa.vapaat.length === 0" @click="lisaaTekstikappale(data.tutkinnonosaViite.tosa)">
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>

        <b-tabs class="ml-0 pl-0 mt-4">
          <b-tab :title="$t('paikallinen-toteutus')">

            <h3 class="mt-4">{{$t('toteutukset')}}</h3>

             <draggable
                v-bind="toteutuksetOptions"
                tag="div"
                v-model="data.tutkinnonosaViite.tosa.toteutukset">

              <ep-collapse class="toteutus" v-for="(toteutus, index) in data.tutkinnonosaViite.tosa.toteutukset" :key="'toteutus'+index" :borderBottom="false" >
                <h4 slot="header" v-if="!isEditing">{{$kaanna(toteutus.otsikko)}}</h4>

                <div v-if="isEditing" slot="header" class="d-flex">
                  <fas icon="raahaus" class="raahaus"/>
                  <h4 slot="header">{{$t('toteutuksen-otsikko')}}</h4>
                </div>

                <ep-field v-if="isEditing" v-model="toteutus.otsikko" :is-editing="isEditing"></ep-field>

                <div class="pl-1 pr-4">
                  <ep-collapse :collapsable="!isEditing">
                    <h4 slot="header">{{$t('tutkintonimikkeet-ja-osaamisalat')}}</h4>
                    <b-table striped responsive :items="tutkintonimiketaulu(toteutus.koodit)" :fields="tutkintonimikeFields" v-if="toteutus.koodit.length > 0">
                      <template v-slot:cell(poista)="data">
                        <ep-button class="p-0" variant="link" icon="roskalaatikko" @click="poistaTutkintonimike(toteutus, data.item.koodiUri)">
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
                      <ep-button variant="outline-primary" icon="plussa" v-if="index+1 === toteutus.vapaat.length" @click="lisaaTekstikappale(toteutus)">
                        {{ $t('lisaa-tekstikappale') }}
                      </ep-button>
                      <div v-else/>

                      <ep-button variant="link" icon="roskalaatikko" @click="poistaTekstikappale(toteutus, vapaateksti)">
                        {{ $t('poista-tekstikappale') }}
                      </ep-button>
                    </div>
                  </ep-collapse>

                  <ep-button variant="outline-primary" icon="plussa" v-if="isEditing && toteutus.vapaat.length === 0" @click="lisaaTekstikappale(toteutus)">
                    {{ $t('lisaa-tekstikappale') }}
                  </ep-button>

                </div>

                <div class="d-flex justify-content-end pt-2 pr-4" v-if="isEditing">
                  <ep-button v-if="isEditing" variant="link" icon="roskalaatikko" @click="poistaToteutus(data.tutkinnonosaViite.tosa, toteutus)">
                    {{ $t('poista-toteutus') }}
                  </ep-button>
                </div>

              </ep-collapse>
            </draggable>

            <ep-button v-if="isEditing" variant="outline-primary" icon="plussa" @click="lisaaToteutus(data.tutkinnonosaViite.tosa)">
              {{ $t('lisaa-toteutus') }}
            </ep-button>

          </b-tab>

          <b-tab :title="$t('perusteen-sisalto')">

            <div class="d-flex pt-3">
              <b-form-group :label="$t('luotu')" class="flex-fill">
                <span>{{$sdt(data.perusteenTutkinnonosa.luotu)}}</span>
              </b-form-group>

              <b-form-group :label="$t('muokattu-viimeksi')" class="flex-fill">
                <span>{{$sdt(data.perusteenTutkinnonosa.muokattu)}}</span>
              </b-form-group>

              <div class="flex-fill" />
            </div>

            <hr/>

            <ep-collapse>
              <h3 slot="header">{{$t('ammattitaitovaatimukset')}}</h3>
              <ep-content layout="normal" v-model="data.perusteenTutkinnonosa.ammattitaitovaatimukset" :is-editable="false" />
            </ep-collapse>

            <ep-collapse>
              <h3 slot="header">{{$t('arviointi')}}</h3>

              <div v-if="data.perusteenTutkinnonosa.arviointi" class="ml-2">
                <div v-for="(arvioinninKohdealue, index) in data.perusteenTutkinnonosa.arviointi.arvioinninKohdealueet" :key="'aka'+index" class="mb-5">
                  <h3 class="mt-3">{{$kaanna(arvioinninKohdealue.otsikko)}}</h3>

                  <div v-for="(arvioinninkohde, index) in arvioinninKohdealue.arvioinninKohteet" :key="'arvioinninkohde'+index" class="mr-5">

                    <div class="mb-3 mt-4">
                      <h4>{{$t('arvioinnin-kohde')}}</h4>
                      <span>{{$kaanna(arvioinninkohde.selite)}}</span>
                    </div>

                    <b-table striped :items="arvioinninkohde.osaamistasonKriteerit" :fields="osaamistasonKriteeritFields">
                      <template v-slot:cell(osaamistaso)="{item}">
                        {{$kaanna(item.osaamistaso.otsikko)}}
                      </template>

                      <template v-slot:cell(kriteerit)="{item}">
                        <ul>
                          <li v-for="(kriteeri, index) in item.kriteerit" :key="'kriteeri'+index">
                            {{$kaanna(kriteeri)}}
                          </li>
                        </ul>
                      </template>
                    </b-table>

                  </div>
                </div>
              </div>

              <div v-if="data.perusteenTutkinnonosa.geneerinenArviointiasteikko" class="ml-2">

                <div class="mb-3 mt-3">
                  <h4>{{$t('arvioinnin-kohde')}}</h4>
                  <span>{{$kaanna(data.perusteenTutkinnonosa.geneerinenArviointiasteikko.kohde)}}</span>
                </div>

                <b-table striped :items="data.perusteenTutkinnonosa.geneerinenArviointiasteikko.osaamistasonKriteerit" :fields="osaamistasonKriteeritFields">
                  <template v-slot:cell(osaamistaso)="{item}">
                    {{$kaanna(item.osaamistaso.otsikko)}}
                  </template>

                  <template v-slot:cell(kriteerit)="{item}">
                    <ul>
                      <li v-for="(kriteeri, index) in item.kriteerit" :key="'kriteeri'+index">
                        {{$kaanna(kriteeri)}}
                      </li>
                    </ul>
                  </template>
                </b-table>
              </div>

            </ep-collapse>

            <ep-collapse>
              <h3 slot="header">{{$t('ammattitaidon-osoittaminen')}}</h3>
              <ep-content layout="normal" v-model="data.perusteenTutkinnonosa.ammattitaidonOsoittamistavat" :is-editable="false" />
            </ep-collapse>

            <ep-collapse v-for="(vapaaTeksti, index) in data.perusteenTutkinnonosa.vapaatTekstit" :key="'vapaaTekstit'+index">
              <h3 slot="header">{{$kaanna(vapaaTeksti.nimi)}}</h3>
              <ep-content layout="normal" v-model="vapaaTeksti.teksti" :is-editable="false" />
            </ep-collapse>

          </b-tab>

        </b-tabs>

      </template>

    </EpEditointi>

    <b-modal ref="tutkintonimikeModal" id="tutkintonimikeModal" size="lg" :hide-header-close="true" @ok="lisaaTutkintonimikeOsaamisalat">

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
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
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
import draggable from 'vuedraggable';

@Component({
  components: {
    EpEditointi,
    EpButton,
    EpSearch,
    EpSpinner,
    EpContent,
    EpCollapse,
    EpField,
    draggable,
  },
})
export default class RouteTutkinnonosa extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: string | number;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private sisaltoviiteId!: string | number;

  private editointiStore: EditointiStore | null = null;

  private valitutTutkintonimikkeet: any[] = [];
  private valitutOsaamisalat: any[] = [];
  private valittuToteutus: TutkinnonosaToteutusDto | null = null;
  private fetching = false;

  @Watch('toteutussuunnitelma', { immediate: true })
  toteutussuunnitelmaChange() {
    this.fetch();
  }

  @Watch('sisaltoviiteId', { immediate: true })
  sisaltoviiteChange() {
    this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  fetch() {
    if (this.toteutussuunnitelma) {
      this.editointiStore = new EditointiStore(
        new TutkinnonOsaStore(
          _.toNumber(this.toteutussuunnitelmaId),
          _.toString(this.koulutustoimijaId),
          _.toNumber(this.sisaltoviiteId),
          this.perusteId!,
          this.versionumero,
          this));
    }
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get perusteId() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value!.peruste!.id;
  }

  tutkintonimiketaulu(koodit: string[]) {
    return _.map(koodit, koodi => this.tutkintonimikeOsaamisalatByKoodiUri[koodi]);
  }

  get tutkintonimikkeet() {
    if (this.editointiStore && this.editointiStore.data.value) {
      return _.map(this.editointiStore.data.value.tutkintonimikkeet, tutkintonimike => {
        return {
          ...tutkintonimike,
          nimi: _.reduce(tutkintonimike.metadata, function(md: any, param) {
            md[_.toLower(param.kieli)] = param.nimi;
            return md;
          }, {}),
        };
      });
    }
  }

  get osaamisalat() {
    if (this.editointiStore && this.editointiStore.data.value) {
      return _.map(this.editointiStore!.data.value.osaamisalat, osaamisala => {
        return {
          ...osaamisala,
          koodiArvo: osaamisala.arvo,
          koodiUri: osaamisala.uri,
        };
      });
    }
  }

  get tutkintonimikeetByKoodiUri() {
    return _.keyBy(this.tutkintonimikkeet, 'koodiUri');
  }

  get osaamisalatByKoodiUri() {
    return _.keyBy(this.osaamisalat, 'koodiUri');
  }

  get tutkintonimikeOsaamisalatByKoodiUri() {
    return {
      ...this.tutkintonimikeetByKoodiUri,
      ...this.osaamisalatByKoodiUri,
    };
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

    if (this.editointiStore!.isEditing.value) {
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

  lisaaTekstikappale(toteutus: TutkinnonosaToteutusDto | TutkinnonosaDto) {
    toteutus.vapaat = [
      ..._.toArray(toteutus.vapaat),
      {},
    ];
  }

  poistaTekstikappale(toteutus: TutkinnonosaToteutusDto | TutkinnonosaDto, vapaaTeksti: VapaaTekstiDto) {
    toteutus.vapaat = _.filter(toteutus.vapaat, vpTeksti => vpTeksti !== vapaaTeksti);
  }

  lisaaToteutus(tosa: TutkinnonosaDto) {
    tosa.toteutukset = [
      ..._.toArray(tosa.toteutukset),
      {
        tavatjaymparisto: {},
        arvioinnista: {},
        vapaat: [],
        koodit: [],
      },
    ];
  }

  poistaToteutus(tosa: TutkinnonosaDto, toteutus: TutkinnonosaToteutusDto) {
    tosa.toteutukset = _.filter(tosa.toteutukset, tosaToteutus => tosaToteutus !== toteutus);
  }

  poistaTutkintonimike(toteutus: TutkinnonosaToteutusDto, koodiUri: string) {
    toteutus.koodit = _.filter(toteutus.koodit, koodi => koodi !== koodiUri);
  }

  avaaTutkintonimikeModal(toteutus: TutkinnonosaToteutusDto) {
    this.valittuToteutus = toteutus;
    (this as any).$refs.tutkintonimikeModal.show();
  }

  lisaaTutkintonimikeOsaamisalat() {
    if (this.valittuToteutus) {
      this.valittuToteutus.koodit = _.uniq([
        ..._.toArray(this.valittuToteutus.koodit),
        ...this.valitutTutkintonimikkeet,
        ...this.valitutOsaamisalat,
      ]);
    }
  }

  onTutkintonimikeSelected(items: any) {
    this.valitutTutkintonimikkeet = _.map(items, 'koodiUri');
  }

  onOsaamisalaSelected(items: any) {
    this.valitutOsaamisalat = _.map(items, 'koodiUri');
  }

  get toteutuksetOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      disabled: !this.editointiStore!.isEditing.value,
      forceFallback: true,
      group: {
        name: 'toteutukset',
        pull: 'clone',
        put: false,
        revertClone: true,
      },
    };
  }

  get osaamistasonKriteeritFields() {
    return [{
      key: 'osaamistaso',
      label: this.$t('osaamistaso') as string,
      thStyle: { width: '40%' },
    }, {
      key: 'kriteerit',
      label: this.$t('kriteerit') as string,
    }] as any[];
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

  ::v-deep .nav-tabs li:first-child a {
    margin-left: 0px !important;
  }

  ::v-deep .ep-button.p-0 .btn {
    padding: 0px;
  }

  ::v-deep .pt-0 .ep-collapse {
    padding-top: 0px;
  }

  ::v-deep .pb-0 .ep-collapse {
    padding-bottom: 0px;
  }

  .toteutus {
    border-radius: 0.75rem;
    padding: 0px 10px;
    margin-bottom: 20px;
    @include tile-background-shadow;
  }

  .checked {
    color: $paletti-blue;
  }

  .raahaus {
    margin-top: 4px;
    color: $gray-lighten-1;
  }

</style>

<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero" :labelCopyConfirm="'kopioidaanko-tutkinnonosa'">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.tutkinnonosaViite.tekstiKappale.nimi) }}<span v-if="laajuus">, {{laajuus}} {{$t('osaamispiste')}}</span></h2>
      </template>
      <template v-slot:default="{ data, isEditing }">
        <div class="alert alert-info" v-if="data.tutkinnonosaViite.tyyppi === 'linkki'">
          <router-link :to="{ name: 'tutkinnonosa', params: { toteutussuunnitelmaId: data.tutkinnonosaViite.linkattuOps, sisaltoviiteId: data.tutkinnonosaViite.linkattuSisaltoViiteId } }">
            {{ $t('siirry-alkuperaiseen-toteutukseen') }}
          </router-link>
        </div>

        <b-form-group class="flex-grow-1 mr-5" :label="$t('tutkinnon-osan-nimi') +' *'"
          v-if="data.tutkinnonosaViite.tosa.tyyppi !== 'perusteesta' && isEditing">
          <ep-field
            v-model="data.tutkinnonosaViite.tekstiKappale.nimi"
            :is-editing="isEditing"
            :validation="$v.nimi">
          </ep-field>
        </b-form-group>

        <b-form-group :label="$t('koodi')" v-if="data.perusteenTutkinnonosa">
          <span>{{ data.perusteenTutkinnonosa.koodi.arvo }}</span>
        </b-form-group>

        <div class="d-flex justify-content-between" v-if="data.tutkinnonosaViite.tosa.tyyppi !== 'perusteesta'">
          <b-form-group class="flex-grow-1 mr-5">
            <div slot="label" class="d-flex">
              <span>{{$t('koodi')}}</span>
              <EpInfoPopover class="ml-2" v-if="isEditing">
                {{ $t('paikallinen-tutkinnon-osa-koodi-selite') }}
              </EpInfoPopover>
            </div>
            <ep-field v-model="data.omaTutkinnonosa.koodi" type="string" :is-editing="isEditing" :validation="$v.omaTutkinnonosa.koodi"></ep-field>
          </b-form-group>

          <b-form-group :label="$t('laajuus')" v-if="data.omaTutkinnonosa && isEditing">
            <div class="d-flex align-items-center" >
              <ep-field type="number" v-model="data.omaTutkinnonosa.laajuus" :is-editing="isEditing"></ep-field>
            </div>
          </b-form-group>
        </div>

        <div v-if="data.perusteenTutkinnonosa">
          <h3>{{$t('tutkinnon-osan-kuvaus')}}</h3>
          <ep-content layout="normal" v-model="data.perusteenTutkinnonosa.kuvaus" />
        </div>

        <h3 v-if="isEditing">{{$t('paikallinen-tarkennus')}}</h3>
        <ep-content layout="normal" v-model="data.tutkinnonosaViite.tekstiKappale.teksti" :is-editable="isEditing"> </ep-content>

        <h3 v-if="isEditing && data.tutkinnonosaViite.tosa.vapaat.length > 0" class="pt-5 pb-3">{{$t('tekstikappaleet')}}</h3>
        <ep-collapse v-for="(vapaaTk, index) in data.tutkinnonosaViite.tosa.vapaat" :key="'vapaatk'+index" :borderBottom="false" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
          <h3 slot="header" v-if="!isEditing">{{$kaanna(vapaaTk.nimi)}}</h3>
          <h4 slot="header" v-if="isEditing">{{$t('tekstikappaleen-otsikko')}}</h4>
          <ep-field v-if="isEditing" v-model="vapaaTk.nimi" :is-editing="isEditing"></ep-field>

          <h4 v-if="isEditing" class="pt-3">{{$t('tekstikappaleen-sisalto')}}</h4>
          <ep-content layout="normal" v-model="vapaaTk.teksti" :is-editable="isEditing"> </ep-content>

          <div class="d-flex justify-content-between pt-3" v-if="isEditing">
            <ep-button variant="outline-primary" icon="add" v-if="index+1 === data.tutkinnonosaViite.tosa.vapaat.length" @click="lisaaTekstikappale(data.tutkinnonosaViite.tosa)">
              {{ $t('lisaa-tekstikappale') }}
            </ep-button>
            <div v-else/>

            <ep-button variant="link" icon="delete" @click="poistaTekstikappale(data.tutkinnonosaViite.tosa, vapaaTk)">
              {{ $t('poista-tekstikappale') }}
            </ep-button>
          </div>
        </ep-collapse>

        <ep-button class="pb-4 pt-3" variant="outline-primary" icon="add" v-if="isEditing && data.tutkinnonosaViite.tosa.vapaat.length === 0" @click="lisaaTekstikappale(data.tutkinnonosaViite.tosa)">
          {{ $t('lisaa-tekstikappale') }}
        </ep-button>

        <div v-if="tutkinnonosaPerusteesta && data.perusteenTutkinnonosa.tyyppi === 'reformi_tutke2'">
          <EpYhteiset v-model="data.tutkinnonosaViite" :perusteen="data.perusteenTutkinnonosa" :is-editing="isEditing">
            <div slot="uusiosaalue" v-if="!isEditing && data.tutkinnonosaViite.tyyppi !== 'linkki'">
              <ep-button @click="lisaaOsaAlue()" variant="outline" icon="add" :show-spinner="lisataanOsaAlue">
                {{ $t('lisaa-osa-alue') }}
              </ep-button>
            </div>
          </EpYhteiset>
        </div>
        <div v-else-if="tutkinnonosaPerusteesta && data.perusteenTutkinnonosa.tyyppi === 'tutke2'">
          {{ $t('vanhoja-perustetyyppeja-ei-tueta') }}
        </div>
        <b-tabs class="ml-0 pl-0 mt-4" v-else>
          <b-tab :title="$t('paikallinen-toteutus')">

            <h3 class="mt-4">{{$t('toteutukset')}}</h3>

            <EpTutkinnonosanPaikallisetToteutukset v-model="data.tutkinnonosaViite.tosa.toteutukset"
                                      :isEditing="isEditing && data.tutkinnonosaViite.tyyppi !== 'linkki'"
                                      :tyyppi="data.tutkinnonosaViite.tyyppi"/>
          </b-tab>

          <b-tab v-if="tutkinnonosaPerusteesta" :title="$t('perusteen-sisalto')">
            <EpPerusteenTutkinnonOsa :tutkinnonosa="data.perusteenTutkinnonosa"
                                     :arviointiasteikot="data.arviointiasteikot" />
          </b-tab>

          <b-tab v-else :title="$t('sisalto')">
            <b-form-group>
              <h3 slot="label" class="pt-3">{{$t('ammattitaitovaatimukset')}}</h3>

              <EpAmmattitaitovaatimuksetLista
                v-if="isAmmattitaitovaatimuksetLista"
                v-model="data.omaTutkinnonosa.ammattitaitovaatimuksetLista[0].vaatimuksenKohteet"
                :is-editing="isEditing"/>

              <EpAmmattitaitovaatimukset
                v-else
                v-model="data.omaTutkinnonosa.ammattitaitovaatimukset"
                :is-editing="isEditing" />
            </b-form-group>

            <b-form-group>
              <h3 slot="label" class="pt-3">{{$t('arviointi')}}</h3>

              <EpArvioinninKohdeAlueet
                v-if="valittuArviointiTyyppi !== 'geneerinen'"
                v-model="data.omaTutkinnonosa.arviointi.arvioinninKohdealueet"
                :arviointiasteikot="data.arviointiasteikot"
                :is-editing="isEditing"/>

              <EpButton v-if="isEditing && !valittuArviointiTyyppi"
                      variant="outline"
                      icon="add"
                      @click="arvioinninTyyppi = 'geneerinen'">
                {{$t('lisaa-geneerinen-arviointi')}}
              </EpButton>

              <GeneerinenArviointi
                v-if="valittuArviointiTyyppi === 'geneerinen'"
                :is-editing="isEditing"
                v-model="data.omaTutkinnonosa.geneerinenarviointi">
                <div slot="header"></div>
              </GeneerinenArviointi>

              <EpButton v-if="isEditing && data.omaTutkinnonosa.geneerinenarviointi"
                class="no-padding"
                variant="link"
                icon="delete"
                @click="poistaGeneerinenaArviointi">
                {{$t('poista-geneerinen-arviointi')}}
              </EpButton>
            </b-form-group>

            <b-form-group>
              <h3 slot="label" class="pt-3">{{$t('ammattitaidon-osoittamistavat')}}</h3>
              <ep-content layout="normal" v-model="data.omaTutkinnonosa.ammattitaidonOsoittamistavat" :is-editable="isEditing"> </ep-content>
            </b-form-group>

          </b-tab>

        </b-tabs>

      </template>

    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Watch, Mixins } from 'vue-property-decorator';
import { TutkinnonOsaStore } from '@/stores/TutkinnonOsaStore';
import EpPerusteenTutkinnonOsa from '@/components/EpAmmatillinen/EpPerusteenTutkinnonOsa.vue';
import EpTutkinnonosanPaikallisetToteutukset from '@/components/EpAmmatillinen/EpTutkinnonosanPaikallisetToteutukset.vue';
import EpAmmattitaitovaatimuksetLista from '@/components/EpAmmatillinen/EpAmmattitaitovaatimuksetLista.vue';
import EpYhteiset from '@/components/EpAmmatillinen/EpYhteiset.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { VapaaTekstiDto, TutkinnonosaToteutusDto, TutkinnonosaDto } from '@shared/api/amosaa';
import draggable from 'vuedraggable';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import GeneerinenArviointi from '@/components/EpAmmatillinen/GeneerinenArviointi.vue';
import { Validations } from 'vuelidate-property-decorators';
import { koodiValidator, requiredOneLang } from '@shared/validators/required';
import { validationMixin } from 'vuelidate';
import EpArvioinninKohdeAlueet from '@shared/components/EpArviointi/EpArvioinninKohdeAlueet.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';

@Component({
  components: {
    EpArvioinninKohdeAlueet,
    EpAmmattitaitovaatimukset,
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpField,
    EpTutkinnonosanPaikallisetToteutukset,
    EpPerusteenTutkinnonOsa,
    EpSearch,
    EpSpinner,
    EpYhteiset,
    GeneerinenArviointi,
    draggable,
    EpAmmattitaitovaatimuksetLista,
  },
})
export default class RouteTutkinnonosa extends Mixins(validationMixin) {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private sisaltoviiteId!: string | number;

  private editointiStore: EditointiStore | null = null;
  private lisataanOsaAlue = false;
  private arvioinninTyyppi: 'geneerinen' | 'tutkinnonosa-kohtainen' | null = null;

  mounted() {
    this.$v.$touch();
  }

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
          this,
          this.uusi));
    }
  }

  get uusi() {
    return this.$route.query && _.has(this.$route.query, 'uusi');
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

  get tutkinnonosaPerusteesta() {
    if (this.editointiStore && this.editointiStore.data.value) {
      return this.editointiStore.data.value.tutkinnonosaViite.tosa.tyyppi === 'perusteesta';
    }
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

  poistaToteutus(tosa: TutkinnonosaDto, toteutus: TutkinnonosaToteutusDto) {
    tosa.toteutukset = _.filter(tosa.toteutukset, tosaToteutus => tosaToteutus !== toteutus);
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

  get nimi() {
    return this.editointiStore?.data?.value?.tutkinnonosaViite.tekstiKappale.nimi;
  }

  get omaTutkinnonosa() {
    return this.editointiStore?.data?.value?.omaTutkinnonosa;
  }

  get laajuus() {
    return this.editointiStore?.data?.value?.perusteenTutkinnonosaViite?.laajuus || this.editointiStore?.data?.value?.omaTutkinnonosa?.laajuus;
  }

  @Validations()
  validations = {
    nimi: requiredOneLang(),
    omaTutkinnonosa: {
      ...koodiValidator(4, true, true),
    },
  };

  async updateNavigation() {
    await this.toteutussuunnitelmaStore.initNavigation();
  }

  async lisaaOsaAlue() {
    this.lisataanOsaAlue = true;
    const uusiOsaAlueId = await TutkinnonOsaStore.lisaaOsaAlue(this.toteutussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, this);
    await this.updateNavigation();
    if (uusiOsaAlueId) {
      this.$router.push({
        name: 'osaalue',
        params: {
          osaalueId: _.toString(uusiOsaAlueId),
        },
      });
    }
  }

  get isAmmattitaitovaatimuksetLista() {
    return _.size(_.get(this.editointiStore?.data?.value, 'omaTutkinnonosa.ammattitaitovaatimuksetLista[0].vaatimuksenKohteet')) > 0;
  }

  get isVanhaArviointi() {
    return _.size(_.get(this.editointiStore?.data?.value, 'omaTutkinnonosa.arviointi.arvioinninKohdealueet')) > 0;
  }

  get valittuArviointiTyyppi() {
    if (this.editointiStore?.data?.value.omaTutkinnonosa.geneerinenarviointi) {
      return 'geneerinen';
    }

    if (_.size(_.get(this.editointiStore?.data?.value, 'omaTutkinnonosa.arviointi.arvioinninKohdealueet')) > 0) {
      return 'tutkinnonosakohtainen';
    }

    return this.arvioinninTyyppi;
  }

  poistaGeneerinenaArviointi() {
    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      omaTutkinnonosa: {
        ...this.editointiStore?.data.value.omaTutkinnonosa,
        geneerinenarviointi: null,
      },
    });

    this.arvioinninTyyppi = null;
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

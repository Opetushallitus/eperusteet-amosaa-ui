<template>
  <ep-main-view :tutoriaaliStore="tutoriaaliStore" :container="true">
    <template slot="icon">

    </template>
    <template slot="header">
      <div class="text-left">
        <h1>{{ $t('usein-kysytyt-kysymykset') }}</h1>
        <p>{{ $t('ukk-kuvaus-nakyma') }}</p>
        <ep-spinner v-if="isLoading"></ep-spinner>
        <div v-else>
          <div class="d-flex justify-content-between align-items-end pb-3">
            <ep-search v-model="rajain"></ep-search>

            <ep-button variant="outline-primary" icon="plussa" @click="startKysymysModal(null)">
              {{ $t('lisaa-uusi-kysymys') }}
            </ep-button>
          </div>
          <b-form-group :label="$t('nayta-sisalto-jonka-on-luonut')" class="w-50">
            <ep-multi-select
              v-model="koulutustoimijaRajaus"
              :options="koulutustoimijat"
              :multiple="true"
              :searchable="true"
              :close-on-select="false"
              :clear-on-select="false"
              :search-identity="nimiSearchIdentity"
              track-by="id"
              :placeholder="$t('valitse-organisaatio')"
              :customLabel="({nimi}) => $kaanna(nimi)">
              <template v-slot:option="{ option }">
                {{ $kaanna(option.nimi) }}
              </template>
            </ep-multi-select>
          </b-form-group>
        </div>
      </div>
    </template>

     <template slot="custom-content">
      <div v-if="!isLoading">
        <div class="row" v-for="(ohje, index) in filteredOhjeet" :key="'ohje'+index">
          <div class="col text-left">
            <div class="float-right">
              <button class="btn btn-link" @click="startKysymysModal(ohje)">
                <fas icon="pen">
                </fas>
              </button>
              <button class="btn btn-link" @click="startRemoveKysymys(ohje)">
                <fas icon="roskalaatikko">
                </fas>
              </button>
            </div>
            <div>
              <div v-if="ohje.muokattu"
                   class="text-secondary muokattu pb-1">
                {{ $ago(ohje.muokattu) }}
              </div>
              <h4 v-html="$kaanna(ohje.lokalisoituKysymys)"></h4>
              <div class="text-secondary">
                <ep-content layout="normal" :value="ohje.lokalisoituVastaus"></ep-content>
              </div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template slot="after">
      <b-modal class="backdrop" id="createUpdateKysymys" ref="createUpdateKysymys" @ok="createUpdateKysymys" :no-close-on-backdrop="true" :no-enforce-focus="true" :lazy="true" :ok-disabled="$v.$invalid" size="lg">
        <template slot="modal-title">
          <span class="mr-2">{{ !ohje.id ? $t('lisaa-uusi-kysymys') : $t('muokkaa-kysymys') }}</span>
          <ep-kielivalinta />
        </template>
        <ep-form-content name="kysymys-nimi">
          <ep-content v-model="ohje.lokalisoituKysymys" help="kysymys-nimi-ohje" layout="normal" :validation="$v.ohje.lokalisoituKysymys" :is-editable="true">
          </ep-content>
        </ep-form-content>
        <ep-form-content name="kysymys-vastaus">
          <ep-content v-model="ohje.lokalisoituVastaus" help="kysymys-vastaus-ohje" layout="normal" :validation="$v.ohje.lokalisoituVastaus" :is-editable="true">
          </ep-content>
        </ep-form-content>
        <ep-form-content name="nayta-organisaatioissa">
          <b-form-checkbox class="pb-2" v-model="valitseKaikkiOrganisaatiot" @change="valitseKaikkiOrganisaatiotChange">
            {{$t('valitse-kaikki')}}
          </b-form-checkbox>
          <b-form-checkbox-group v-model="ohje.koulutustoimijat" stacked>
            <b-form-checkbox v-for="(koulutustoimija, index) in koulutustoimijat" :key="'modalktvalinta'+index" :value="koulutustoimija">
              {{ $kaanna(koulutustoimija.nimi) }}
            </b-form-checkbox>
          </b-form-checkbox-group>
        </ep-form-content>
        <template slot="modal-cancel">{{ $t('peruuta') }}</template>
        <template slot="modal-ok">{{ !ohje.id ? $t('lisaa-kysymys') : $t('tallenna') }}</template>
      </b-modal>

      <b-modal class="backdrop" id="removeKysymys" ref="removeKysymys" @ok="deleteKysymys" :lazy="true" size="lg">
        <span class="mr-2">{{ $t('haluatko-poistaa-kysymyksen') }}</span>
        <template slot="modal-cancel">{{ $t('peruuta') }}</template>
        <template slot="modal-ok">{{ $t('poista') }}</template>
      </b-modal>
    </template>
  </ep-main-view>
</template>

<script lang="ts">
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpListSelect from '@shared/components/forms/EpListSelect.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';

import { TutoriaaliStore } from '@shared/stores/tutoriaali';
import { OhjeetStore } from '@/stores/OhjeetStore';
import { OhjeDto } from '@shared/api/amosaa';
import { required } from 'vuelidate/lib/validators';
import { validationMixin } from 'vuelidate';
import { Kielet, UiKielet } from '@shared/stores/kieli';
import { requiredOneLang, translated } from '@shared/validators/required';
import { Kieli } from '@shared/tyypit';
import { KayttajaStore } from '@/stores/kayttaja';
import { KoulutustoimijaBaseDto } from '../../eperusteet-frontend-utils/vue/src/generated/amosaa';
import { Toteutus } from '@shared/utils/perusteet';

@Component({
  components: {
    EpButton,
    EpContent,
    EpFormContent,
    EpKielivalinta,
    EpListSelect,
    EpMainView,
    EpSearch,
    EpSpinner,
    EpMultiSelect,
  },
  validations() {
    return {
      ohje: {
        lokalisoituKysymys: requiredOneLang(),
        lokalisoituVastaus: requiredOneLang(),
      },
    };
  },
} as any)
export default class RouteUkk extends Mixins(validationMixin) {
  @Prop({ required: true })
  private tutoriaaliStore!: TutoriaaliStore;

  @Prop({ required: true })
  private ohjeetStore!: OhjeetStore;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  private rajain: string = '';
  private ohje: OhjeDto = {};
  private koulutustoimijaRajaus: KoulutustoimijaBaseDto[] = [];
  private valitseKaikkiOrganisaatiot = false;

  async mounted() {
    this.ohjeetStore.fetch(this.toteutus);
  }

  get isLoading() {
    return !_.isArray(this.ohjeetStore.ohjeet.value);
  }

  get filteredOhjeet() {
    return _.chain(this.ohjeet)
      .filter(ohje => _.includes(
        _.toLower(_.get(ohje, 'lokalisoituKysymys.' + Kielet.getSisaltoKieli.value)),
        _.toLower(this.rajain)
      ) || _.includes(
        _.toLower(_.get(ohje, 'lokalisoituVastaus.' + Kielet.getSisaltoKieli.value)),
        _.toLower(this.rajain)
      )
      )
      .filter(ohje => _.isEmpty(this.koulutustoimijaRajaus) || _.some(_.map(this.koulutustoimijaRajaus, 'id'), ktId => _.includes(_.map(ohje.koulutustoimijat, 'id'), ktId)))
      .sortBy((k: any) => -k.muokattu)
      .value();
  }

  get ohjeet() {
    return _.map(this.ohjeetStore.ohjeet.value, ohje => {
      return {
        ...ohje,
        lokalisoituKysymys: ohje.lokalisoituKysymys ? ohje.lokalisoituKysymys : { [Kielet.getSisaltoKieli.value]: ohje.kysymys },
        lokalisoituVastaus: ohje.lokalisoituVastaus ? ohje.lokalisoituVastaus : { [Kielet.getSisaltoKieli.value]: ohje.vastaus },
      };
    });
  }

  startKysymysModal(ohje: OhjeDto | null) {
    this.valitseKaikkiOrganisaatiot = false;

    if (ohje) {
      this.ohje = _.cloneDeep(ohje);
    }
    else {
      this.ohje = {
        koulutustoimijat: [],
      };
    }
    (this as any).$refs.createUpdateKysymys.show();
  }

  startRemoveKysymys(ohje: OhjeDto) {
    this.ohje = _.cloneDeep(ohje);
    (this as any).$refs.removeKysymys.show();
  }

  async createUpdateKysymys(event: any) {
    event.preventDefault(); // Piilotetaan modaali myöhemmin
    await this.ohjeetStore.save({
      ...this.ohje,
      toteutus: this.toteutus as any,
    });
    (this as any).$refs.createUpdateKysymys.hide();
  }

  async deleteKysymys() {
    if (!this.ohje || !this.ohje.id) {
      return;
    }

    await this.ohjeetStore.delete(this.ohje);
  }

  get koulutustoimijat() {
    return this.kayttajaStore.koulutustoimijat.value;
  }

  nimiSearchIdentity(obj: any) {
    return _.toLower(this.$kaanna(obj.nimi));
  }

  valitseKaikkiOrganisaatiotChange(val) {
    if (val) {
      this.ohje.koulutustoimijat = _.cloneDeep(this.koulutustoimijat) as KoulutustoimijaBaseDto[];
    }
    else {
      this.ohje.koulutustoimijat = [];
    }
  }
}
</script>

<style scoped lang="scss">

  .muokattu {
    font-size: 0.8rem;
  }

</style>

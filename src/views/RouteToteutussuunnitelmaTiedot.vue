<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t(kielistykset['title']) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">

        <b-form-group :label="$t(kielistykset['nimi'])">
          <ep-field v-model="data.opetussuunnitelma.nimi" :is-editing="isEditing" :validation="validation.opetussuunnitelma.nimi"></ep-field>
        </b-form-group>

        <b-form-group :label="$t('tiivistelma')">
          <ep-content layout="normal" v-model="data.opetussuunnitelma.kuvaus" :is-editable="isEditing"> </ep-content>
        </b-form-group>

        <b-container fluid>
          <b-row>
            <b-col>
              <b-form-group :label="$t('paatosnumero')">
                <ep-field v-model="data.opetussuunnitelma.paatosnumero" :is-editing="isEditing" type="string"></ep-field>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group :label="$t('paatospaivamaara')">
                <ep-datepicker v-model="data.opetussuunnitelma.paatospaivamaara" :is-editing="isEditing" type="sd"/>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group :label="$t('hyvaksyja')">
                <ep-field v-model="data.opetussuunnitelma.hyvaksyja" :is-editing="isEditing" type="string"></ep-field>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group :label="$t('voimassaolo')">
                <div class="d-flex align-items-center">
                  <ep-datepicker v-model="data.opetussuunnitelma.voimaantulo" :is-editing="isEditing" type="sd" :validation="validation.opetussuunnitelma.voimaantulo"/>
                  <div class="ml-2 mr-2">-</div>
                  <ep-datepicker v-model="data.opetussuunnitelma.paatospaivamaara" :is-editing="isEditing" type="sd" :validation="validation.opetussuunnitelma.paatospaivamaara"/>
                </div>
              </b-form-group>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-group :label="$t('julkaisukielet')">
                <b-form-checkbox-group v-if="isEditing" v-model="data.opetussuunnitelma.julkaisukielet" stacked>
                  <b-form-checkbox v-for="kieli in kielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}
                  </b-form-checkbox>
                </b-form-checkbox-group>
                <div v-else class="text-nowrap">
                  <span v-for="(kieli, idx) in data.opetussuunnitelma.julkaisukielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}<span class="mr-0" v-if="idx < data.opetussuunnitelma.julkaisukielet.length - 1">,</span>
                  </span>
                </div>
              </b-form-group>
            </b-col>
            <b-col v-if="!isOpsPohja">
              <b-form-group :label="$t('esikatselu')">
                <ep-toggle v-model="data.opetussuunnitelma.esikatseltavissa" :is-editing="isEditing" v-if="isEditing || !data.opetussuunnitelma.esikatseltavissa">
                  {{$t('salli-opetussuunnitelman-esikatselu')}}
                </ep-toggle>
                <ep-external-link :url="data.opetussuunnitelma.toteutussuunnitelmaUrl" v-if="!isEditing && data.opetussuunnitelma.esikatseltavissa">
                  {{$t('esikatsele-toteutussuunnitelmaa')}}
                </ep-external-link>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row>
            <b-col v-if="showOpetussuunnitelmaOppilaitostyyppi">
              <b-form-group :label="$t('oppilaitoksen-tyyppi')">
                <ep-select v-if="isEditing" :items="oppilaitostyypit" v-model="data.opetussuunnitelma.oppilaitosTyyppiKoodiUri" :isEditing="isEditing" :enableEmptyOption="true">
                  <template slot-scope="{ item }">
                    {{kaannaOppilaitosNimi(item)}}
                  </template>
                </ep-select>
                <div v-else>
                  {{kaannaOppilaitosNimi(data.opetussuunnitelma.oppilaitosTyyppiKoodiUri)}}
                </div>
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group :label="$t('tila')">
                {{$t(data.opetussuunnitelma.tila)}}
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <div v-if="data.peruste">
          <hr/>
          <h3>{{$t('perusteen-tiedot')}}</h3>

          <b-container fluid>
            <b-row>
              <b-col>
                <b-form-group :label="$t('tutkinto')">
                  <div>{{$kaanna(data.peruste.nimi)}}</div>
                  <div>({{data.peruste.diaarinumero}})</div>
                </b-form-group>
              </b-col>
              <b-col>
                <b-form-group :label="$t('voimassaolo')">
                  <div><span v-if="data.peruste.voimassaoloAlkaa">{{$sd(data.peruste.voimassaoloAlkaa)}}</span> - <span v-if="data.peruste.voimassaoloLoppuu">{{$sd(data.peruste.voimassaoloLoppuu)}}</span></div>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-group :label="$t('koulutukset')">
                  <div v-for="(koulutus, index) in data.peruste.koulutukset" :key="'koulutus'+index">
                    {{$kaanna(koulutus.nimi)}} ({{koulutus.koulutuskoodiArvo}})
                  </div>
                </b-form-group>
              </b-col>
            </b-row>
          </b-container>
        </div>

        <div v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'toteutussuunnitelma' }" v-if="!isOpsPohja">
          <hr/>
          <h3>{{$t('toiminnot')}}</h3>
          <ep-siirto-modal :koulutustoimija-id="koulutustoimijaId" :toteutussuunnitelma="editointiStore.data.value.opetussuunnitelma"></ep-siirto-modal>
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { UiKielet } from '@shared/stores/kieli';
import { ToteutussuunnitelmaTiedotStore } from '@/stores/ToteutussuunnitelmaTiedotStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpSiirtoModal from '@/components/EpSiirtoModal/EpSiirtoModal.vue';
import { OpetussuunnitelmaTyyppi, Toteutus, ToteutussuunnitelmaTiedotKielistykset, OpetussuunnitelmaOppilaitostyyppi } from '@/utils/toteutustypes';
import { Murupolku } from '@shared/stores/murupolku';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpSelect from '@shared/components/forms/EpSelect.vue';

@Component({
  components: {
    EpEditointi,
    EpContent,
    EpField,
    EpDatepicker,
    EpExternalLink,
    EpSiirtoModal,
    EpToggle,
    EpSelect,
  },
})
export default class RouteToteutussuunnitelmaTiedot extends Vue {
  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  private toteutussuunnitelmaStore?: ToteutussuunnitelmaStore;

  private editointiStore: EditointiStore | null = null;

  private readonly oppilaitostyyppiKoodisto = new KoodistoSelectStore({
    async query(query: string, sivu = 0) {
      return (await Koodisto.kaikkiSivutettuna('vapaasivistystyooppilaitostyyppi', query, {
        params: {
          sivu,
          sivukoko: 50,
        },
      })).data as any;
    },
  });

  async mounted() {
    Murupolku.aseta('toteutussuunnitelmantiedot', '...');
    await this.fetch();
    Murupolku.aseta('toteutussuunnitelmantiedot', this.$t(OpetussuunnitelmaTyyppi[this.opetussuunnitelmaTyyppi]));

    if (this.showOpetussuunnitelmaOppilaitostyyppi) {
      await this.oppilaitostyyppiKoodisto.query();
    }
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  fetch() {
    if (!(this.editointiStore && this.editointiStore.isLoading.value)) {
      this.editointiStore = new EditointiStore(
        new ToteutussuunnitelmaTiedotStore(
          this.toteutussuunnitelmaId,
          this.koulutustoimijaId,
          this.versionumero,
          this.toteutus,
          this.toteutussuunnitelmaStore!,
        )
      );
    }
  }

  @Watch('isOpsPohja')
  isPohjaChange() {
    Murupolku.aseta('toteutussuunnitelmantiedot', this.$t(OpetussuunnitelmaTyyppi[this.opetussuunnitelmaTyyppi]));
  }

  get kielet() {
    return UiKielet;
  }

  get toteutussuunnitelmaId(): number {
    return _.toNumber(this.$route.params.toteutussuunnitelmaId);
  }

  get koulutustoimijaId(): string {
    return this.$route.params.koulutustoimijaId;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get kielistykset() {
    return ToteutussuunnitelmaTiedotKielistykset[this.opetussuunnitelmaTyyppi];
  }

  get opetussuunnitelmaTyyppi() {
    return this.isOpsPohja ? OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA : this.toteutus;
  }

  get isOpsPohja() {
    return this.editointiStore?.data.value?.opetussuunnitelma.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
  }

  get showOpetussuunnitelmaOppilaitostyyppi() {
    return OpetussuunnitelmaOppilaitostyyppi[this.toteutus];
  }

  get oppilaitostyypit() {
    return _.chain(_.get(this.oppilaitostyyppiKoodisto.data.value, 'data'))
      .map(koodi => koodi.koodiUri)
      .value();
  }

  get oppilaitostyypitNimi() {
    return _.chain(_.get(this.oppilaitostyyppiKoodisto.data.value, 'data'))
      .map(koodi => {
        return {
          koodiUri: koodi.koodiUri,
          nimi: _.mapValues(_.keyBy(koodi.metadata, v => _.toLower(v.kieli)), v => v.nimi),
        };
      })
      .keyBy('koodiUri')
      .value();
  }

  kaannaOppilaitosNimi(koodiUri) {
    if (this.oppilaitostyypitNimi[koodiUri]) {
      return this.$kaanna(this.oppilaitostyypitNimi[koodiUri].nimi);
    }

    return koodiUri;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep .siirra-opetussuunnitelma.ep-button .btn .teksti, ::v-deep .siirra-opetussuunnitelma.ep-button .btn{
    padding-left: 0px !important;
  }

</style>

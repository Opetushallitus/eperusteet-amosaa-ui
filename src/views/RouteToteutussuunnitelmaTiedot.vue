<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('toteutussuunnitelman-tiedot') }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">

        <b-form-group :label="$t('toteutussuunnitelman-nimi')">
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
            <b-col>
              <b-form-group :label="$t('esikatselu')">
                <ep-external-link :url="data.opetussuunnitelma.toteutussuunnitelmaUrl">
                  {{$t('esikatsele-toteutussuunnitelmaa')}}
                </ep-external-link>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

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

        <hr/>

        <h3>{{$t('toiminnot')}}</h3>

        <ep-button class="siirra-opetussuunnitelma" variant="link">
          {{$t('siirra-opetussuunnitelma')}}
        </ep-button>

      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaTiedotStore } from '@/stores/ToteutussuunnitelmaTiedotStore';
import { ToteutussuunnitelmaRoute } from './ToteutussuunnitelmaRoute';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import { UiKielet } from '@shared/stores/kieli';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';

@Component({
  components: {
    EpEditointi,
    EpContent,
    EpField,
    EpDatepicker,
    EpExternalLink,
    EpButton,
  },
})
export default class RouteToteutussuunnitelmaTiedot extends Vue {
  private editointiStore: EditointiStore | null = null;

  async mounted() {
    this.editointiStore = new EditointiStore(new ToteutussuunnitelmaTiedotStore(this.toteutussuunnitelmaId, this.koulutustoimijaId, _.toNumber(this.$route.query.versionumero)));
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
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep .siirra-opetussuunnitelma.ep-button .btn .teksti, ::v-deep .siirra-opetussuunnitelma.ep-button .btn{
    padding-left: 0px !important;
  }

</style>

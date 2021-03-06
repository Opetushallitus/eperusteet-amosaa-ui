<template>
  <div class="p-4">
    <h2>{{ $t('julkaisunakyma') }}</h2>
    <div>{{ $t('julkaisunakyma-kuvaus') }}</div>

    <div class="mt-4">
      <h3>{{ $t('julkaisu-vaikutukset') }}</h3>
      <ul>
        <li>{{ $t('julkaisusta-julkinen') }}</li>
        <li>{{ $t('julkaisusta-luodaan-pdf') }}</li>
        <li>{{ $t('julkaisusta-vanhat-versiot-sailyvat') }}</li>
      </ul>
    </div>
    <div>
      <h3 class="mt-4 mb-1">{{ $t('tarkistukset') }}</h3>
      <EpValidointilistaus
        v-if="parsedErrors && parsedErrors.length > 0"
        :borderTop="true"
        :items="parsedErrors"
        :title="'validointi-virheet'"
        :type="'danger'" />
      <EpValidointilistaus
        v-if="warnings && warnings.length > 0"
        :items="warnings"
        :title="'validointi-varoitukset'"
        :type="'warning'" />
      <EpSpinner v-if="!toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value" />
      <div v-if="hasNoErrors && toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value" class="d-flex align-items-center mb-4">
        <fas class="text-success mr-2" icon="check-circle"/>
        {{ $t('suunnitelmassa-ei-virheita') }}
      </div>
      <template v-if="suunnitelma">
        <h3>{{ $t('suunnitelman-tiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('opetussuunnitelman-nimi')">
                <EpInput v-model="suunnitelma.nimi"/>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('tiivistelma')">
                <EpContent v-model="suunnitelma.kuvaus" layout="full"/>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('paatosnumero')">
                <EpInput v-if="suunnitelma.paatosnumero" v-model="suunnitelma.paatosnumero" type="string"/>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('paatospaivamaara')">
                <EpDatepicker v-model="suunnitelma.paatospaivamaara" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('hyvaksyja')">
                <EpInput v-if="suunnitelma.hyvaksyja" v-model="suunnitelma.hyvaksyja" type="string"/>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('voimassaolo')">
                <div class="d-flex align-items-center">
                  <EpDatepicker v-model="suunnitelma.voimaantulo" />
                  <div class="ml-2 mr-2">-</div>
                  <EpDatepicker v-model="suunnitelma.paatospaivamaara" />
                </div>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('julkaisukielet')">
                <div class="text-nowrap" v-if="suunnitelma.julkaisukielet.length > 0">
                  <span v-for="(kieli, idx) in suunnitelma.julkaisukielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}<span class="mr-0" v-if="idx < suunnitelma.julkaisukielet.length - 1">,</span>
                  </span>
                </div>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
             <b-col lg="6" v-if="!isOpsPohja">
              <b-form-group :label="$t('esikatselu')">
                <EpExternalLink :url="esikatseluUrl" v-if="julkaisut && julkaisut.length > 0">
                  {{ $t(kielistykset['esikatselu']) }}
                </EpExternalLink>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>

        <hr class="mt-4 mb-4">

        <div v-if="julkaisuMahdollinen && julkaisut">
          <h3>{{ $t('uusi-julkaisu') }}</h3>
          <b-form-group :label="$t('julkaisun-tiedote')">
            <div class="font-size-08 mb-2">{{$t('tiedote-naytetaan-tyoryhmalle-taman-sivun-julkaisuhistoriassa')}}</div>
            <ep-content v-model="julkaisu.tiedote"
                        layout="full"
                        :is-editable="true" />
            <EpJulkaisuButton class="mt-3" :julkaise="julkaise" v-oikeustarkastelu="{ oikeus: 'muokkaus' }"/>
          </b-form-group>
        </div>

        <EpJulkaisuHistoria :julkaisut="julkaisut" :palauta="palautaJulkaisu"/>

      </template>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';

import { JulkaisuKielistykset, OpetussuunnitelmaTyyppi, Toteutus } from '@/utils/toteutustypes';

import EpValidointilistaus from '@/components/EpValidointilistaus/EpValidointilistaus.vue';

import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpJulkaisuHistoria from '@shared/components/EpJulkaisuHistoria/EpJulkaisuHistoria.vue';
import { buildEsikatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaDtoTilaEnum, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';

@Component({
  components: {
    EpInput,
    EpDatepicker,
    EpExternalLink,
    EpContent,
    EpButton,
    EpCollapse,
    EpSpinner,
    EpValidointilistaus,
    EpJulkaisuHistoria,
    EpJulkaisuButton,
  },
})
export default class RouteJulkaisu extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  private julkaisu = {
    tiedote: {},
  };

  async mounted() {
    await this.toteutussuunnitelmaStore.updateValidation(this.koulutustoimijaId, this.toteutussuunnitelmaId);
  }

  get suunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get esikatseluUrl() {
    return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/toteutussuunnitelma/${this.suunnitelma!.id}/${this.toteutus}`);
  }

  get hasNoErrors(): boolean {
    return this.errors?.length === 0 && this.warnings?.length === 0;
  }

  get parsedErrors() {
    if (this.errors) {
      return [
        ...this.errors!.filter(error => error.nimi && error),
        ..._.chain(this.errors!.filter(error => !error.nimi && error))
          .uniqBy('syy')
          .value(),
      ];
    }
  }

  get errors() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value?.virheet;
  }

  get warnings() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value?.varoitukset;
  }

  get julkaisuMahdollinen() {
    return _.size(this.errors) === 0 && this.suunnitelma?.tila !== _.toLower(OpetussuunnitelmaDtoTilaEnum.POISTETTU);
  }

  get julkaisut() {
    return this.toteutussuunnitelmaStore.julkaisut.value;
  }

  get sisaltoKieli() {
    return Kielet.getSisaltoKieli.value;
  }

  async julkaise() {
    try {
      await this.toteutussuunnitelmaStore.julkaise(this.julkaisu);
      this.julkaisu.tiedote = {};
      this.$success(this.$t(this.kielistykset['julkaisuOnnistui']) as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisu-epaonnistui-' + OpetussuunnitelmaTyyppi[this.toteutus] + '-' + err.response?.data?.syy) as string);
    }
  }

  get kielistykset() {
    return JulkaisuKielistykset[this.toteutus];
  }

  get isOpsPohja() {
    return this.suunnitelma?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
  }

  async palautaJulkaisu(julkaisu) {
    try {
      await this.toteutussuunnitelmaStore.palautaJulkaisu(julkaisu.revision);
      this.$success(this.$t('suunnitelman-julkaisuversio-palautettu-julkiseksi') as string);
    }
    catch (err) {
      this.$fail(this.$t('palautus-epaonnistui') as string);
    }
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables';

  .content {
    padding: 15px 50px 50px 50px;
  }

  .julkaisu:nth-of-type(even) {
    background-color: $table-even-row-bg-color;
  }

  .julkaisu:nth-of-type(odd) {
    background-color: $table-odd-row-bg-color;
  }
</style>

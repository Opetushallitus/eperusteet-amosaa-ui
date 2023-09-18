<template>
  <div class="p-4">
    <div class="d-flex justify-content-between">
      <h2>{{ $t('julkaisunakyma') }}</h2>
      <div class="d-flex flex-column" v-if="$isAdmin()">
        <EpSpinner v-if="hallintaLoading" />
        <b-dropdown v-else class="asetukset" size="lg" variant="link" dropleft toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            {{$t('hallinta')}} <fas icon="ratas" class="hallinta" />
          </template>
         <EpButton variant="link" @click="poistaJulkaisut">
            {{$t('poista-julkaisut')}}
          </EpButton>
        </b-dropdown>
      </div>
    </div>

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
      <h3>{{ $t('tarkistukset') }}</h3>
      <div class="validation">
        <div v-if="isValidating" class="validointi-spinner">
          <EpSpinner />
          <div>{{ $t('validointi-kaynnissa') }}</div>
        </div>
        <div v-else>
          <div v-if="isValid" class="d-flex">
            <EpMaterialIcon :color="'#4c7f00'">check_circle</EpMaterialIcon>
            <div class="ml-2">{{$t('ei-julkaisua-estavia-virheita')}}</div>
          </div>
          <div v-else class="d-flex">
            <EpMaterialIcon :color="'#dc3545'">info</EpMaterialIcon>
            <div class="ml-2">{{$t('loytyi-julkaisun-estavia-virheita')}}</div>
          </div>

          <div v-for="(validointi, idx) in validoinnit" :key="'validointi'+idx">
            <ep-collapse v-if="validointi.virheet.length > 0 || validointi.huomautukset.length > 0"
                        :borderBottom="false">
              <h3 slot="header">{{ $t(validointi.kategoria) }}</h3>
              <EpJulkaisuValidointi :validointi="validointi" />
            </ep-collapse>
          </div>
        </div>
      </div>

      <EpSpinner v-if="!toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value" />
      <hr class="mt-4 mb-4">

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
                  <template v-if="suunnitelma.voimassaoloLoppuu">
                    <div class="ml-2 mr-2">-</div>
                    <EpDatepicker v-model="suunnitelma.voimassaoloLoppuu" />
                  </template>
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
                        layout="simplified"
                        :is-editable="true" />
            <EpJulkaisuButton class="mt-3" :julkaise="julkaise" v-oikeustarkastelu="{ oikeus: 'muokkaus' }" :julkaisuKesken="julkaisuKesken"/>
          </b-form-group>
        </div>

        <EpJulkaisuHistoria :julkaisut="julkaisut" :palauta="palautaJulkaisu"/>

      </template>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { JulkaisuKielistykset } from '@/utils/toteutustypes';
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
import { OpetussuunnitelmaDtoTilaEnum, OpetussuunnitelmaDtoTyyppiEnum, Maintenance } from '@shared/api/amosaa';
import EpJulkaisuButton from '@shared/components/EpJulkaisuButton/EpJulkaisuButton.vue';
import { Toteutus } from '@shared/utils/perusteet';
import { nodeToRoute } from '@/utils/routing';
import EpJulkaisuValidointi from '@shared/components/EpJulkaisuValidointi/EpJulkaisuValidointi.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

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
    EpJulkaisuValidointi,
    EpMaterialIcon,
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

  private hallintaLoading: boolean = false;

  async mounted() {
    await this.toteutussuunnitelmaStore.updateValidation();
  }

  get suunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get esikatseluUrl() {
    return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/toteutussuunnitelma/${this.suunnitelma!.id}`, `/${this.toteutus}`);
  }

  get julkaisuMahdollinen() {
    return this.isValid && this.suunnitelma?.tila !== _.toLower(OpetussuunnitelmaDtoTilaEnum.POISTETTU);
  }

  get isValidating() {
    return !this.validoinnit;
  }

  get isValid() {
    if (this.validoinnit) {
      return _.every(this.validoinnit, validointi => _.isEmpty(validointi.virheet));
    }
  }

  get validoinnit() {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value) {
      return _.map(this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value, validointi => {
        return {
          ...validointi,
          virheet: this.listNodeToRoute(validointi.virheet),
          huomautukset: this.listNodeToRoute(validointi.huomautukset),
          huomiot: this.listNodeToRoute(validointi.huomiot),
        };
      });
    }
  }

  listNodeToRoute(list) {
    return _.map(list, item => ({ ...item, route: nodeToRoute(item.navigationNode) }));
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
      this.$success(this.$t('julkaisu-kaynnistetty') as string);
    }
    catch (err) {
      this.$fail(this.$t('julkaisu-epaonnistui') as string);
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

  get julkaisuKesken() {
    return this.toteutussuunnitelmaStore.viimeisinJulkaisuTila.value === 'KESKEN';
  }

  async poistaJulkaisut() {
    this.hallintaLoading = true;
    await Maintenance.poistaJulkaisut(this.suunnitelma!.id!);
    await this.toteutussuunnitelmaStore.updateCurrent();
    await this.toteutussuunnitelmaStore.fetchJulkaisut();
    this.$success(this.$t('suunnitelman-julkaisut-poistettu') as string);
    this.hallintaLoading = false;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables';

.validation {
  border: 1px solid #ccc;
  box-shadow: 0 0 20px #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  padding: 20px;
}

.validointi-spinner {
  text-align: center;
}

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

<template>
<div class="yleisnakyma">

  <EpSpinner v-if="vanhentunutPeruste === null" />
  <div class="info-box sync-box" v-else-if="vanhentunutPeruste && !perustePaivitetty" v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
    <h2>{{$t(perustePaivitysKielistys['otsikko'])}}</h2>
    <div v-html="$t(perustePaivitysKielistys['teksti'])" />
    <div class="d-flex justify-content-between">
      <EpExternalLink :url="perusteLinkki" class="mt-2">{{$kaanna(peruste.nimi)}}</EpExternalLink>
      <div class="d-flex align-items-center">
        <div class="mr-3 disabled-text font-size-08" v-if="toteutussuunnitelma.perustePaivitettyPvm">
          {{$t('viimeisin-synkronisointi-pvm')}} {{ $sdt(toteutussuunnitelma.perustePaivitettyPvm) }}
        </div>
        <ep-button @click="paivitaPeruste" :showSpinner="syncing">
          {{$t('paivita')}}
        </ep-button>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col p-0">
      <ep-toteutussuunnitelma-aikataulu class="info-box" :aikatauluStore="aikatauluStore" :toteutussuunnitelma="toteutussuunnitelma"/>
    </div>
  </div>

  <div class="row pt-0">
    <div class="col-lg-12 col-xl-6 p-0">
      <ep-toteutussuunnitelman-tiedotteet class="info-box" v-if="peruste" :tiedotteetStore="toteutussuunnitelmaTiedotteetStore"/>
      <ep-toteutussuunnitelman-perustiedot class="info-box" :toteutussuunnitelma="toteutussuunnitelma" :toteutus="toteutus"/>
      <ep-toteutussuunnitelman-sisaltoviitteet class="info-box" v-if="!isYhteinen" :opetussuunnitelma="toteutussuunnitelma" :toteutus="toteutus"/>
    </div>
    <div class="col-lg-12 col-xl-6 p-0 pl-2">
      <ep-viimeaikainen-toiminta class="info-box" :muokkaustietoStore="muokkaustietoStore"/>
    </div>
  </div>

</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import EpToteutussuunnitelmaAikataulu from '@/components/EpYleisnakyma/EpToteutussuunnitelmaAikataulu.vue';
import EpToteutussuunnitelmanPerustiedot from '@/components/EpYleisnakyma/EpToteutussuunnitelmanPerustiedot.vue';
import EpToteutussuunnitelmanSisaltoviitteet from '@/components/EpYleisnakyma/EpToteutussuunnitelmanSisaltoviitteet.vue';
import EpToteutussuunnitelmanTiedotteet from '@/components/EpYleisnakyma/EpToteutussuunnitelmanTiedotteet.vue';
import EpViimeaikainenToiminta from '@shared/components/EpViimeaikainenToiminta/EpViimeaikainenToiminta.vue';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { ToteutussuunnitelmaTiedotteetStore } from '@/stores/ToteutussuunnitelmaTiedotteetStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { ToteutussuunnitelmaPerustePaivitysKielistykset } from '@/utils/toteutustypes';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { koulutustyyppiTheme, Toteutus } from '@shared/utils/perusteet';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { buildEsikatseluUrl, buildKatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';

@Component({
  components: {
    EpToteutussuunnitelmaAikataulu,
    EpToteutussuunnitelmanPerustiedot,
    EpToteutussuunnitelmanSisaltoviitteet,
    EpViimeaikainenToiminta,
    EpToteutussuunnitelmanTiedotteet,
    EpButton,
    EpSpinner,
    EpExternalLink,
  },
})
export default class RouteYleisnakyma extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  private toteutussuunnitelmaTiedotteetStore!: ToteutussuunnitelmaTiedotteetStore;

  @Prop({ required: false, default: 'peruste' })
  private tyyppi!: 'opas' | 'peruste';

  @Prop({ required: true })
  private toteutus!: Toteutus;

  private syncing = false;
  private perustePaivitetty = false;

  async mounted() {
    await this.muokkaustietoStore.refetch();
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get peruste() {
    return this.toteutussuunnitelma?.peruste;
  }

  get vanhentunutPeruste() {
    return this.toteutussuunnitelmaStore.vanhentunutPohjaperusteDto.value;
  }

  async paivitaPeruste() {
    try {
      this.syncing = true;
      await this.toteutussuunnitelmaStore.paiviteOpetussunnitelmanPeruste();
      await this.toteutussuunnitelmaStore.initNavigation();
      await this.muokkaustietoStore.refetch();
      this.perustePaivitetty = true;
      this.$success(this.$t('peruste-paivitetty') as string);
    }
    catch (e) {
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }

    this.syncing = false;
  }

  get perustePaivitysKielistys() {
    return ToteutussuunnitelmaPerustePaivitysKielistykset[this.toteutus];
  }

  get isYhteinen() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.YHTEINEN);
  }

  get perusteLinkki() {
    return buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(this.peruste?.koulutustyyppi!)}/${this.peruste?.perusteId}`);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.yleisnakyma {

  height: 100%;
  background-color: $gray-lighten-5;
  padding: 10px;

  .row {
    margin: 0px;
  }

  .info-box {
    margin-bottom: 10px;
    padding:20px;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
    min-width: 370px;
  }

  .sync-box {
    background-color: $blue-lighten-4;
  }

}

</style>

<template>
<div class="yleisnakyma">

  <div class="info-box sync-box" v-if="vanhentunutPeruste">
    <h2>{{$t('paivita-tutkinnon-perusteet-toteutussuunnitelmiisi')}}</h2>
    <div v-html="$t('paivita-tutkinnon-perusteet-toteutussuunnitelmiisi-huomioteksti')" />

    <div class="d-flex justify-content-end">
      <ep-button @click="paivitaPeruste" :showSpinner="syncing">
        {{$t('paivita')}}
      </ep-button>
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
      <ep-toteutussuunnitelman-sisaltoviitteet class="info-box" :sisaltoViiteStore="sisaltoViiteStore" :toteutus="toteutus"/>
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
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { ToteutussuunnitelmaTiedotteetStore } from '@/stores/ToteutussuunnitelmaTiedotteetStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Toteutus } from '@/utils/toteutustypes';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpToteutussuunnitelmaAikataulu,
    EpToteutussuunnitelmanPerustiedot,
    EpToteutussuunnitelmanSisaltoviitteet,
    EpViimeaikainenToiminta,
    EpToteutussuunnitelmanTiedotteet,
    EpButton,
  },
})
export default class RouteYleisnakyma extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  @Prop({ required: true })
  private sisaltoViiteStore!: SisaltoViiteStore;

  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  private toteutussuunnitelmaTiedotteetStore!: ToteutussuunnitelmaTiedotteetStore;

  @Prop({ required: false, default: 'peruste' })
  private tyyppi!: 'opas' | 'peruste';

  @Prop({ required: true })
  private toteutus!: Toteutus;

  private syncing = false;

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
    return !!this.toteutussuunnitelmaStore.vanhentunutPohjaperusteDto.value;
  }

  async paivitaPeruste() {
    try {
      this.syncing = true;
      await this.toteutussuunnitelmaStore.paiviteOpetussunnitelmanPeruste();
      this.$success(this.$t('tutkinnon-peruste-paivitetty') as string);
    }
    catch (e) {
      this.$fail(this.$t('paivitys-epaonnistui') as string);
    }

    this.syncing = false;
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

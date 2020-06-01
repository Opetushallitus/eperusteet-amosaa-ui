<template>
<div class="yleisnakyma">

  <div class="row">
    <div class="col">
      <ep-toteutussuunnitelma-aikataulu class="info-box" :aikatauluStore="aikatauluStore" :toteutussuunnitelma="toteutussuunnitelma"/>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <!-- <ep-peruste-tiedotteet class="info-box" :peruste="peruste" :tiedotteetStore="tiedotteetStore"/> -->
      <ep-toteutussuunnitelman-perustiedot class="info-box" :toteutussuunnitelma="toteutussuunnitelma"/>
      <!-- <ep-peruste-tutkinnon-osat class="info-box" :peruste="peruste" :tutkinnonOsaStore="tutkinnonOsaStore"/> -->
      <ep-toteutussuunnitelman-tutkinnon-osat class="info-box" :sisaltoViiteStore="sisaltoViiteStore" />
    </div>
    <div class="col">
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
import EpToteutussuunnitelmanTutkinnonOsat from '@/components/EpYleisnakyma/EpToteutussuunnitelmanTutkinnonOsat.vue';
import EpViimeaikainenToiminta from '@shared/components/EpViimeaikainenToiminta/EpViimeaikainenToiminta.vue';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { ToteutussuunnitelmaRoute } from '@/views/ToteutussuunnitelmaRoute';

@Component({
  components: {
    EpToteutussuunnitelmaAikataulu,
    EpToteutussuunnitelmanPerustiedot,
    EpToteutussuunnitelmanTutkinnonOsat,
    EpViimeaikainenToiminta,
  },
})
export default class RouteYleisnakyma extends ToteutussuunnitelmaRoute {
  @Prop({ required: true })
  private aikatauluStore!: AikatauluStore;

  @Prop({ required: true })
  private sisaltoViiteStore!: SisaltoViiteStore;

  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: false, default: 'peruste' })
  private tyyppi!: 'opas' | 'peruste';

  async onProjektiChange(koulutustoimijaId: number, toteutussuunnitelmaId: number) {
    if (this.toteutussuunnitelma) {
      this.aikatauluStore.init(koulutustoimijaId, toteutussuunnitelmaId);
      this.sisaltoViiteStore.init(koulutustoimijaId, toteutussuunnitelmaId);
      this.muokkaustietoStore.init(koulutustoimijaId, toteutussuunnitelmaId);
    }
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
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
    padding-top: 10px;

    .col {
      padding: 0px;
      padding-left: 10px;
    }
  }

  .info-box {
    margin-bottom: 10px;
    padding:20px;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
    min-width: 370px;
  }

}

</style>

<template>
  <div class="yleisnakyma">
    <EpSpinner v-if="vanhentunutPeruste === null" />
    <div
      v-else-if="vanhentunutPeruste && !perustePaivitetty"
      v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
      class="info-box sync-box"
    >
      <h2>{{ $t(perustePaivitysKielistys['otsikko']) }}</h2>
      <div v-html="$t(perustePaivitysKielistys['teksti'])" />
      <div class="d-flex justify-content-between">
        <EpExternalLink
          :url="perusteLinkki"
          class="mt-2"
        >
          {{ $kaanna(peruste.nimi) }}
        </EpExternalLink>
        <div class="d-flex align-items-center">
          <div
            v-if="toteutussuunnitelma.perustePaivitettyPvm"
            class="mr-3 disabled-text font-size-08"
          >
            {{ $t('viimeisin-synkronisointi-pvm') }} {{ $sdt(toteutussuunnitelma.perustePaivitettyPvm) }}
          </div>
          <ep-button
            :show-spinner="syncing"
            @click="paivitaPeruste"
          >
            {{ $t('paivita') }}
          </ep-button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col p-0">
        <ep-toteutussuunnitelma-aikataulu
          class="info-box"
          :aikataulu-store="aikatauluStore"
          :toteutussuunnitelma="toteutussuunnitelma"
        />
      </div>
    </div>

    <div class="row pt-0">
      <div class="col-lg-12 col-xl-6 p-0">
        <ep-toteutussuunnitelman-tiedotteet
          v-if="peruste"
          class="info-box"
          :tiedotteet-store="toteutussuunnitelmaTiedotteetStore"
        />
        <ep-toteutussuunnitelman-perustiedot
          class="info-box"
          :toteutussuunnitelma="toteutussuunnitelma"
          :toteutus="toteutus"
        />
        <ep-toteutussuunnitelman-sisaltoviitteet
          v-if="!isYhteinen"
          class="info-box"
          :opetussuunnitelma="toteutussuunnitelma"
          :toteutus="toteutus"
        />
      </div>
      <div class="col-lg-12 col-xl-6 p-0 pl-2">
        <ep-viimeaikainen-toiminta
          class="info-box"
          :muokkaustieto-store="muokkaustietoStore"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import _ from 'lodash';

import EpToteutussuunnitelmaAikataulu from '@/components/EpYleisnakyma/EpToteutussuunnitelmaAikataulu.vue';
import EpToteutussuunnitelmanPerustiedot from '@/components/EpYleisnakyma/EpToteutussuunnitelmanPerustiedot.vue';
import EpToteutussuunnitelmanSisaltoviitteet from '@/components/EpYleisnakyma/EpToteutussuunnitelmanSisaltoviitteet.vue';
import EpToteutussuunnitelmanTiedotteet from '@/components/EpYleisnakyma/EpToteutussuunnitelmanTiedotteet.vue';
import EpViimeaikainenToiminta from '@shared/components/EpViimeaikainenToiminta/EpViimeaikainenToiminta.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';

import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { AikatauluStore } from '@/stores/AikatauluStore';
import { ToteutussuunnitelmaTiedotteetStore } from '@/stores/ToteutussuunnitelmaTiedotteetStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { ToteutussuunnitelmaPerustePaivitysKielistykset } from '@/utils/toteutustypes';
import { koulutustyyppiTheme, Toteutus } from '@shared/utils/perusteet';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { buildKatseluUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import { $t, $kaanna, $sdt, $success, $fail } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  aikatauluStore: AikatauluStore;
  muokkaustietoStore: MuokkaustietoStore;
  toteutussuunnitelmaTiedotteetStore: ToteutussuunnitelmaTiedotteetStore;
  tyyppi?: 'opas' | 'peruste';
  toteutus: Toteutus;
}>(), {
  tyyppi: 'peruste',
});

const syncing = ref(false);
const perustePaivitetty = ref(false);

const toteutussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const peruste = computed(() => {
  return toteutussuunnitelma.value?.peruste;
});

const vanhentunutPeruste = computed(() => {
  return props.toteutussuunnitelmaStore.vanhentunutPohjaperusteDto.value;
});

const perustePaivitysKielistys = computed(() => {
  return ToteutussuunnitelmaPerustePaivitysKielistykset[props.toteutus];
});

const isYhteinen = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.YHTEINEN);
});

const perusteLinkki = computed(() => {
  return buildKatseluUrl(Kielet.getSisaltoKieli.value, `/${koulutustyyppiTheme(peruste.value!.koulutustyyppi!)}/${peruste.value!.perusteId}`);
});

const paivitaPeruste = async () => {
  try {
    syncing.value = true;
    await props.toteutussuunnitelmaStore.paiviteOpetussunnitelmanPeruste();
    await props.toteutussuunnitelmaStore.initNavigation();
    await props.muokkaustietoStore.refetch();
    perustePaivitetty.value = true;
    $success($t('peruste-paivitetty') as string);
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
  }

  syncing.value = false;
};

onMounted(async () => {
  await props.muokkaustietoStore.refetch();
});
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

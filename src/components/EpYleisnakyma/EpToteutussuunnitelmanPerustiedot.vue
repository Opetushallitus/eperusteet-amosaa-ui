<template>
  <div class="perustiedot-content">
    <router-link :to="{ name: 'toteutussuunnitelmantiedot'}">
      <h3>{{ $t(kielistykset['title']) }}</h3>
    </router-link>

    <EpSpinner v-if="!toteutussuunnitelma" />

    <template v-else>
      <div class="row">
        <div class="col-5">
          <ep-perustieto-data
            icon="language"
            :topic="$t('julkaisukielet')"
          >
            {{ julkaisukielet }}
          </ep-perustieto-data>
        </div>
        <div class="col-7" />
      </div>

      <div class="row">
        <div class="col-5">
          <ep-perustieto-data
            icon="calendar_today"
            :topic="$t('luotu')"
          >
            {{ $sdt(toteutussuunnitelma.luotu) }}
          </ep-perustieto-data>
        </div>
        <div class="col-7">
          <ep-perustieto-data
            icon="calendar_today"
            :topic="$t('julkaistu')"
          >
            {{ $sdt(toteutussuunnitelma.viimeisinJulkaisuAika) }}
          </ep-perustieto-data>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <EpPerustietoData icon="visibility">
            <template #header>
              {{ $t(kielistykset['esikatselu']) }}
            </template>
            <template v-if="!toteutussuunnitelma.esikatseltavissa">
              {{ $t('et-ole-sallinut-esikatselua') }}
            </template>
            <template v-else>
              <ep-external-link :url="esikatseluUrl" />
            </template>
          </EpPerustietoData>
        </div>
      </div>

      <ep-siirto-modal
        v-if="!isOpsPohja"
        v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
        :toteutus="toteutus"
        :koulutustoimija-id="koulutustoimijaId"
        :toteutussuunnitelma="toteutussuunnitelma"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, getCurrentInstance } from 'vue';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import EpSiirtoModal from '@/components/EpSiirtoModal/EpSiirtoModal.vue';
import { ToteutussuunnitelmaTiedotKielistykset } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';
import { buildToteutussuunnitelmaEsikatseluUrl } from '@shared/utils/esikatselu';
import { $t, $sdt } from '@shared/utils/globals';
import { useRoute } from 'vue-router';

const props = defineProps<{
  toteutussuunnitelma: OpetussuunnitelmaDto;
  toteutus: Toteutus;
}>();

const route = useRoute();

const julkaisukielet = computed(() => {
  if (props.toteutussuunnitelma) {
    return _.map(props.toteutussuunnitelma.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
  }
  return undefined;
});

const koulutustoimijaId = computed((): string => {
  return route.params.koulutustoimijaId;
});

const isOpsPohja = computed(() => {
  return props.toteutussuunnitelma?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
});

const opetussuunnitelmaTyyppi = computed(() => {
  return isOpsPohja.value ? OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA : props.toteutus;
});

const kielistykset = computed(() => {
  return ToteutussuunnitelmaTiedotKielistykset[opetussuunnitelmaTyyppi.value];
});

const esikatseluUrl = computed(() => {
  return buildToteutussuunnitelmaEsikatseluUrl(props.toteutussuunnitelma, props.toteutus);
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import "@shared/styles/_mixins.scss";
@include perustiedot-content;

  :deep(.ep-button .teksti) {
    padding-left: 0px !important;
  }

</style>

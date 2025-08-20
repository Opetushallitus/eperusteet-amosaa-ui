<template>
  <div class="content">
    <h3>{{ $t(title) }}</h3>

    <ep-spinner v-if="!sisaltoviitteet" />

    <div
      v-else
      class="d-flex"
    >
      <ep-small-data-box
        v-for="(sisaltoviite, index) in toteutuksenSisaltoviitteet"
        :key="'sisaltoviite'+index"
        :topic="$t(sisaltoviite.teksti)"
        :count="sisaltoviite.lkm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSmallDataBox from '@shared/components/EpSmallDataBox/EpSmallDataBox.vue';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { OpetussuunnitelmaDto, SisaltoViiteKevytDtoTyyppiEnum, TutkinnonOsaKevytDtoTyyppiEnum } from '@shared/api/amosaa';
import { YleisnakymaSisaltoviitteTiedot } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  toteutus: Toteutus;
  opetussuunnitelma?: OpetussuunnitelmaDto;
}>();

const sisaltoViiteStore = new SisaltoViiteStore();

watch(() => props.opetussuunnitelma, async (newValue) => {
  if (newValue) {
    await sisaltoViiteStore.fetch(newValue.id!, _.toString(newValue.koulutustoimija?.id));
  }
}, { immediate: true });

const title = computed(() => {
  return YleisnakymaSisaltoviitteTiedot[props.toteutus].title;
});

const sisaltoviitteet = computed(() => {
  return sisaltoViiteStore.sisaltoviitteet.value;
});

const sisaltoviiteLkm = computed(() => {
  return {
    tekstikappale: {
      teksti: 'tekstikappaletta',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite =>
        sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TEKSTIKAPPALE)
        && _.get(sisaltoviite, '_vanhempi') != null)),
    },
    tutkinnonosa: {
      teksti: 'tutkinnon-osaa',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA))),
    },
    paikallinentutkinnonosa: {
      teksti: 'paikallista-tutkinnon-osaa',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite =>
        sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA)
        && sisaltoviite.tosa
        && sisaltoviite.tosa.tyyppi === _.lowerCase(TutkinnonOsaKevytDtoTyyppiEnum.OMA))),
    },
    suorituspolku: {
      teksti: 'suorituspolkua',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLKU))),
    },
    osasuorituspolku: {
      teksti: 'osasuoritus-polkua',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.OSASUORITUSPOLKU))),
    },
    opintokokonaisuus: {
      teksti: 'osaamis-ja-opintokokonaisuuksia-yhteensa',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.OPINTOKOKONAISUUS))),
    },
    koulutuksenosa: {
      teksti: 'koulutuksen-osaa',
      lkm: _.size(_.filter(sisaltoviitteet.value, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.KOULUTUKSENOSA))),
    },
  };
});

const toteutuksenSisaltoviitteet = computed(() => {
  return _.map(YleisnakymaSisaltoviitteTiedot[props.toteutus].sisaltoviitetyypit, sisaltoviitetyyppi => (sisaltoviiteLkm.value[sisaltoviitetyyppi]));
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  // .box {
  //   width: 125px;
  //   height: 140px;
  //   margin-right: 10px;
  //   margin-top: 10px;
  //   padding: 10px;
  //   background-color: #f7f8fc;

  //   .count {
  //     font-size: 2.375rem;
  //     line-height: 1;

  //     .secondary {
  //       font-size: 1rem;
  //       color: $gray-lighten-1;
  //     }
  //   }

  //   .topic {
  //     padding-top: 10px;
  //   }
  // }

</style>

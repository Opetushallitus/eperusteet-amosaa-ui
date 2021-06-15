<template>
  <div class="content">
    <h3>{{$t(title)}}</h3>

    <ep-spinner v-if="!sisaltoviitteet" />

    <div class="d-flex" v-else>
      <ep-small-data-box v-for="(sisaltoviite, index) in toteutuksenSisaltoviitteet" :key="'sisaltoviite'+index"
        :topic="$t(sisaltoviite.teksti)" :count="sisaltoviite.lkm" />
    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSmallDataBox from '@shared/components/EpSmallDataBox/EpSmallDataBox.vue';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { SisaltoViiteKevytDtoTyyppiEnum, TutkinnonOsaKevytDtoTyyppiEnum } from '@shared/api/amosaa';
import { Toteutus, YleisnakymaSisaltoviitteTiedot } from '@/utils/toteutustypes';

@Component({
  components: {
    EpSpinner,
    EpSmallDataBox,
  },
})
export default class EpToteutussuunnitelmanSisaltoviitteet extends Vue {
  @Prop({ required: true })
  private sisaltoViiteStore!: SisaltoViiteStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  get title() {
    return YleisnakymaSisaltoviitteTiedot[this.toteutus].title;
  }

  get toteutuksenSisaltoviitteet() {
    return _.map(YleisnakymaSisaltoviitteTiedot[this.toteutus].sisaltoviitetyypit, sisaltoviitetyyppi => (this.sisaltoviiteLkm[sisaltoviitetyyppi]));
  }

  get sisaltoviiteLkm() {
    return {
      tekstikappale: {
        teksti: 'tekstikappaletta',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite =>
          sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TEKSTIKAPPALE)
          && _.get(sisaltoviite, '_vanhempi') != null)),
      },
      tutkinnonosa: {
        teksti: 'tutkinnon-osaa',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA))),
      },
      paikallinentutkinnonosa: {
        teksti: 'paikallista-tutkinnon-osaa',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite =>
          sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA)
          && sisaltoviite.tosa
          && sisaltoviite.tosa.tyyppi === _.lowerCase(TutkinnonOsaKevytDtoTyyppiEnum.OMA))),
      },
      suorituspolku: {
        teksti: 'suorituspolkua',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLKU))),
      },
      osasuorituspolku: {
        teksti: 'osasuoritus-polkua',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.OSASUORITUSPOLKU))),
      },
      opintokokonaisuus: {
        teksti: 'osaamis-ja-opintokokonaisuuksia-yhteensa',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.OPINTOKOKONAISUUS))),
      },
      koulutuksenosa: {
        teksti: 'koulutuksen-osaa',
        lkm: _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.KOULUTUKSENOSA))),
      },

    };
  };

  get sisaltoviitteet() {
    return this.sisaltoViiteStore.sisaltoviitteet.value;
  }
}
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

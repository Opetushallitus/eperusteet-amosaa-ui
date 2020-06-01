<template>
  <div class="content">
    <h3>{{$t('tutkinnon-osat')}}</h3>

    <ep-spinner v-if="!sisaltoviitteet" />

    <div class="box d-inline-flex flex-column align-items-center text-center"
      v-for="(tutkinnonosa, index) in tutkinnonosat" :key="'tutkinnonosa'+index">
      <div class="count">{{tutkinnonosa.lkm}}</div>
      <div class="topic">{{$t(tutkinnonosa.teksti)}}</div>
    </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { SisaltoViiteKevytDtoTyyppiEnum, TutkinnonOsaKevytDtoTyyppiEnum } from '@shared/api/amosaa';

@Component({
  components: {
    EpSpinner,
  },
})
export default class EpToteutussuunnitelmanTutkinnonOsat extends Vue {
  @Prop({ required: true })
  private sisaltoViiteStore!: SisaltoViiteStore;

  get tutkinnonosat() {
    return [
      { teksti: 'tutkinnon-osaa', lkm: this.tutkinnonOsaLkm },
      { teksti: 'paikallista-tutkinnon-osaa', lkm: this.paikallinenTutkinnonOsaLkm },
      { teksti: 'suorituspolkua', lkm: this.suorituspolkuLkm },
      { teksti: 'osasuoritus-polkua', lkm: this.osasuorituspolkuLkm },
    ];
  }

  get tutkinnonOsaLkm() {
    return _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA)));
  }

  get paikallinenTutkinnonOsaLkm() {
    return _.size(_.filter(this.sisaltoviitteet, sisaltoviite =>
      sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA)
      && sisaltoviite.tosa
      && sisaltoviite.tosa.tyyppi === _.lowerCase(TutkinnonOsaKevytDtoTyyppiEnum.OMA)));
  }

  get suorituspolkuLkm() {
    return _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLKU)));
  }

  get osasuorituspolkuLkm() {
    return _.size(_.filter(this.sisaltoviitteet, sisaltoviite => sisaltoviite.tyyppi === _.lowerCase(SisaltoViiteKevytDtoTyyppiEnum.OSASUORITUSPOLKU)));
  }

  get sisaltoviitteet() {
    return this.sisaltoViiteStore.sisaltoviitteet.value;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .box {
    width: 125px;
    height: 140px;
    margin-right: 10px;
    margin-top: 10px;
    padding: 10px;
    background-color: #f7f8fc;

    .count {
      font-size: 2.375rem;
      line-height: 1;

      .secondary {
        font-size: 1rem;
        color: $gray-lighten-1;
      }
    }

    .topic {
      padding-top: 10px;
    }
  }

</style>

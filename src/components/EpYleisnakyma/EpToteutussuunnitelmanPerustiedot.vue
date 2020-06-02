<template>

  <div class="perustiedot-content">
    <h3>{{$t('suunnitelman-tiedot')}}</h3>

    <div class="d-flex flex-wrap" v-if="toteutussuunnitelma">

     <ep-perustieto-data icon="kielet" :topic="$t('julkaisukielet')">
        {{julkaisukielet}}
      </ep-perustieto-data>

      <ep-perustieto-data icon="kalenteri" :topic="$t('luotu')">
        {{$sdt(toteutussuunnitelma.luotu)}}
      </ep-perustieto-data>
    </div>

    <router-link :to="{}">
      <ep-button variant="link">{{$t('siirra-opetussuunnitelma')}}</ep-button>
    </router-link>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpPerustietoData,
  },
})
export default class EpToteutussuunnitelmanPerustiedot extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelma!: OpetussuunnitelmaDto;

  get julkaisukielet() {
    if (this.toteutussuunnitelma) {
      return _.map(this.toteutussuunnitelma.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
    }
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import "@shared/styles/_mixins.scss";
@include perustiedot-content;

  ::v-deep .ep-button .teksti {
    padding-left: 0px !important;
  }

</style>

<template>

  <div class="perustiedot-content">
    <h3>{{$t(kielistykset['title'])}}</h3>

    <div class="d-flex flex-wrap" v-if="toteutussuunnitelma">

     <ep-perustieto-data icon="kielet" :topic="$t('julkaisukielet')">
        {{julkaisukielet}}
      </ep-perustieto-data>

      <ep-perustieto-data icon="kalenteri" :topic="$t('luotu')">
        {{$sdt(toteutussuunnitelma.luotu)}}
      </ep-perustieto-data>
    </div>

    <ep-siirto-modal :toteutus="toteutus" :koulutustoimija-id="koulutustoimijaId" :toteutussuunnitelma="toteutussuunnitelma" v-if="!isOpsPohja"
      v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
      />
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import { OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPerustietoData from '@shared/components/EpPerustietoData/EpPerustietoData.vue';
import EpSiirtoModal from '@/components/EpSiirtoModal/EpSiirtoModal.vue';
import { ToteutussuunnitelmaTiedotKielistykset } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpPerustietoData,
    EpSiirtoModal,
  },
})
export default class EpToteutussuunnitelmanPerustiedot extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelma!: OpetussuunnitelmaDto;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  get julkaisukielet() {
    if (this.toteutussuunnitelma) {
      return _.map(this.toteutussuunnitelma.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
    }
  }

  get koulutustoimijaId(): string {
    return this.$route.params.koulutustoimijaId;
  }

  get kielistykset() {
    return ToteutussuunnitelmaTiedotKielistykset[this.opetussuunnitelmaTyyppi];
  }

  get opetussuunnitelmaTyyppi() {
    return this.isOpsPohja ? OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA : this.toteutus;
  }

  get isOpsPohja() {
    return this.toteutussuunnitelma?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
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

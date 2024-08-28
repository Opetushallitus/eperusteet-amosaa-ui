<template>
  <div class="perustiedot-content">
    <router-link :to="{ name: 'toteutussuunnitelmantiedot'}">
      <h3>{{$t(kielistykset['title'])}}</h3>
    </router-link>

    <EpSpinner v-if="!toteutussuunnitelma" />

    <template v-else>
      <div class="row" >
        <div class="col-5">
          <ep-perustieto-data icon="language" :topic="$t('julkaisukielet')">
            {{julkaisukielet}}
          </ep-perustieto-data>
        </div>
        <div class="col-7">
        </div>
      </div>

      <div class="row">
        <div class="col-5">
          <ep-perustieto-data icon="calendar_today" :topic="$t('luotu')">
            {{$sdt(toteutussuunnitelma.luotu)}}
          </ep-perustieto-data>
        </div>
        <div class="col-7">
          <ep-perustieto-data icon="calendar_today" :topic="$t('julkaistu')">
            {{$sdt(toteutussuunnitelma.viimeisinJulkaisuAika)}}
          </ep-perustieto-data>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <EpPerustietoData icon="visibility">
            <template #header>{{ $t('esikatsele-opetussuunnitelmaa')}}</template>
            <template v-if="!toteutussuunnitelma.esikatseltavissa">{{ $t('esikatselua-ei-ole-sallittu') }}</template>
            <template v-else>
              <ep-external-link :url="esikatseluUrl"></ep-external-link>
            </template>
          </EpPerustietoData>
        </div>
      </div>

      <ep-siirto-modal :toteutus="toteutus" :koulutustoimija-id="koulutustoimijaId" :toteutussuunnitelma="toteutussuunnitelma" v-if="!isOpsPohja"
        v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"/>
    </template>
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
import { buildOpetussuunnitelmaEsikatseluUrl } from '@/utils/esikatselu';

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

  get esikatseluUrl() {
    return buildOpetussuunnitelmaEsikatseluUrl(this.toteutussuunnitelma, this.toteutus);
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

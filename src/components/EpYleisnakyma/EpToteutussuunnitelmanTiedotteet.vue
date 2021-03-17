<template>
  <div class="content">
    <div class="d-flex justify-content-between">
      <h3 class="mb-4">{{$t('tiedotteet')}}</h3>
      <ep-tiedote-modal
        ref="eptiedotemodal"
        :tiedotteetStore="tiedotteetStore"
        :editable="false"/>
    </div>

    <ep-spinner v-if="!tiedotteet" />

    <ep-julki-lista v-else :tiedot="tiedotteet" @avaaTieto="avaaTiedote" >
      <span slot="eiTietoja">{{$t('ei-tiedotteita')}}</span>
    </ep-julki-lista>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpTiedoteModal from '@shared/components/EpTiedoteModal/EpTiedoteModal.vue';
import EpJulkiLista from '@shared/components/EpJulkiLista/EpJulkiLista.vue';
import { ToteutussuunnitelmaTiedotteetStore } from '@/stores/ToteutussuunnitelmaTiedotteetStore';
import { PerusteDto, TiedoteDto } from '@shared/api/eperusteet';

@Component({
  components: {
    EpSpinner,
    EpTiedoteModal,
    EpJulkiLista,
  },
})
export default class EpToteutussuunnitelmanTiedotteet extends Vue {
  @Prop({ required: true })
  private tiedotteetStore!: ToteutussuunnitelmaTiedotteetStore;

  get tiedotteet() {
    return this.tiedotteetStore.tiedotteet.value;
  }

  avaaTiedote(tiedote: TiedoteDto) {
    (this as any).$refs['eptiedotemodal'].muokkaa(tiedote);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

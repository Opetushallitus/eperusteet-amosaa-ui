<template>
   <div id="scroll-anchor" >
    <EpEditointi :store="editointiStore">
      <template v-slot:header>
        <h2 class="my-1">{{ $t('koulutuksen-osat') }}</h2>
      </template>
      <template v-slot:default>

        <div v-if="yhteisetKoulutuksenosat.length > 0" class="mb-4">
          <h3>{{$t('yhteiset-opinnot')}}</h3>

          <EpKoulutuksenOsaKortti
            v-for="koulutuksenosaViite in yhteisetKoulutuksenosat"
            :key="'koulutuksenosa'+koulutuksenosaViite.id"
            :koulutuksenosa="koulutuksenosaViite.koulutuksenosa"
            :route="{name: 'koulutuksenosa', params: {'sisaltoviiteId': koulutuksenosaViite.id}}"/>
        </div>

        <template v-if="valinnaisetKoulutuksenosat.length > 0">
          <h3>{{$t('valinnaiset-opinnot')}}</h3>

          <EpKoulutuksenOsaKortti
            v-for="koulutuksenosaViite in valinnaisetKoulutuksenosat"
            :key="'koulutuksenosa'+koulutuksenosaViite.id"
            :koulutuksenosa="koulutuksenosaViite.koulutuksenosa"
            :route="{name: 'koulutuksenosa', params: {'sisaltoviiteId': koulutuksenosaViite.id}}"/>
        </template>

      </template>

    </EpEditointi>

  </div>
</template>

<script lang="ts">
import { KoulutuksenOsatStore } from '@/stores/KoulutuksenOsatStore';
import _ from 'lodash';
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { KoulutuksenOsaDtoKoulutusOsanTyyppiEnum, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import EpKoulutuksenOsaKortti from '@shared/components/EpKoulutuksenosa/EpKoulutuksenOsaKortti.vue';
import { AbstractRouteSisalto } from './AbstractRouteSisalto';
import { KoulutuksenosaStore } from '../stores/KoulutuksenosaStore';

@Component({
  components: {
    EpEditointi,
    EpKoulutuksenOsaKortti,
  },
})
export default class RouteKoulutuksenOsat extends AbstractRouteSisalto {
  private editointiStore: EditointiStore | null = null;

  async fetch() {
    this.editointiStore = new EditointiStore(
      new KoulutuksenOsatStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.toteutussuunnitelma as OpetussuunnitelmaDto,
        async () => this.toteutussuunnitelmaStore.initNavigation(),
      ),
    );
  }

  get koulutuksenosat() {
    return this.editointiStore?.data.value.koulutuksenosat;
  }

  get yhteisetKoulutuksenosat() {
    return _.filter(this.koulutuksenosat, koulutuksenosaViite => koulutuksenosaViite.koulutuksenosa.koulutusOsanTyyppi === _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.YHTEINEN));
  }

  get valinnaisetKoulutuksenosat() {
    return _.filter(this.koulutuksenosat, koulutuksenosaViite => koulutuksenosaViite.koulutuksenosa.koulutusOsanTyyppi === _.toLower(KoulutuksenOsaDtoKoulutusOsanTyyppiEnum.VALINNAINEN));
  }
}
</script>

<style scoped lang="scss">

</style>

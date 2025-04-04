<template>
  <EpEditointi v-if="editointiStore" :store="editointiStore" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
    <template #header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.tuvaLaajaAlainenOsaaminen.nimi) }}</h2>
    </template>
     <template #default="{ data, data: { tuvaLaajaAlainenOsaaminen }, isEditing }">
      <b-row>
        <b-col md="10">

          <EpCollapse v-if="isEditing || (data.naytaPerusteenTeksti && perusteenTeksti)">
            <h4 slot="header">{{$t('perusteen-teksti')}}</h4>
            <ep-content layout="normal" v-model="perusteenTeksti" :is-editable="false" :kuvaHandler="kuvaHandler"/>
            <ep-toggle v-model="data.naytaPerusteenTeksti" :is-editing="true" v-if="isEditing">
              {{$t('nayta-perusteen-teksti')}}
            </ep-toggle>
          </EpCollapse>

          <b-form-group :label="$t('paikallinen-teksti')" v-if="naytaPaikallinenTeksti">
            <ep-content
              layout="normal"
              v-model="tuvaLaajaAlainenOsaaminen.teksti"
              :is-editable="isEditing"
              v-if="isEditing || tuvaLaajaAlainenOsaaminen.teksti"
              :kuvaHandler="kuvaHandler"/>
            <EpAlert
              v-if="!isEditing && !tuvaLaajaAlainenOsaaminen.teksti"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"/>
          </b-form-group>

        </b-col>
      </b-row>
    </template>
  </EpEditointi>
  <EpSpinner v-else class="my-3"/>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import * as _ from 'lodash';
import draggable from 'vuedraggable';

import { KuvaStore } from '@/stores/KuvaStore';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { LaajaalainenOsaaminenStore } from '@/stores/LaajaalainenOsaaminenStore';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/generated/amosaa';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import { YleinenSisaltoViiteStore } from '@/stores/YleinenSisaltoViiteStore';

@Component({
  components: {
    EpSpinner,
    EpEditointi,
    EpContent,
    draggable,
    EpToggle,
    EpAlert,
    EpCollapse,
  },
})
export default class RouteLaajaAlainenOsaaminen extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private sisaltoviiteId!: number;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  private editointiStore: EditointiStore | null = null;

  @Watch('sisaltoviiteId', { immediate: true })
  sisaltoviiteChange() {
    this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  fetch() {
    this.editointiStore = new EditointiStore(
      new YleinenSisaltoViiteStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.versionumero,
        this.toteutussuunnitelmaStore.toteutussuunnitelma.value as any));
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.toteutussuunnitelmaId, this.koulutustoimijaId));
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get naytaPaikallinenTeksti() {
    return this.toteutussuunnitelma?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPS);
  }

  get perusteenTeksti() {
    if (this.editointiStore?.data?.value?.perusteenOsa) {
      return this.editointiStore.data.value.perusteenOsa.teksti;
    }

    return this.editointiStore?.data.value?.perusteteksti;
  }
}
</script>

<style scoped lang="scss">

</style>

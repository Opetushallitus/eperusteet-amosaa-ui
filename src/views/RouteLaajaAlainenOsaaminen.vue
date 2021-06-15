<template>
  <EpEditointi v-if="editointiStore" :store="editointiStore">
    <template #header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.tuvaLaajaAlainenOsaaminen.nimi) }}</h2>
    </template>
     <template #default="{ data: { tuvaLaajaAlainenOsaaminen } }">
      <b-row>
        <b-col md="10">
          <b-form-group :label="$t('kuvaus')">
            <EpContent
              v-model="tuvaLaajaAlainenOsaaminen.teksti"
              layout="normal"
              :is-editable="false"
              :kuvaHandler="kuvaHandler"/>
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

@Component({
  components: {
    EpSpinner,
    EpEditointi,
    EpContent,
    draggable,
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
      new LaajaalainenOsaaminenStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.versionumero));
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.toteutussuunnitelmaId, this.koulutustoimijaId));
  }
}
</script>

<style scoped lang="scss">

</style>

<template>
  <div>
    <EpEditointi v-if="editointiStore" :store="editointiStore" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      <template #header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.perusteenOsa.nimi) }}</h2>
      </template>
      <template #default="{ isEditing, data: { perusteenOsa, kotoOpinto, perusteenLaajaAlaisetOsaamiset } }">

        <EpContent
          class="mb-4"
          v-model="perusteenOsa.kuvaus"
          layout="normal"
          :is-editable="false"
          :kuvaHandler="kuvaHandler"/>

        <EpKotoTaitotasot
          class="mb-4"
          v-model="perusteenOsa.taitotasot"
          :isEditing="false"
          :kuvaHandler="kuvaHandler"
          taitotasoTyyppi="opintokokonaisuus">

          <template #paikallinentarkennus="{ nimi }">
              <h4 slot="label" class="mt-4">{{$t('tavoitteiden-paikallinen-tarkennus')}}</h4>
              <EpContent
                layout="normal"
                v-model="kotoTaitotasotByUri[nimi.uri].tavoiteTarkennus"
                :is-editable="isEditing"
                v-if="isEditing || kotoTaitotasotByUri[nimi.uri].tavoiteTarkennus"
                :kuvaHandler="kuvaHandler"/>
              <EpAlert
                v-if="!isEditing && !kotoTaitotasotByUri[nimi.uri].tavoiteTarkennus"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>

              <h4 slot="label" class="mt-4">{{$t('sisaltojen-paikallinen-tarkennus')}}</h4>
              <EpContent
                layout="normal"
                v-model="kotoTaitotasotByUri[nimi.uri].sisaltoTarkennus"
                :is-editable="isEditing"
                v-if="isEditing || kotoTaitotasotByUri[nimi.uri].sisaltoTarkennus"
                :kuvaHandler="kuvaHandler"/>
              <EpAlert
                v-if="!isEditing && !kotoTaitotasotByUri[nimi.uri].sisaltoTarkennus"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
          </template>

        </EpKotoTaitotasot>

        <hr/>

        <EpKotoLaajaAlainenOsaaminen
          v-model="kotoOpinto.laajaAlaisetOsaamiset"
          :perusteenLaajaAlaisetOsaamiset="perusteenLaajaAlaisetOsaamiset"
          :kuvaHandler="kuvaHandler"
          :isEditing="isEditing"
        />

      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { KotoSisaltoStore } from '@/stores/KotoSisaltoStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpKotoTaitotasot from '@shared/components/EpKotoTaitotasot/EpKotoTaitotasot.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpKotoLaajaAlainenOsaaminen from '@/components/EpKotoLaajaAlainenOsaaminen/EpKotoLaajaAlainenOsaaminen.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpEditointi,
    EpContent,
    EpAlert,
    EpKotoTaitotasot,
    EpButton,
    EpKotoLaajaAlainenOsaaminen,
  },
})
export default class RouteKotoOpinto extends Vue {
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

  @Watch('toteutussuunnitelma', { immediate: true })
  opetussuunnitelmaChange() {
    this.fetch();
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get kotoTaitotasotByUri() {
    return _.keyBy(this.editointiStore?.data.value.kotoOpinto.taitotasot, 'koodiUri');
  }

  fetch() {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
      this.editointiStore = new EditointiStore(
        new KotoSisaltoStore(
          this.toteutussuunnitelmaId,
          this.koulutustoimijaId,
          this.sisaltoviiteId,
          this.versionumero,
          this.toteutussuunnitelmaStore.toteutussuunnitelma.value as OpetussuunnitelmaDto));
    }
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
@import '@shared/styles/_variables.scss';

</style>

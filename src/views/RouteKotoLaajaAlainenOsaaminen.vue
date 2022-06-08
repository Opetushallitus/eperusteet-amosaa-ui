<template>
  <div>
    <EpEditointi v-if="editointiStore" :store="editointiStore" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      <template #header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.perusteenOsa.nimi) }}</h2>
      </template>
      <template #default="{ isEditing, data: { perusteenOsa, kotoLaajaAlainenOsaaminen } }">

        <EpContent
          class="mb-4"
          v-model="perusteenOsa.yleiskuvaus"
          layout="normal"
          :is-editable="false"
          :kuvaHandler="kuvaHandler"/>

        <div v-for="(osaamisalue, index) in perusteenOsa.osaamisAlueet" :key="index+'kotoLaajaAlainenOsaaminen'" class="mb-4">
          <h3>{{ $kaanna(osaamisalue.koodi.nimi) }}</h3>
          <EpContent
            layout="normal"
            v-model="osaamisalue.kuvaus"
            :is-editable="false"></EpContent>
        </div>

        <b-form-group>
          <h3 slot="label">{{$t('laaja-alaisen-osaamisen-paikallinen-tarkennus')}}</h3>
          <EpContent
            layout="normal"
            v-model="kotoLaajaAlainenOsaaminen.teksti"
            :is-editable="isEditing"
            v-if="isEditing || kotoLaajaAlainenOsaaminen.teksti"
            :kuvaHandler="kuvaHandler"/>
          <EpAlert
            v-if="!isEditing && !kotoLaajaAlainenOsaaminen.teksti"
            :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
        </b-form-group>
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
import { YleinenSisaltoViiteStore } from '@/stores/YleinenSisaltoViiteStore';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { OpetussuunnitelmaDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpEditointi,
    EpContent,
    EpAlert,
  },
})
export default class RouteKotoLaajaAlainenOsaaminen extends Vue {
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

  fetch() {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
      this.editointiStore = new EditointiStore(
        new YleinenSisaltoViiteStore(
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

<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('muokkaa-jarjestysta') }}</h2>
      </template>

      <template v-slot:default="{ data, isEditing }">

        <div v-for="(rakenne, index) in data.rakenteet" :key="'rakenne'+index" class="mb-5">
          <h3>{{$t(rakenne.otsikko)}}</h3>

          <ep-jarjesta v-if="rakenne.sisalto && rakenne.sisalto.length > 0"
              :isEditable="isEditing"
              v-model="rakenne.sisalto"
              :group="rakenne.otsikko"
              :child-field="rakenne.lapset">
            <template #default="{ node }">
              <span>
                {{ $kaanna(node.nimi) }}
              </span>
            </template>
          </ep-jarjesta>

          <div v-else class="font-italic">{{$t('rakenne-puuttuu-' + rakenne.otsikko)}}</div>

        </div>

      </template>

    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { RakenneStore } from '@/stores/RakenneStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpJarjesta from '@shared/components/EpJarjesta/EpJarjesta.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Toteutus } from '@/utils/toteutustypes';

@Component({
  components: {
    EpEditointi,
    EpJarjesta,
  },
})
export default class RouteJarjestys extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  private editointiStore: EditointiStore | null = null;

  mounted() {
    this.editointiStore = new EditointiStore(
      new RakenneStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        async () => this.toteutussuunnitelmaStore.initNavigation(this.koulutustoimijaId, this.toteutussuunnitelmaId),
        this.toteutus,
      ));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>

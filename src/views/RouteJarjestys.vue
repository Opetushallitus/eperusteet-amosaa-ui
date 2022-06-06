<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $t('muokkaa-jarjestysta') }}</h2>
      </template>

      <template v-slot:default="{ data, isEditing }">
          <ep-jarjesta v-if="data.rakenne"
              :isEditable="isEditing"
              v-model="data.rakenne"
              :group="'rakenne'"
              child-field="lapset">
            <template #default="{ node }">
              <span>
                {{ $kaanna(node.nimi) }}
              </span>
            </template>
            <div slot="chapter"></div>
          </ep-jarjesta>
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
import { Toteutus } from '@shared/utils/perusteet';

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

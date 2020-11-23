<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.tekstiKappale.nimi) }}</h2>
      </template>

      <template v-slot:default="{ data, isEditing, validation }">

        <div class="container">

          <div v-if="data.perusteteksti">

            <EpCollapse>
              <h4 slot="header">{{$t('perusteen-teksti')}}</h4>
              <ep-content layout="normal" v-model="data.perusteteksti" :is-editable="false" :kuvaHandler="kuvaHandler"/>
              <ep-toggle v-model="data.naytaPerusteenTeksti" :is-editing="true" v-if="isEditing">
                {{$t('nayta-perusteen-teksti')}}
              </ep-toggle>
            </EpCollapse>

            <b-form-group :label="$t('paikallinen-teksti')">
              <ep-content
                layout="normal"
                v-model="data.tekstiKappale.teksti"
                :is-editable="isEditing"
                v-if="isEditing || data.tekstiKappale.teksti"
                :kuvaHandler="kuvaHandler"/>
              <EpAlert
                v-if="!isEditing && !data.tekstiKappale.teksti"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
                class="pb-3"/>
            </b-form-group>
          </div>

          <div v-else>
            <b-form-group :label="$t('otsikko')" v-if="isEditing">
              <ep-field v-model="data.tekstiKappale.nimi" :is-editing="isEditing"></ep-field>
            </b-form-group>

            <b-form-group :label="$t('kappaleen-teksti')" :label-sr-only="!isEditing">
              <ep-content layout="normal" v-model="data.tekstiKappale.teksti" :is-editable="isEditing" :kuvaHandler="kuvaHandler"/>
            </b-form-group>
          </div>
        </div>
      </template>

    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';

@Component({
  components: {
    EpEditointi,
    EpField,
    EpContent,
    EpToggle,
    EpCollapse,
    EpAlert,
  },
})
export default class RouteTekstikappale extends Vue {
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
      new TekstikappaleStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.versionumero,
        this,
        () => this.toteutussuunnitelmaStore.initNavigation(this.koulutustoimijaId, this.toteutussuunnitelmaId)));
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
@import "@shared/styles/_variables.scss";

  ::v-deep fieldset {
    padding-right: 0px;
  }

  .container {
    margin-left: 0;
    margin-right: 0;
  }

</style>

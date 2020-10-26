<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.tekstiKappale.nimi) }}</h2>
      </template>

      <template v-slot:default="{ data, isEditing, validation }">

        <!-- <div class="container">
          <b-form-group :label="$t('otsikko')" v-if="isEditing">
            <ep-field v-model="data.tekstiKappale.nimi" :is-editing="isEditing"></ep-field>
          </b-form-group>

          <b-form-group :label="$t('kappaleen-teksti')" :label-sr-only="!isEditing">
            <ep-content layout="normal" v-model="data.tekstiKappale.teksti" :is-editable="isEditing" />
          </b-form-group>
        </div> -->
        <b-row>
          <b-col md="8" class="d-flex flex-column py-3">
            <h4>{{ $t('opintokokonaisuuden-nimi') }}</h4>
            {{ $kaanna(data.tekstiKappale.nimi) }}
          </b-col>
          <b-col md="2" class="d-flex flex-column py-3">
            <h4>{{ $t('minimilaajuus') }}</h4>
            {{ data.opintokokonaisuus.minimilaajuus }} {{ $t('opintopiste') }}
          </b-col>
        </b-row>
        <b-row class="py-3">
          <b-col>
             <h4>{{ $t('kuvaus') }}</h4>
             <div v-html="$kaanna(data.opintokokonaisuus.kuvaus)"></div>
          </b-col>
        </b-row>
        <hr/>
        <b-row>
          <b-col class="py-3">
            <h3>{{ $t('opetuksen-tavoitteet') }}</h3>
            <b-row  class="py-3">
              <b-col>
                <h4>{{ $kaanna(data.opintokokonaisuus.opetuksenTavoiteOtsikko) }}</h4>
                <ul>
                  <li v-for="tavoiteItem in data.opintokokonaisuus.tavoitteet" :key="tavoiteItem.id">
                    {{ $kaanna(tavoiteItem.tavoite)}}
                  </li>
                </ul>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <hr/>
        <b-row>
          <b-col class="py-3">
            <h3>{{ $t('keskeiset-sisallot') }}</h3>
            <b-row  class="py-3">
              <b-col>
                <p v-if="data.opintokokonaisuus.keskeisetSisallot">Content</p>
                <p v-else>{{ $t('ei-sisaltoa') }}</p>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <hr/>
        <b-row>
          <b-col class="py-3">
            <h3>{{ $t('arviointi') }}</h3>
            <b-row  class="py-3">
              <b-col>
                <h4>{{ $t('arvioinnin-kuvaus') }}</h4>
                <p v-if="data.opintokokonaisuus.arvioinninKuvaus">Content</p>
                <p v-else>{{ $t('ei-sisaltoa') }}</p>
                <h4>{{ $t('opiskelijan-osaamisen-arvioinnin-kohteet') }}</h4>
                <ul>
                  <li v-for="arviointiItem in data.opintokokonaisuus.arvioinnit" :key="arviointiItem.id">
                    {{$kaanna(arviointiItem.arviointi)}}
                  </li>
                </ul>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </template>

    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';

@Component({
  components: {
    EpEditointi,
    EpField,
    EpContent,
  },
})
export default class RouteOpintokokonaisuus extends Vue {
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

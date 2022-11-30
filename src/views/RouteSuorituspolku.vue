<template>
  <div id="scroll-anchor" v-if="editointiStore">
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data, supportData, isEditing }">
        <h2 class="m-0">{{ $kaanna(data.tekstiKappale.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, supportData, isEditing }">
        <b-form-group :label="$t('suorituspolku-nimi') +' *'" v-if="isEditing">
          <ep-field v-model="data.tekstiKappale.nimi" :is-editing="true"></ep-field>
        </b-form-group>

        <b-form-group :label="$t('suorituspolku-kuvaus')" v-if="isEditing">
          <ep-content layout="normal" v-model="data.tekstiKappale.teksti" :is-editable="true"></ep-content>
          <div class="mt-3">
            <EpToggle :value="data.tyyppi === 'osasuorituspolku'" @input="toggleTyyppi(data)" :is-editing="true" class="">
              {{ $t('osasuorituspolku') }}
            </EpToggle>
          </div>
        </b-form-group>

        <b-form-group :label="$t('osasuorituspolun-kokonaislaajuus')" v-if="data.tyyppi === 'osasuorituspolku'">
          <div class="d-flex">
            <ep-field type="number" v-model="data.suorituspolku.osasuorituspolkuLaajuus" :is-editing="isEditing"></ep-field>
            <div class="ml-1" :class="{'ml-2 pt-1': isEditing}">{{$t('osaamispiste')}}</div>
          </div>
        </b-form-group>
        <b-form-group :label="$t('tutkinnon-kuvaus')" v-else>
          <ep-content layout="normal" v-model="supportData.rakenne.kuvaus"></ep-content>
          <div class="mt-3" v-if="isEditing">
            <EpToggle v-model="data.suorituspolku.naytaKuvausJulkisesti" :is-editing="true">
              {{ $t('nayta-kuvaus-julkisesti') }}
            </EpToggle>
          </div>
        </b-form-group>

        <div class="suorituspolut">
          <div class="st-header">
            <div class="d-flex justify-content-between w-100">
              <div class="w-75">
                <div class="d-flex">
                  <div>
                    <span class="font-weight-bold">
                      {{ $t('rakenne') }}
                    </span>
                    <b-button variant="link" @click="toggleOpen()">{{ $t('avaa-sulje') }}</b-button>
                  </div>
                  <div class="ml-5">
                    <b-button variant="link" @click="toggleKuvaukset()">
                      {{ $t(naytaKuvaukset ? 'piilota-kuvaukset' : 'nayta-kuvaukset') }}
                    </b-button>
                  </div>
                  <div class="ml-5">
                    <b-button variant="link" @click="togglePoistetut()">{{
                      $t(naytaPoistetut ? 'piilota-poistetut' : 'nayta-poistetut') }}
                    </b-button>
                  </div>
                </div>
              </div>
              <div class="w-25 text-right font-weight-bold">
                {{ $t('osaamispiste') }}
              </div>
            </div>

          </div>
          <div>
            <EpSuorituspolkuNode v-model="data.suorituspolku"
                                 :is-editing="isEditing"
                                 :tutkinnon-osat="supportData.tutkinnonOsat"
                                 :tutkinnon-osa-viitteet="supportData.tutkinnonOsaViitteet"
                                 :tutkinnonOsaViitteetByTutkinnonOsaId="supportData.tutkinnonOsaViitteetByTutkinnonOsaId"
                                 :liitettavat-osat="supportData.liitettavatOsat"
                                 :nayta-kuvaukset="naytaKuvaukset"
                                 :nayta-piilotetut="naytaPoistetut"
                                 :node="supportData.rakenne" />
          </div>
        </div>
      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import draggable from 'vuedraggable';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSuorituspolkuNode from '@/components/EpAmmatillinen/EpSuorituspolkuNode.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { SisaltoEditStore } from '@/stores/SisaltoEditStore';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpToggle,
    EpContent,
    EpEditointi,
    EpField,
    EpSearch,
    EpSpinner,
    EpSuorituspolkuNode,
    draggable,
  },
})
export default class RouteSuorituspolku extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: string | number;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private sisaltoviiteId!: string | number;

  private editointiStore: EditointiStore | null = null;
  private naytaPoistetut = false;
  private naytaKuvaukset = false;

  @Watch('toteutussuunnitelma', { immediate: true })
  toteutussuunnitelmaChange() {
    this.fetch();
  }

  @Watch('sisaltoviiteId', { immediate: true })
  sisaltoviiteChange() {
    this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value || null;
  }

  get perusteId() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value!.peruste!.id;
  }

  get support() {
    if (this.editointiStore && this.editointiStore.supportData.value) {
      return this.editointiStore.supportData.value;
    }
    return null;
  }

  private fetch = _.debounce(this.fetchImpl, 100);

  fetchImpl() {
    if (this.toteutussuunnitelma) {
      this.editointiStore = new EditointiStore(
        new SisaltoEditStore(
          _.toNumber(this.toteutussuunnitelmaId),
          _.toString(this.koulutustoimijaId),
          _.toNumber(this.sisaltoviiteId),
          this.perusteId!,
          null as unknown as number,
          this,
          false));
    }
  }

  toggleTyyppi(data) {
    if (data.tyyppi === 'suorituspolku') {
      data.tyyppi = 'osasuorituspolku';
    }
    else {
      data.tyyppi = 'suorituspolku';
    }
  }

  toggleOpen() {
  }

  toggleKuvaukset() {
    this.naytaKuvaukset = !this.naytaKuvaukset;
  }

  togglePoistetut() {
    this.naytaPoistetut = !this.naytaPoistetut;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.suorituspolut {
  padding-right: 20px;
  background-color: #f5f5f5;

  .st-header {
    padding: 20px 20px 0px 20px;
  }
}

</style>

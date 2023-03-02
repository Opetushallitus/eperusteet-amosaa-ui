<template>
  <div id="scroll-anchor" v-if="editointiStore">
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data, supportData }">
        <h2 class="m-0">
          <span v-if="perusteenOsaAlue">{{ $kaanna(perusteenOsaAlue.nimi) }}</span>
          <span v-if="osaAlueValue.nimi">{{ $kaanna(osaAlueValue.nimi) }}</span>
          <span v-if="osaAlueValue.piilotettu">({{ $t('piilotettu') }})</span>
        </h2>
      </template>
      <template v-slot:default="{ data, supportData, isEditing }">

        <div class="d-flex flex-lg-wrap justify-content-between">
          <b-form-group class="flex-grow-1 mr-6" :label="$t('osa-alueen-nimi')" v-if="isEditing">
            <ep-field
              v-if="tyyppi === 'paikallinen'"
              v-model="data.osaAlueet[osaAlueIdx].nimi"a
              :is-editing="isEditing">
            </ep-field>
            <span v-else>{{ $kaanna(perusteenOsaAlue.nimi) }}</span>
          </b-form-group>

          <b-form-group class="flex-grow-1 mr-6" :label="$t('koodi')" v-if="perusteenOsaAlue">
            <span>{{ perusteenOsaAlue.koodi.arvo }}</span>
          </b-form-group>
        </div>

        <b-form-group class="" :label="$t('tutkinnon-osa')" v-if="supportData.tutkinnonOsa">
          <router-link :to="{ name: 'tutkinnonosa' }">{{ $kaanna(supportData.tutkinnonOsa.nimi) }}</router-link>
        </b-form-group>

        <b-tabs class="ml-0 pl-0 mt-4">
          <b-tab :title="$t('paikallinen-toteutus')" class="mt-4">
            <div v-if="tyyppi === 'valinnainen'">
              <EpToggle v-if="isEditing" :is-editing="true" v-model="data.osaAlueet[osaAlueIdx].piilotettu">{{ $t('piilota-osa-alue') }}</EpToggle>
            </div>

            <h3 class="mt-4 mb-4">{{$t('toteutukset')}}</h3>
            <EpOsaAlueToteutukset v-model="data.osaAlueet[osaAlueIdx].toteutukset" :isEditing="isEditing"/>
          </b-tab>

          <b-tab v-if="tyyppi === 'paikallinen'" :title="$t('sisalto')">
            <h3 class="mt-4 mb-4">{{$t('sisalto')}}</h3>

            <b-form-group>
              <h4 slot="label" class="pt-3">{{$t('laajuus')}}</h4>
              <div class="d-flex align-items-center" >
                <ep-field type="number" v-model="data.osaAlueet[osaAlueIdx].laajuus" :is-editing="isEditing"></ep-field>
                <div class="ml-2">{{ $t('osaamispiste') }}</div>
              </div>
            </b-form-group>

            <b-form-group>
              <h4 slot="label" class="pt-3">{{$t('osaamistavoitteet')}}</h4>
              <EpAmmattitaitovaatimukset v-model="data.osaAlueet[osaAlueIdx].osaamistavoitteet"
                                 :kohdealueettomat="false"
                                 :kaannos-tavoiteet="$t('tavoitteet')"
                                 :kaannos-lisaa-kohdealue="$t('lisaa-tavoiteryhma')"
                                 :kaannos-lisaa-ammattitaitovaatimus="$t('lisaa-tavoite')"
                                 kaannos-kohdealueet=""
                                 :kaannos-kohdealue="$t('tavoitteiden-otsikko')"
                                 :kaannos-vaatimukset="$t('tavoitteet')"
                                 :kaannos-kohde="$t('opiskelija')"
                                 tavoitekoodisto=""
                                 :show-kohde="false"
                                 :is-editing="isEditing" />

            </b-form-group>

            <b-form-group>
              <GeneerinenArviointi :is-editing="isEditing" v-model="data.osaAlueet[osaAlueIdx].geneerinenarviointi"></GeneerinenArviointi>
            </b-form-group>
          </b-tab>

          <b-tab v-else :title="$t('perusteen-sisalto')">
            <Osaamistavoitteet v-model="data.osaAlueet[osaAlueIdx]"
                           :is-editing="isEditing"
                           :tyyppi="tyyppi"
                           :peruste-data="perusteenOsaAlue" />
          </b-tab>
        </b-tabs>

      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Watch, Prop, Mixins, Component, Vue, InjectReactive } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import Osaamistavoitteet from '@/components/EpAmmatillinen/Osaamistavoitteet.vue';
import { OsaAlueStore } from '@/stores/OsaAlueStore';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpOsaAlueToteutukset from '@shared/components/EpTutkinnonosa/EpOsaAlueToteutukset.vue';
import EpAmmattitaitovaatimukset from '@shared/components/EpAmmattitaitovaatimukset/EpAmmattitaitovaatimukset.vue';
import GeneerinenArviointi from '@/components/EpAmmatillinen/GeneerinenArviointi.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpField,
    Osaamistavoitteet,
    EpInput,
    EpOsaAlueToteutukset,
    EpAmmattitaitovaatimukset,
    GeneerinenArviointi,
    EpToggle,
  },
})
export default class RouteOsaAlue extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: string | number;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private sisaltoviiteId!: string | number;

  @Prop({ required: true })
  private osaalueId!: string | number;

  private editointiStore: EditointiStore | null = null;

  get tyyppi() {
    return this.osaAlueValue?.tyyppi;
  }

  get osaamistavoitteidenNimi() {
    if (this.tyyppi === 'pakollinen') {
      return 'pakolliset-osaamistavoitteet';
    }
    else if (this.tyyppi === 'valinnainen') {
      return 'valinnaiset-osaamistavoitteet';
    }
    else if (this.tyyppi === 'paikallinen') {
      return 'paikalliset-osaamistavoitteet';
    }
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

  get storeData() {
    if (this.editointiStore) {
      return this.editointiStore.data.value;
    }
    return null;
  }

  get osaAlueIdx() {
    if (!this.storeData) {
      return -1;
    }
    return _.findIndex(this.storeData.osaAlueet, { id: Number(this.osaalueId) });
  }

  get osaAlueValue() {
    if (this.storeData && this.osaAlueIdx > -1) {
      return this.storeData.osaAlueet[this.osaAlueIdx as number];
    }
    return null;
  }

  get perusteenOsaAlue() {
    if (this.osaAlueValue && this.support) {
      return _.find(this.support.tutkinnonOsa.osaAlueet || [], { id: Number(this.osaAlueValue.perusteenOsaAlueId!) }) || null;
    }
    return null;
  }

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

  @Watch('osaalueId', { immediate: true })
  osaalueIdChange() {
    this.fetch();
  }

  private fetch = _.debounce(this.fetchImpl, 100);

  fetchImpl() {
    if (this.toteutussuunnitelma) {
      this.editointiStore = new EditointiStore(
        new OsaAlueStore(
          _.toNumber(this.toteutussuunnitelmaId),
          _.toString(this.koulutustoimijaId),
          _.toNumber(this.sisaltoviiteId),
          this.perusteId!,
          null as unknown as number,
          this,
          false,
          _.toNumber(this.osaalueId)));
    }
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

</style>

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
              v-model="data.osaAlueet[osaAlueIdx].nimi"
              :is-editing="isEditing">
            </ep-field>
            <span v-else>{{ $kaanna(perusteenOsaAlue.nimi) }}</span>
          </b-form-group>

          <b-form-group class="flex-grow-1 mr-6" :label="$t('koodi')" v-if="perusteenOsaAlue">
            <span>{{ perusteenOsaAlue.koodi.arvo }}</span>
          </b-form-group>

          <b-form-group class="flex-grow-1 mr-6" :label="$t('tutkinnon-osa')" v-if="perusteenOsaAlue">
            <router-link :to="{ name: 'tutkinnonosa' }">{{ $kaanna(supportData.tutkinnonOsa.nimi) }}</router-link>
          </b-form-group>
        </div>

        <ep-collapse :borderBottom="true" :collapsable="!isEditing" :class="{'pt-0 pb-0': isEditing}">
          <h3 slot="header">{{ $t('paikallinen-toteutus') }}</h3>

          <div v-if="tyyppi === 'valinnainen'">
            <EpToggle v-if="isEditing" :is-editing="true" v-model="data.osaAlueet[osaAlueIdx].piilotettu">{{ $t('piilota-osa-alue') }}</EpToggle>
            <div class="mb-3"></div>
          </div>

          <h4>{{$t('toteutustavat-ja-oppimisymparisto')}}</h4>
          <ep-content layout="normal" v-model="data.osaAlueet[osaAlueIdx].tavatjaymparisto" :is-editable="isEditing" />

          <h4 class="mt-4">{{$t('osaamisen-arvioinnista')}}</h4>
          <ep-content layout="normal" v-model="data.osaAlueet[osaAlueIdx].arvioinnista" :is-editable="isEditing"> </ep-content>

          <hr v-if="data.osaAlueet[osaAlueIdx].vapaat.length > 1" class="mt-5"/>
          <EpVapaatTekstit v-model="data.osaAlueet[osaAlueIdx].vapaat" :isEditing="isEditing"/>
        </ep-collapse>

        <Osaamistavoitteet v-model="data.osaAlueet[osaAlueIdx]"
                           :is-editing="isEditing"
                           :tyyppi="tyyppi"
                           :peruste-data="perusteenOsaAlue" />
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
import EpVapaatTekstit from '@/components/common/EpVapaatTekstit.vue';

@Component({
  components: {
    EpButton,
    EpCollapse,
    EpContent,
    EpEditointi,
    EpField,
    Osaamistavoitteet,
    EpVapaatTekstit,
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
    return this.$route.params.tyyppi;
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

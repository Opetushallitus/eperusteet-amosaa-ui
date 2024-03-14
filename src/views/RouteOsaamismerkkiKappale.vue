<template>
  <div id="scroll-anchor" v-if="editointiStore">
    <EpEditointi :store="editointiStore" :versionumero="versionumero" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      <template v-slot:header>
        <h2 class="m-0">{{ $t('kansalliset-perustaitojen-osaamismerkit') }}</h2>
      </template>
      <template v-slot:default="{ isEditing }">
        <EpOsaamismerkkiKappale v-model="osaamismerkkiKappale"
                                :toteutussuunnitelma-id="toteutussuunnitelmaId"
                                :koulutustoimija-id="koulutustoimijaId"
                                :is-editing="isEditing"
                                @addListItem="onAddListItem"
                                @removeListItem="onRemoveListItem"></EpOsaamismerkkiKappale>
      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OsaamismerkkiKappaleStore } from '@/stores/OsaamismerkkiKappaleStore';
import EpOsaamismerkkiKappale from '@/components/EpOsaamismerkkiKappale/EpOsaamismerkkiKappale.vue';

@Component({
  components: {
    EpOsaamismerkkiKappale,
    EpEditointi,
  },
})
export default class RouteOsaamismerkkiKappale extends Vue {
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
      new OsaamismerkkiKappaleStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.versionumero,
        this,
        this.toteutussuunnitelmaStore.toteutussuunnitelma,
        () => this.toteutussuunnitelmaStore.initNavigation()));
  }

  onAddListItem(merkit) {
    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      osaamismerkkiKappale: {
        ...this.editointiStore?.data.value.osaamismerkkiKappale,
        osaamismerkkiKoodit: [
          ...this.editointiStore?.data.value.osaamismerkkiKappale.osaamismerkkiKoodit,
          ...this.addMerkit(merkit)],
      },
    });
  }

  addMerkit(merkit) {
    return _.map(merkit, merkki => {
      return {
        nimi: merkki.nimi,
        koodi: merkki.arvo,
      };
    });
  }

  onRemoveListItem(poistettavaRivi: { [key: string]: any }) {
    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      osaamismerkkiKappale: {
        ...this.editointiStore?.data.value.osaamismerkkiKappale,
        osaamismerkkiKoodit: _.filter(this.editointiStore?.data.value.osaamismerkkiKappale.osaamismerkkiKoodit, rivi => rivi.koodi !== poistettavaRivi.koodi),
      },
    });
  }

  get osaamismerkkiKappale() {
    return this.editointiStore?.data.value.osaamismerkkiKappale;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }
}
</script>

<style scoped lang="scss">
</style>

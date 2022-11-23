<template>
  <div class="minfull p-0 m-0">

    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left d-flex justify-content-center">
          <EpValidPopover
            :validoitava="toteutussuunnitelma"
            :validoinnit="validoinnit"
            :julkaisemattomiaMuutoksia="onkoJulkaisemattomiaMuutoksia"
            :julkaistava="!isOpsPohja"
            @asetaValmiiksi="asetaValmiiksi"
            @palauta="palauta"
            :tyyppi="toteutus ==='ammatillinen' ? 'toteutussuunnitelma' : 'opetussuunnitelma'"
          />
        </div>
        <div class="flex-grow-1 align-self-center">
          <div class="mb-5 p-2" v-if="toteutussuunnitelma">
            <h1>
              <span>{{ $kaanna(toteutussuunnitelma.nimi) }}</span>
              <b-dropdown class="asetukset" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
                <template v-slot:button-content>
                  <fas icon="ratas" class="hallinta" />
                </template>

                <div v-for="(ratasvalinta, index) in ratasvalinnat" :key="'ratasvalinta'+index"
                  v-oikeustarkastelu="ratasvalinta.oikeus">

                  <hr v-if="ratasvalinta.separator" class="mt-2 mb-2" />

                  <b-dropdown-item v-if="ratasvalinta.route" :to="{ name: ratasvalinta.route }">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>

                  <b-dropdown-item v-if="ratasvalinta.click" @click="ratasClick(ratasvalinta.click, ratasvalinta.meta)">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </h1>
            <div class="diaarinumero" v-if="toteutussuunnitelma.peruste">
              {{ $kaanna(toteutussuunnitelma.peruste.nimi) }} | {{ toteutussuunnitelma.peruste.diaarinumero }}
            </div>
          </div>
        </div>
      </div>
    </Portal>

    <EpSidebar v-if="navigation" :show-social="false">
      <template v-slot:bar>
        <div class="m-3 ml-4 mr-4">
          <EpSearch v-model="query" />
        </div>
        <div class="navigation">
          <EpTreeNavibar
            :store="naviStore"
            show-all-toggle
            :query="query">
            <template v-slot:header>
              <div class="heading">
                <div class="menu-item">
                  <router-link :to="{ name: 'toteutussuunnitelma' }" exact>
                    {{ $t('yleisnakyma') }}
                  </router-link>
                </div>
              </div>
            </template>

            <template v-slot:tutkinnonosat>
              <div class="menu-item">
                <router-link :to="{ name: 'tutkinnonosat' }">
                  {{ $t('tutkinnonosat') }}
                </router-link>
              </div>
            </template>

            <template v-slot:suorituspolut="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'suorituspolut', params: {sisaltoviiteId: item.id} }">
                  {{ $t('suorituspolut') }}
                </router-link>
              </div>
            </template>

            <template v-slot:tutkinnonosa="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tutkinnonosa', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) || $t('nimeton-tutkinnonosa') }}
                </router-link>
              </div>
            </template>

            <template v-slot:suorituspolku="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'suorituspolku', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:tekstikappale="{ item }">
              <div class="menu-item">
                <span  v-if="isVapaaSivistystyo" class="text-muted mr-1">{{ item.chapter }}</span>
                <router-link :to="{ name: 'tekstikappale', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) || $t('nimetön-tekstikappale') }}
                </router-link>
              </div>
            </template>

            <template v-slot:opintokokonaisuus="{ item }">
              <div class="menu-item">
                <span  v-if="isVapaaSivistystyo" class="text-muted mr-1">{{ item.chapter }}</span>
                <router-link :to="{ name: 'opintokokonaisuus', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) || $t('nimeton-opintokokonaisuus') }}
                </router-link>
              </div>
            </template>

            <template v-slot:koulutuksenosat>
              <div class="menu-item">
                <router-link :to="{ name: 'koulutuksenosat' }">
                  {{ $t('koulutuksenosat') }}
                </router-link>
              </div>
            </template>

            <template v-slot:koulutuksenosa="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'koulutuksenosa', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }} <span v-if="item.koodi">({{item.koodi}})</span>
                </router-link>
              </div>
            </template>

            <template v-slot:laajaalainenosaaminen="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'laajaalainenosaaminen', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:koto_kielitaitotaso="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'koto_kielitaitotaso', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:koto_opinto="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'koto_opinto', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:koto_laajaalainenosaaminen="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'koto_laajaalainenosaaminen', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:new>
              <div class="mb-3">
                <EpSisaltoLisays
                  v-if="isAmmatillinen"
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  :toteutussuunnitelmaId="toteutussuunnitelmaId"
                  :koulutustoimijaId="koulutustoimijaId"
                  :navigation="navigation.value"
                  :updateNavigation="updateNavigation"
                  :toteutussuunnitelma="toteutussuunnitelma"/>

                <EpTekstikappaleLisays
                  v-if="salliTekstikappaleLisays"
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                  @save="tallennaUusiTekstikappale"
                  :tekstikappaleet="perusteenOsat"
                  :paatasovalinta="true">
                  <template v-slot:default="{tekstikappale}">
                    <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                    {{ $kaanna(tekstikappale.label) }}
                  </template>
                </EpTekstikappaleLisays>

                <EpTekstikappaleLisays
                    v-if="isVapaaSivistystyo"
                    v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'toteutussuunnitelma' }"
                    @save="tallennaUusiOpintokokonaisuus"
                    :tekstikappaleet="perusteenOsat"
                    :paatasovalinta="true"
                    :otsikkoRequired="true"
                    modalId="opintokokonaisuusLisays">
                    <template v-slot:lisays-btn-text>
                      {{$t('uusi-opintokokonaisuus')}}
                    </template>
                    <template v-slot:modal-title>
                      {{$t('uusi-opintokokonaisuus')}}
                    </template>
                    <template v-slot:footer-lisays-btn-text>
                      {{$t('lisaa-opintokokonaisuus')}}
                    </template>
                    <template v-slot:header>
                      {{$t('opintokokonaisuuden-sijainti')}}
                    </template>
                    <template v-slot:default="{tekstikappale}">
                      <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                      {{ $kaanna(tekstikappale.label) }}
                    </template>
                  </EpTekstikappaleLisays>
                </div>
            </template>

          </EpTreeNavibar>
        </div>
      </template>

      <template v-slot:view>
        <router-view />
      </template>

      <template v-slot:bottom>
        <div class="menu-item bottom-menu-item">
          <router-link :to="{ name: 'jarjesta' }" v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
            <span class="text-nowrap">
              <fas icon="jarjesta" fixed-width />
               <a class="btn btn-link btn-link-nav">{{$t('muokkaa-jarjestysta')}}</a>
            </span>
          </router-link>
        </div>
      </template>
    </EpSidebar>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Watch, Prop, Component, Vue, Provide, ProvideReactive } from 'vue-property-decorator';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import EpProgressPopover from '@shared/components/EpProgressPopover/EpProgressPopover.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSisaltoLisays from '@/components/EpSisaltoLisays/EpSisaltoLisays.vue';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { Meta } from '@shared/utils/decorators';
import { MatalaTyyppiEnum, SisaltoviiteMatalaDto, NavigationNodeDtoTypeEnum, OpetussuunnitelmaDtoTilaEnum, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { Murupolku } from '@shared/stores/murupolku';
import { ArkistointiTekstit, OpetussuunnitelmaTyyppi, ToteutussuunnitelmaTiedotKielistykset } from '@/utils/toteutustypes';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import { KayttajaStore } from '@/stores/kayttaja';
import { LinkkiHandler, routeToNode } from '@/utils/routing';
import { chapterStringSort } from '@shared/utils/NavigationBuilder';
import { Toteutus } from '@shared/utils/perusteet';

@Component({
  components: {
    EpTreeNavibar,
    EpSidebar,
    EpButton,
    EpSearch,
    EpSisaltoLisays,
    EpTekstikappaleLisays,
    EpProgressPopover,
    EpSpinner,
    EpValidPopover,
  },
  inject: [],
})
export default class RouteToteutussuunnitelma extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Provide('koulutustoimija')
  private koulutustoimija = this.kayttajaStore.koulutustoimija.value;

  private isInitializing = false;
  private naviStore: EpTreeNavibarStore | null = null;
  private query: string = '';

  get opetussuunnitelmaTyyppi() {
    return this.isOpsPohja ? OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA : this.toteutus;
  }

  @Meta
  getMetaInfo() {
    if (this.toteutussuunnitelmaStore
    && this.toteutussuunnitelmaStore.toteutussuunnitelma
    && this.toteutussuunnitelmaStore.toteutussuunnitelma.value
    && this.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi
    && !_.isEmpty(this.$kaanna(this.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi))) {
      return {
        title: this.$kaanna(this.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi),
        titleTemplate: '%s - ' + this.$t('eperusteet-amosaa'),
      };
    }
  }

  @Watch('toteutussuunnitelmaId', { immediate: true })
  async onToteutussuunnitelmaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue && !this.isInitializing) {
      this.fetch();
    }
  }

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue && !this.isInitializing) {
      this.fetch();
    }
  }

  async fetch() {
    this.isInitializing = true;
    try {
      Murupolku.aseta('toteutussuunnitelma', '...');
      await this.toteutussuunnitelmaStore.init(this.koulutustoimijaId, this.toteutussuunnitelmaId);
      Murupolku.aseta('toteutussuunnitelma', this.$t(OpetussuunnitelmaTyyppi[this.opetussuunnitelmaTyyppi]));

      if (this.navigation) {
        this.naviStore = new EpTreeNavibarStore(this.navigation, routeToNode);
      }
    }
    finally {
      this.isInitializing = false;
    }
  }

  async updateNavigation() {
    await this.toteutussuunnitelmaStore.initNavigation(this.koulutustoimijaId, this.toteutussuunnitelmaId);
  }

  async tallennaUusiTekstikappale(otsikko, valittuTekstikappale) {
    const parentId = valittuTekstikappale?.id ? valittuTekstikappale.id : this.navigation.value!.id!;

    TekstikappaleStore.add(
      this.toteutussuunnitelmaId,
      parentId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(MatalaTyyppiEnum.TEKSTIKAPPALE),
        tekstiKappale: {
          nimi: otsikko,
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }

  async tallennaUusiOpintokokonaisuus(otsikko, valittuOpintokokonaisuus) {
    const parentId = valittuOpintokokonaisuus?.id ? valittuOpintokokonaisuus.id : this.navigation.value!.id!;

    OpintokokonaisuusStore.add(
      this.toteutussuunnitelmaId,
      parentId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(MatalaTyyppiEnum.OPINTOKOKONAISUUS),
        opintokokonaisuus: { tyyppi: 'oma' as string },
        tekstiKappale: {
          nimi: otsikko,
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }

  async palauta() {
    await vaihdaOpetussunnitelmaTilaConfirm(
      this,
      {
        ...ArkistointiTekstit.palautus[this.opetussuunnitelmaTyyppi].meta,
        callback: async () => this.toteutussuunnitelmaStore.init(this.koulutustoimijaId, this.toteutussuunnitelmaId),
      },
    );
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get navigation() {
    return this.toteutussuunnitelmaStore.navigation;
  }

  @ProvideReactive('navigation')
  get navigationValue() {
    return this.toteutussuunnitelmaStore.navigation.value;
  }

  @ProvideReactive('linkkiHandler')
  get linkkiHandler() {
    return new LinkkiHandler();
  }

  get ratasvalinnat() {
    let rattaat = [
      {
        text: ToteutussuunnitelmaTiedotKielistykset[this.opetussuunnitelmaTyyppi]['title'],
        route: 'toteutussuunnitelmantiedot',
        icon: 'info',
        oikeus: { oikeus: 'luku' },
      },
      {
        text: 'ystava-organisaatioiden-kayttooikeudet',
        route: 'ystava-organisaatioiden-kayttooikeudet',
        icon: 'kaytto-oikeus',
        oikeus: { oikeus: 'luonti' },
      },
      {
        text: 'luo-pdf',
        route: 'pdfLuonti',
        icon: 'luo-pdf',
        oikeus: { oikeus: 'muokkaus' },
      },
      {
        text: 'poistetut-sisallot',
        route: 'poistetutsisallot',
        icon: 'roskalaatikko',
        oikeus: { oikeus: 'luonti' },
      },
    ];

    if (!this.isArchived && (this.isDraft || this.$hasOikeus('hallinta', 'oph'))) {
      let oikeus;
      if (this.$hasOikeus('hallinta', 'oph')) {
        oikeus = { oikeus: 'hallinta', kohde: 'oph' };
      }
      else if (this.isDraft) {
        oikeus = { oikeus: 'hallinta', kohde: 'toteutussuunnitelma' };
      }

      rattaat = [
        ...rattaat,
        {
          separator: true,
          oikeus,
        },
        {
          icon: ['far', 'folder'],
          click: vaihdaOpetussunnitelmaTilaConfirm,
          ...ArkistointiTekstit.arkistointi[this.opetussuunnitelmaTyyppi],
          oikeus,
        },
      ];
    }

    return rattaat;
  }

  ratasClick(clickFn, meta) {
    clickFn(this, meta);
  }

  get isAmmatillinen(): boolean {
    return this.toteutus === Toteutus.AMMATILLINEN;
  }

  get isVapaaSivistystyo(): boolean {
    return this.toteutus === Toteutus.VAPAASIVISTYSTYO;
  }

  get isTutkintoonValmentava(): boolean {
    return this.toteutus === Toteutus.TUTKINTOONVALMENTAVA;
  }

  get isKoto(): boolean {
    return this.toteutus === Toteutus.KOTOUTUMISKOULUTUS;
  }

  get tekstikappaleet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === (NavigationNodeDtoTypeEnum.Tekstikappale as string));
  }

  get opintokokonaisuudet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
  }

  get koulutuksenosat() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Koulutuksenosa);
  }

  get laajaalaisetOsaamiset() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Laajaalainenosaaminen);
  }

  get perusteenOsat() {
    return _.sortBy([
      ...this.tekstikappaleet,
      ...this.opintokokonaisuudet,
      ...this.koulutuksenosat,
      ...this.laajaalaisetOsaamiset,
    ], osa => chapterStringSort(osa.chapter));
  }

  get validoinnit() {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value) {
      return {
        virheet: _.chain(this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value.virheet)
          .keyBy('syy')
          .keys()
          .value(),
        huomautukset: [],
      };
    }
  }

  get tila() {
    if (this.julkaisut) {
      if (this.isPublished) {
        return _.toLower(OpetussuunnitelmaDtoTilaEnum.JULKAISTU);
      }

      return _.toLower(this.toteutussuunnitelma?.tila);
    }
  }

  get julkaisut() {
    return this.toteutussuunnitelmaStore.julkaisut.value;
  }

  get isPublished(): boolean {
    return this.toteutussuunnitelma?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.JULKAISTU) || _.size(this.julkaisut) > 0;
  }

  get isReady(): boolean {
    return this.toteutussuunnitelma?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.VALMIS);
  }

  get isDraft(): boolean | undefined {
    return !this.isPublished && this.toteutussuunnitelma?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.LUONNOS);
  }

  get isArchived(): boolean {
    return this.toteutussuunnitelma?.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.POISTETTU);
  }

  get isOpsPohja() {
    return this.toteutussuunnitelma?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
  }

  async asetaValmiiksi() {
    await vaihdaOpetussunnitelmaTilaConfirm(
      this,
      {
        tila: 'VALMIS',
        title: 'aseta-pohja-valmiiksi',
        confirm: 'pohja-valmis-varmistus',
        okTitle: 'aseta-valmiiksi',
        callback: async () => this.toteutussuunnitelmaStore.init(this.koulutustoimijaId, this.toteutussuunnitelmaId),
      },
    );
  }

  get salliTekstikappaleLisays() {
    return this.isTutkintoonValmentava || this.isVapaaSivistystyo || this.isKoto;
  }

  get onkoJulkaisemattomiaMuutoksia() {
    return this.toteutussuunnitelmaStore.julkaisemattomiaMuutoksia.value;
  }
}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables';

.portal-menu {
  height: 140px;

  h1 {
    margin: 0;
    padding: 0;

    .asetukset {
      .hallinta {
        color: white;
      }

      ::v-deep .dropdown-item {
        padding-left: 1rem;
        padding-right: 2rem;
      }

      svg:not(.hallinta) {
        width: 25px;
      }
    }
  }

  .upper-left {
    @media (max-width: 991.98px) {
      padding: 0 30px;
    }
    @media (min-width: 992px) {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
    }
  }
}

.navigation {
  height: calc(100% - 160px);
}

.heading {
  margin-left: 28px;
  margin-right: 28px;
}

.menu-item {
  font-size: 14px;
  padding: 7px 10px 7px 10px;

  a {
    &.router-link-exact-active {
      font-weight: 600;
    }
  }
}

.menu-item:not(.bottom-menu-item) a{
  color: #000;
}

.navigation ::v-deep .ep-button .btn {
  font-size: 14px;
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

.validation-text {
  font-size: 14px;
}

::v-deep .structure-toggle {
  margin-left: 35px;
  margin-bottom: 10px;
  margin-right: 35px;
}

</style>

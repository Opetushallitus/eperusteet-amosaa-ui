<template>
  <div class="minfull p-0 m-0">

    <Portal to="headerExtension">
      <div class="portal-menu d-flex">
        <div class="upper-left">
          <!-- <ep-progress-popover :slices="progressSlices">

            <template v-slot:header>
              <div class="pt-1 row justify-content-center" v-if="validationStats">
                <div v-if="validationStats.ok < validationStats.total">
                  {{ validationStats.ok }} / {{ validationStats.total }} {{$t('valmis')}}
                </div>
                <div v-else-if="validationCategories">
                  <b-button class="px-3 py-1" variant="primary"
                      :to="{ name: 'perusteprojekti' }">{{ $t('julkaise') }}</b-button>
                </div>
              </div>
            </template>

            <div v-if="validationStats" class="row justify-content-center">
              <b-button v-if="validationStats.ok < validationStats.total"
                        variant="primary"
                        :to="{ name: 'perusteprojekti' }">{{ $t('siirry-julkaisunakymaan') }}</b-button>
              <div v-if="validationCategories">
                <div class="pl-3 pt-2 pb-1 row" v-for="c in validationStats.categories" :key="c.category">
                  <div class="col-1">
                    <fas class="text-success" icon="check-circle" v-if="c.failcount === 0"/>
                    <fas class="text-danger" icon="info-circle" v-if="c.failcount > 0"/>
                  </div>
                  <div class="col">
                    <span v-if="c.failcount === 0">{{ $t(c.category + "-validation-ok") }}</span>
                    <span v-if="c.failcount > 0">{{ $t(c.category + "-validation-error") }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ep-spinner v-else />

          </ep-progress-popover> -->
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
                  v-oikeustarkastelu="{ oikeus: ratasvalinta.oikeus, kohde: 'toteutussuunnitelma' }">

                  <hr v-if="ratasvalinta.separator" class="mt-2 mb-2" />

                  <b-dropdown-item v-else :to="{ name: ratasvalinta.route }">
                    <fas :icon="ratasvalinta.icon" />
                    {{ $t(ratasvalinta.text) }}
                  </b-dropdown-item>
                </div>
              </b-dropdown>
            </h1>
            <div class="diaarinumero">
              {{ $kaanna(toteutussuunnitelma.peruste.nimi) }} | {{ toteutussuunnitelma.peruste.diaarinumero }}
            </div>
          </div>
        </div>
      </div>
    </Portal>

    <EpSidebar v-if="navigation" :show-social="false">
      <template v-slot:bar>
        <div class="m-3">
          <EpSearch v-model="query" />
        </div>
        <div class="navigation">
          <EpTreeNavibar :store="naviStore">
            <template v-slot:header>
              <div class="heading">
                <div class="menu-item">
                  <router-link :to="{ name: 'toteutussuunnitelma' }" exact>
                    {{ $t('yleisnakyma') }}
                  </router-link>
                </div>
              </div>
            </template>

            <template v-slot:tutkinnonosat="{ item }">
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
                  {{ $kaanna(item.label) }}
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
                <router-link :to="{ name: 'tekstikappale', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:opintokokonaisuus="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'opintokokonaisuus', params: {sisaltoviiteId: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:new>
              <EpSisaltoLisays
                v-if="toteutusTyyppi === 'ammatillinen'"
                v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'toteutussuunnitelma' }"
                :toteutussuunnitelmaId="toteutussuunnitelmaId"
                :koulutustoimijaId="koulutustoimijaId"
                :navigation="navigation.value"
                :updateNavigation="updateNavigation"
                :toteutussuunnitelma="toteutussuunnitelma"/>

              <EpTekstikappaleLisays
                v-if="toteutusTyyppi === 'vapaasivistystyo'"
                @save="tallennaUusiTekstikappale"
                :tekstikappaleet="perusteenOsat"
                :paatasovalinta="true">
                <template v-slot:default="{tekstikappale}">
                  <span class="text-muted mr-1">{{ tekstikappale.chapter }}</span>
                  {{ $kaanna(tekstikappale.label) }}
                </template>
              </EpTekstikappaleLisays>
            </template>

          </EpTreeNavibar>
        </div>
      </template>

      <template v-slot:view>
        <router-view />
      </template>

      <template v-slot:bottom>
        <div class="menu-item bottom-menu-item">
          <router-link :to="{ name: 'jarjesta' }" v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: 'toteutussuunnitelma' }">
            <span class="text-nowrap">
              <fas icon="jarjesta" fixed-width />
              {{ $t('muokkaa-rakennetta') }}
            </span>
          </router-link>
        </div>
      </template>
    </EpSidebar>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import EpSisaltoLisays from '@/components/EpSisaltoLisays/EpSisaltoLisays.vue';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Meta } from '@shared/utils/decorators';
import { NavigationNodeDtoTypeEnum } from '@shared/api/eperusteet';
import { MatalaTyyppiEnum, SisaltoviiteMatalaDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpTreeNavibar,
    EpSidebar,
    EpButton,
    EpSearch,
    EpSisaltoLisays,
    EpTekstikappaleLisays,
  },
})
export default class RouteToteutussuunnitelma extends Vue {
  @Prop({ required: true })
  private sisaltoViiteStore!: SisaltoViiteStore;

  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutus!: string;

  private isInitializing = false;
  private naviStore: EpTreeNavibarStore | null = null;
  private query: string = '';

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
      await this.toteutussuunnitelmaStore.init(this.koulutustoimijaId, this.toteutussuunnitelmaId);

      if (this.navigation) {
        this.naviStore = new EpTreeNavibarStore(this.navigation, () => null);
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
    let parentId = this.navigation.value!.id!;
    if (valittuTekstikappale && valittuTekstikappale.id) {
      parentId = valittuTekstikappale.id;
    }

    SisaltoViiteStore.add(
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

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get navigation() {
    return this.toteutussuunnitelmaStore.navigation;
  }

  get ratasvalinnat() {
    return [
      {
        text: 'toteutussuunnitelman-tiedot',
        route: 'toteutussuunnitelmantiedot',
        icon: 'info',
        oikeus: 'luku',
      },
      {
        text: 'kayttooikeudet',
        route: 'oikeudet',
        icon: 'kaytto-oikeus',
        oikeus: 'hallinta',
      },
      {
        text: 'luo-pdf',
        route: 'pdfLuonti',
        icon: 'luo-pdf',
        oikeus: 'hallinta',
      },
      {
        text: 'poistetut-sisallot',
        route: 'poistetutsisallot',
        icon: 'roskalaatikko',
        oikeus: 'hallinta',
      },
    ];
  }

  get toteutusTyyppi() {
    return this.toteutus;
  }

  get tekstikappaleet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Viite);
  }

  get opintokokonaisuudet() {
    return _.filter(this.naviStore!.connected.value, node => node.type === NavigationNodeDtoTypeEnum.Opintokokonaisuus);
  }

  get perusteenOsat() {
    return _.sortBy([
      ...this.tekstikappaleet,
      ...this.opintokokonaisuudet,
    ], 'chapter');
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
      padding: 10px 30px;
    }
    @media (min-width: 992px) {
      min-width: $sidebar-width;
      max-width: $sidebar-width;
    }
  }
}

.navigation {
  min-height: 1200px;
}

.heading {
  margin-left: 28px;
  margin-right: 28px;
  border-bottom: 1px solid rgb(216, 216, 216);
}

.menu-item {
  font-size: 14px;
  padding: 7px 10px 7px 10px;

  a {
    color: #000;

    &.router-link-exact-active {
      font-weight: 600;
    }
  }
}

.navigation ::v-deep .ep-button .btn {
  font-size: 14px;
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}
</style>

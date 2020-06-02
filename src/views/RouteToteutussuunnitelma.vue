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

                <div v-for="(ratasvalinta, index) in ratasvalinnat" :key="'ratasvalinta'+index">

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
                <router-link :to="{ name: 'tutkinnonosat', params: {id: item.id} }">
                  {{ $t('tutkinnonosat') }}
                </router-link>
              </div>
            </template>

            <template v-slot:suorituspolut="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'suorituspolut', params: {id: item.id} }">
                  {{ $t('suorituspolut') }}
                </router-link>
              </div>
            </template>

            <template v-slot:tutkinnonosa="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tutkinnonosa', params: {id: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:suorituspolku="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'suorituspolku', params: {id: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

            <template v-slot:tekstikappale="{ item }">
              <div class="menu-item">
                <router-link :to="{ name: 'tekstikappale', params: {id: item.id} }">
                  {{ $kaanna(item.label) }}
                </router-link>
              </div>
            </template>

          </EpTreeNavibar>
        </div>
      </template>

      <template v-slot:new>
        <ep-button variant="link"> <!-- TODO -->
          +{{$t('lisaa-sisaltoa')}}
        </ep-button>
      </template>

      <template v-slot:view>
        <router-view />
      </template>

      <template v-slot:bottom>
        <div class="menu-item bottom-menu-item">
          <router-link :to="{ name: 'jarjesta' }">
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
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import { ToteutussuunnitelmaRoute } from './ToteutussuunnitelmaRoute';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';

@Component({
  components: {
    EpTreeNavibar,
    EpSidebar,
    EpButton,
    EpSearch,
  },
})
export default class RouteToteutussuunnitelma extends ToteutussuunnitelmaRoute {
  private naviStore: EpTreeNavibarStore | null = null;
  private query: string = '';

  async onProjektiChange(koulutustoimijaId: number, toteutussuunnitelmaId: number) {
    if (this.navigation) {
      this.naviStore = new EpTreeNavibarStore(this.navigation);
    }
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get ratasvalinnat() {
    return [];
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
    min-width: $sidebar-width;
    max-width: $sidebar-width;
  }
}

.navigation {
  min-height: 1200px;
}

.heading {
  margin-left: 22px;
}

.menu-item {
  font-size: 0.8rem;

  a {
    color: #000;

    &.router-link-active {
      font-weight: 600;
    }
  }
}

.navigation ::v-deep .ep-button .btn{
  font-size: 0.8rem;
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

</style>

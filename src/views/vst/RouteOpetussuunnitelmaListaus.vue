<template>
  <EpMainView>
    <template slot="header">
      <h1 class="mb-3">{{ $t('opetussuunnitelmat') }}</h1>
      <div class="d-md-flex">
        <p class="mt-2">{{ $t('opetussuunnitelmat-kuvaus') }}</p>
        <EpArkistoidutOps
          v-if="poistetut.length > 0"
          :opetussuunnitelmat="poistetut"
          :title="'arkistoidut-opetussuunnitelmat'"/>
      </div>
      <b-form-group :label="$t('nimi')">
        <EpSearch v-model="rajain" :placeholder="$t('etsi-opetussuunnitelmia')"/>
      </b-form-group>
    </template>
    <b-container fluid class="pl-0">
      <b-row>
        <b-col>
          <div class="ops">
            <EpSpinner v-if="!opslista" />
            <h2>{{ $t('keskeneraiset-opetussuunnitelmat') }}</h2>
            <div class="ops__info" v-if="keskeneraiset.length === 0 && hasRajain">
              {{ $t('ei-hakutuloksia') }}
            </div>
            <div class="d-flex flex-wrap">
              <div
                v-if="!hasRajain"
                class="opsbox"
                v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'opetussuunnitelma' }">
                <RouterLink tag="a" :to="{ name: 'toteutussuunnitelmaLuonti' }">
                  <div class="opsbox__new">
                    <div class="opsbox__plus-icon">
                      <fas icon="plussa"></fas>
                    </div>
                    <div class="opsbox__text">
                      {{ $t('luo-uusi') }}
                    </div>
                  </div>
                </RouterLink>
              </div>
              <div class="opsbox" v-for="ops in keskeneraiset" :key="ops.id">
                <RouterLink
                  tag="a"
                  :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: ops.id } }"
                  :key="ops.id">
                  <div class="opsbox__chart">
                    <div class="opsbox__progress-clamper">
                      <EpProgress :slices="[0.2, 0.5, 1]" />
                    </div>
                  </div>
                  <div class="opsbox__info">
                    <div class="opsbox__name">
                      {{ $kaanna(ops.nimi, true) }}
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>
          <div class="ops">
            <h2 class="mt-4">{{ $t('julkaistut-opetussuunnitelmat') }}</h2>

            <div class="info" v-if="julkaistut.length === 0">
              <div v-if="hasRajain">
                {{ $t('ei-hakutuloksia') }}
              </div>
              <EpAlert v-else :ops="true" :text="$t('ei-julkaistuja-opetussuunnitelmia')" class="mt-4" />
            </div>

            <div class="d-flex flex-wrap">
              <div
                v-for="ops in julkaistut"
                :key="ops.id"
                class="opsbox opsbox--published"
                :style="ops.bannerImage">
                <RouterLink
                  class="d-block h-100"
                  tag="a"
                  :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: ops.id } }"
                  :key="ops.id">
                  <div class="opsbox__info opsbox__info--published d-flex justify-content-center align-items-center">
                    <div class="opsbox__name">
                      {{ $kaanna(ops.nimi) }}
                    </div>
                    <!-- Published date -->
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';

import EpArkistoidutOps from '@/components/EpArkistoidutOps/EpArkistoidutOps.vue';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue'
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue'

import { koulutusTyyppiTile } from '@shared/utils/bannerIcons';
import { Opetussuunnitelmat, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpMainView,
    EpArkistoidutOps,
    EpSearch,
    KoulutustyyppiSelect,
    EpProgress,
    EpAlert,
    EpSpinner,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private rajain = '';
  private opslista: OpetussuunnitelmaDto[] | null = null;

  mounted() {
    this.init();
  }

  get hasRajain() {
    return !_.isEmpty(this.rajain);
  }

  get jarjestetyt() {
    return _(this.opslista)
      .filter((ops: OpetussuunnitelmaDto) => _.includes(
        _.toLower(_.get(ops, 'nimi.' + Kielet.getSisaltoKieli.value)),
        _.toLower(this.rajain)
      ))
      .sortBy('luotu')
      .reverse()
      .value();
  }

  get arkistoimattomat() {
    return _.reject(this.jarjestetyt, (ops: OpetussuunnitelmaDto) => (ops.tila as string) === 'poistettu');
  }

  get keskeneraiset() {
    return _.chain(this.arkistoimattomat)
      .reject((ops: OpetussuunnitelmaDto) => (ops.tila as string) === 'julkaistu')
      .value();
  }

  get julkaistut() {
    return _.chain(this.arkistoimattomat)
      .filter((ops: OpetussuunnitelmaDto) => (ops.tila as string) === 'julkaistu')
      .map((ops: OpetussuunnitelmaDto) => ({ ...ops, bannerImage: koulutusTyyppiTile(ops.peruste!.koulutustyyppi)}))
      .value();
  }

  get poistetut() {
    return _.filter(this.jarjestetyt, (ops: OpetussuunnitelmaDto) => (ops.tila as string) === 'poistettu');
  }

  protected async init() {
    const res = await Opetussuunnitelmat.getKoulutustoimijaOpetussuunnitelmat(this.koulutustoimijaId);
    this.opslista = res.data;
  }
}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_mixins.scss';

$box-radius: 10px;
$box-height: 230px;
$box-width: 192px;
$new-tile-top-bg-color:#1E49CF;
$new-tile-bottom-bg-color:#0f3284;
$vst-tile-top-bg-color:#9B4E27;
$vst-tile-bottom-bg-color:#993300;

.ops {
  margin-bottom: 40px;

  &__info {
    padding: 10px 0;
  }
}

.opsbox {
  user-select: none;
  margin: 10px;
  border-radius: $box-radius;
  @include tile-background-shadow;

  &:hover {
    @include tile-background-shadow-selected;
  }

  &--published {
    height: $box-height;
    width: $box-width;
    background-repeat: no-repeat;
    background-size: contain;
    text-align: center;
  }

  &__new {
    background-size: contain;
    background: linear-gradient(180deg, $new-tile-top-bg-color 0%, $new-tile-bottom-bg-color 100%);
    border-radius: $box-radius;
    height: $box-height;
    margin: 0 auto;
    padding-top: 48px;
    text-align: center;
    width: $box-width;
  }

  &__plus-icon {
    color: #FFF;
    font-size: 50px;
    margin: 0 auto;
    text-align: center;
    width: 80px;
  }

  &__text {
    color: #FFF;
    font-weight: 600;
    margin: 0 auto;
    text-align: center;
    width: 80px;
  }

  &__chart {
    height: 138px;
    padding-top: 28px;
    background: linear-gradient(180deg, $vst-tile-top-bg-color 0%, $vst-tile-bottom-bg-color 100%);
  }

  &__progress-clamper {
    width: 80px;
    text-align: center;
    margin: 0 auto;
  }

  &__chart {
    width: $box-width;
    border-radius: $box-radius $box-radius 0 0;
    background-size: contain;
    margin: 0 auto;
    text-align: center;
  }

  &__info {
    border-radius: 0 0 $box-radius $box-radius;
    text-align: center;
    height: 92px;
    width: $box-width;
    padding: 10px 10px;
    margin: 0 auto;
    border: 1px solid #E7E7E7;
    border-top-width: 0;
    overflow-y: auto;

    &--published {
      height: 150px;
      margin-top: 80px;
    }
  }

  &__name {
    color: #2B2B2B;
    text-align: center;
    hyphens: none;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>

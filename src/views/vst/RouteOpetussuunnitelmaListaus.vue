<template>
  <EpMainView>
    <template slot="header">
      <h1>{{ $t('opetussuunnitelmat') }}</h1>
      <p>{{ $t('opetussuunnitelmat-kuvaus') }}</p>
      <div class="d-flex">
        <b-form-group :label="$t('nimi')">
          <EpSearch v-model="rajain" :placeholder="$t('etsi-opetussuunnitelmia')"/>
        </b-form-group>
      </div>
    </template>
    <b-container fluid class="pl-0">
      <b-row>
        <b-col>
          <div class="ops">
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
        </b-col>
      </b-row>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import _ from 'lodash';

import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import EpMainView from '@/components/EpMainView/EpMainView.vue';

import EpSearch from '@shared/components/forms/EpSearch.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';

import { yleissivistavatKoulutustyypit } from '@shared/utils/perusteet';
import { tileBackgroundColor } from '@shared/utils/bannerIcons';
import { Opetussuunnitelmat, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';

@Component({
  directives: {
    oikeustarkastelu,
  },
  components: {
    EpMainView,
    EpSearch,
    KoulutustyyppiSelect,
    EpProgress,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;
  private rajain = '';
  private opslista: OpetussuunnitelmaDto[] = [];

  mounted() {
    this.init();
  }

  get hasRajain() {
    return !_.isEmpty(this.rajain);
  }

  get yleissivistavatKoulutustyypit() {
    return yleissivistavatKoulutustyypit;
  }

  get jarjestetyt() {
    return _(this.opslista)
      .map(ops => ({ ...ops, tileStyle: tileBackgroundColor(ops.peruste!.koulutustyyppi!)}))
      .sortBy('luotu')
      .reverse()
      .value();
  }

  get arkistoimattomat() {
    return _.reject(this.jarjestetyt, ops => (ops.tila as string) === 'poistettu');
  }

  get keskeneraiset() {
    return _.chain(this.arkistoimattomat)
      .reject(ops => (ops.tila as string) === 'julkaistu')
      .value();
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
$box-width: 192px;
$new-tile-top-bg-color:#1E49CF;
$new-tile-bottom-bg-color:#0f3284;
$vst-tile-top-bg-color:#9B4E27;
$vst-tile-bottom-bg-color:#993300;

.ops {
  &__info {
    padding: 10px 0;
  }
}

.opsbox {
  user-select: none;
  margin: 10px;
  border-radius: $box-radius;
  @include tile-background-shadow;

  &__new {
    background-size: contain;
    background: linear-gradient(180deg, $new-tile-top-bg-color 0%, $new-tile-bottom-bg-color 100%);
    border-radius: $box-radius;
    height: 230px;
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

  &__published, &__chart {
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

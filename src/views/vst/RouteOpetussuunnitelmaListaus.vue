<template>
  <EpMainView :container="true">
    <template slot="header">
      <h1 class="mb-3">{{ $t(kaannokset['otsikko']) }}</h1>
      <div class="d-md-flex justify-content-between">
        <p class="mt-2">{{ $t(kaannokset['kuvaus']) }}</p>
        <EpArkistoidutOps
          v-if="poistetut && poistetut.length > 0"
          :opetussuunnitelmat="poistetut"
          @restore="onRestoreOps"
          :title="kaannokset['arkistoidut']"/>
      </div>
      <div class="d-flex">
        <b-form-group :label="$t('nimi')" class="col-6 col-lg-4">
          <EpSearch maxWidth v-model="query.nimi" :placeholder="$t('etsi')"/>
        </b-form-group>
        <b-form-group :label="$t('koulutustoimija')" class="col-6 col-lg-4" v-if="$isAdmin()">
          <EpMultiSelect
            class="multiselect"
            v-model="valitutKoulutustoimijat"
            :enable-empty-option="true"
            :placeholder="$t('kaikki')"
            :is-editing="true"
            :options="koulutustoimijat"
            :multiple="true"
            track-by="id"
            :search-identity="koulutustoimijaSearchIdentity">
            <template slot="option" slot-scope="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>

            <template slot="selection" slot-scope="{ values }">
              <span v-if="values.length > 1">{{$t('valittu')}} {{values.length}} {{$t('koulutustoimijaa')}}</span>
              <span v-if="values.length === 1">{{$kaanna(values[0].nimi)}}</span>
            </template>
          </EpMultiSelect>
        </b-form-group>
        <b-form-group class="ml-4 mt-3" v-if="toteutus === 'vapaasivistystyo'">
          <label>&nbsp;</label>
          <EpToggle v-model="query.jotpa" checkbox>{{$t('nayta-vain-jotpa-rahoitteiset')}}</EpToggle>
        </b-form-group>
      </div>
    </template>
    <b-container fluid class="mt-2 pl-0" slot="custom-content">
      <b-row>
        <b-col>
          <div class="ops">
            <div class="d-flex">
              <h2>{{ $t(kaannokset['keskeneraiset']) }}</h2>
              <EpSpinner v-if="!opetussuunnitelmat || isUpdatingOpsSivu" />
            </div>
            <div class="d-flex flex-wrap">
              <div
                class="opsbox"
                v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'opetussuunnitelma' }">
                <RouterLink tag="a" :to="{ name: kaannokset['uusiRoute'] }">
                  <div class="opsbox__new">
                    <div class="opsbox__plus-icon">
                      <EpMaterialIcon size="60px">add</EpMaterialIcon>
                    </div>
                    <div class="opsbox__text">
                      {{ $t('luo-uusi') }}
                    </div>
                  </div>
                </RouterLink>
              </div>
              <OpsKeskeneraisetTile :ops="ops" :toteutus="toteutus" v-for="ops in opetussuunnitelmat" :key="ops.id"/>
              <div class="ops__info mt-4 ml-4" v-if="opetussuunnitelmat && opetussuunnitelmat.length === 0">
                <EpAlert :ops="true" :text="$t('ei-hakutuloksia')" class="mt-4" />
              </div>
            </div>

            <b-pagination
              class="mt-3"
              v-model="opsSivu"
              :total-rows="opetussuunnitelmatKokonaismaara"
              :per-page="9"
              align="center" />
          </div>

          <div class="ops mt-4">
            <div class="d-flex">
              <h2>{{ $t(kaannokset['julkaistut']) }}</h2>
              <EpSpinner v-if="!julkaistut || isUpdatingJulkaistutSivu" />
            </div>
            <div class="info" v-if="julkaistut && julkaistut.length === 0">
              <EpAlert :ops="true" :text="$t(kaannokset['eiJulkaistuja'])" class="mt-4" />
            </div>

            <div class="d-flex flex-wrap">
              <OpsJulkaistutTile :ops="ops" v-for="ops in julkaistut" :key="'julkaistu-' + ops.id"/>
            </div>
            <b-pagination
                class="mt-3"
                v-model="julkaisutSivu"
                :total-rows="julkaistutKokonaismaara"
                :per-page="10"
                align="center" />
          </div>

          <div class="ops" v-if="ystavienKeskeneraiset.length > 0">
            <h2 class="mt-4">{{ $t(kaannokset['ystavien'] + '-keskeneraiset') }}</h2>

            <div class="d-flex flex-wrap">
             <OpsKeskeneraisetTile :ops="ops" :toteutus="toteutus" v-for="ops in ystavienKeskeneraiset" :key="'ystava-keskenerainen-' + ops.id"/>
            </div>
          </div>

          <div class="ops" v-if="ystavienJulkaistut.length > 0">
            <h2 class="mt-4">{{ $t(kaannokset['ystavien'] + '-julkaistut') }}</h2>

            <div class="d-flex flex-wrap">
             <OpsJulkaistutTile :ops="ops" v-for="ops in ystavienJulkaistut" :key="'ystava-julkaistu-' + ops.id"/>
            </div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import EpArkistoidutOps from '@/components/EpArkistoidutOps/EpArkistoidutOps.vue';
import { ArkistointiTekstit, OpetussuunnitelmalistausKielistykset, ToteutuksenKoulutustyypit } from '@/utils/toteutustypes';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { koulutusTyyppiTile } from '@shared/utils/bannerIcons';
import { OpetussuunnitelmaDtoTilaEnum } from '@shared/api/amosaa';
import OpsKeskeneraisetTile from './OpsKeskeneraisetTile.vue';
import OpsJulkaistutTile from './OpsJulkaistutTile.vue';
import { Toteutus } from '@shared/utils/perusteet';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import { OpetussuunnitelmatStore } from '@/stores/OpetussuunnitelmatStore';
import { Debounced } from '@shared/utils/delay';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { Kielet } from '@shared/stores/kieli';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpMainView,
    EpArkistoidutOps,
    EpSearch,
    KoulutustyyppiSelect,
    EpProgress,
    EpAlert,
    EpSpinner,
    OpsKeskeneraisetTile,
    OpsJulkaistutTile,
    EpToggle,
    EpMultiSelect,
    EpMaterialIcon,
  },
})
export default class RouteOpetussuunnitelmaListaus extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private opetussuunnitelmatStore!: OpetussuunnitelmatStore;

  @Prop({ required: true })
  private opsTyyppi!: 'ops' | 'opspohja';

  private sivut = {
    keskeneraisetSivu: 0,
    julkaistutSivu: 0,
  };

  private query: any = {
    koulutustoimijat: [],
    koulutustyyppi: this.koulutustyypit,
    tyyppi: this.opsTyyppi,
    nimi: '',
    jotpa: false,
    kieli: Kielet.getSisaltoKieli.value,
  };

  private isUpdatingOpsSivu = false;
  private isUpdatingJulkaistutSivu = false;

  async mounted() {
    await this.init();
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  @Watch('koulutustoimijaId')
  async koulutustoimijaChange() {
    await this.init();
  }

  @Watch('kieli')
  async kieliChange() {
    this.query = {
      ...this.query,
      kieli: this.kieli,
    };
  }

  protected async init() {
    this.opetussuunnitelmatStore.init(this.koulutustoimijaId, this.query, this.$isAdmin());
  }

  @Debounced(300)
  @Watch('query', { deep: true })
  async queryUpdate() {
    await this.init();
  }

  @Watch('opsSivu')
  async opsSivuUpdate() {
    this.isUpdatingOpsSivu = true;
    await this.initKeskeneraiset();
    this.isUpdatingOpsSivu = false;
  }

  @Watch('julkaisutSivu')
  async julkaisutSivuUpdate() {
    this.isUpdatingJulkaistutSivu = true;
    await this.initJulkaistut();
    this.isUpdatingJulkaistutSivu = true;
  }

  get koulutustoimijat() {
    return _.sortBy(this.kayttajaStore.koulutustoimijat.value, kt => this.$kaanna(kt.nimi!));
  }

  get valitutKoulutustoimijat() {
    return _.filter(this.koulutustoimijat, (kt: any) => _.includes(this.query.koulutustoimijat, kt.id));
  }

  set valitutKoulutustoimijat(value: any[]) {
    if (_.size(value) === 0) {
      this.query.koulutustoimijat = [];
    }
    else {
      this.query.koulutustoimijat = _.map(value, 'id');
    }
  }

  get opsSivu() {
    return this.sivut.keskeneraisetSivu + 1;
  }

  set opsSivu(sivu) {
    this.sivut.keskeneraisetSivu = sivu - 1;
  }

  get julkaisutSivu() {
    return this.sivut.julkaistutSivu + 1;
  }

  set julkaisutSivu(sivu) {
    this.sivut.julkaistutSivu = sivu - 1;
  }

  async onRestoreOps({ id }: { id: number }) {
    await vaihdaOpetussunnitelmaTilaConfirm(
      this,
      {
        ...ArkistointiTekstit.palautus[this.toteutus].meta,
        toteutussuunnitelmaId: id,
        callback: async () => {
          await this.initKeskeneraiset();
          await this.initJulkaistut();
          await this.opetussuunnitelmatStore.fetchPoistetut(this.koulutustoimijaId, this.query);
        },
      },
    );
  }

  opsBannerImage(ops) {
    return { ...ops, bannerImage: koulutusTyyppiTile(ops.peruste ? ops.peruste!.koulutustyyppi : ops.koulutustyyppi) };
  }

  get poistetut() {
    return this.opetussuunnitelmatStore.arkistoidutOpetussuunnitelmat.value;
  }

  get koulutustyypit() {
    return ToteutuksenKoulutustyypit[this.toteutus] as string[];
  }

  async initKeskeneraiset() {
    await this.opetussuunnitelmatStore.fetchKeskeneraiset(this.koulutustoimijaId, { ...this.query, sivu: this.sivut.keskeneraisetSivu });
  }

  async initJulkaistut() {
    await this.opetussuunnitelmatStore.fetchJulkaistut(this.koulutustoimijaId, { ...this.query, sivu: this.sivut.julkaistutSivu });
  }

  get opetussuunnitelmat() {
    return this.opetussuunnitelmatStore.opetussuunnitelmat.value?.data;
  }

  get julkaistut() {
    if (this.opetussuunnitelmatStore.julkaistutOpetussuunnitelmat.value) {
      return _.map(this.opetussuunnitelmatStore.julkaistutOpetussuunnitelmat.value?.data, ops => this.opsBannerImage(ops));
    }
  }

  get opetussuunnitelmatKokonaismaara() {
    return this.opetussuunnitelmatStore.opetussuunnitelmat.value?.kokonaismäärä;
  }

  get julkaistutKokonaismaara() {
    return this.opetussuunnitelmatStore.julkaistutOpetussuunnitelmat.value?.kokonaismäärä;
  }

  get ystavien() {
    return this.opetussuunnitelmatStore.ystavienOpetussuunnitelmat.value;
  }

  get ystavienKeskeneraiset() {
    return _.filter(this.ystavien, ystava => ystava.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.LUONNOS) || ystava.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.VALMIS));
  }

  get ystavienJulkaistut() {
    return _.chain(this.ystavien)
      .filter(ystavaOps => ystavaOps.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.JULKAISTU))
      .map(ystavaOps => this.opsBannerImage(ystavaOps))
      .value();
  }

  get kaannokset() {
    return OpetussuunnitelmalistausKielistykset[this.toteutus][this.opsTyyppi];
  }

  koulutustoimijaSearchIdentity(obj: any) {
    return _.toLower(this.$kaanna(obj.nimi));
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
      height: 100%;
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

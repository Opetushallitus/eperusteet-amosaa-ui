<template>
  <EpMainView>
    <template slot="header">
      <h1 class="mb-3">{{ $t(kaannokset['otsikko']) }}</h1>
      <div class="d-md-flex justify-content-between">
        <p class="mt-2">{{ $t(kaannokset['kuvaus']) }}</p>
        <EpArkistoidutOps
          v-if="poistetut.length > 0"
          :opetussuunnitelmat="poistetut"
          @restore="onRestoreOps"
          :title="kaannokset['arkistoidut']"/>
      </div>
      <div class="d-flex">
        <b-form-group :label="$t('nimi')" class="col-6 col-lg-4">
          <EpSearch maxWidth v-model="rajain" :placeholder="$t('etsi')"/>
        </b-form-group>
        <b-form-group v-if="showOrganisaatioFilter" :label="$t('organisaatio')" class="col-6 col-lg-4">
          <EpMultiSelect
            v-model="koulutustoimijaRajaus"
            :options="koulutustoimijat"
            :multiple="true"
            :searchable="true"
            :close-on-select="false"
            :clear-on-select="false"
            :search-identity="nimiSearchIdentity"
            track-by="id"
            :placeholder="$t('valitse-organisaatio')"
            :customLabel="({nimi}) => $kaanna(nimi)">
            <template v-slot:option="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>
          </EpMultiSelect>
        </b-form-group>
        <b-form-group class="ml-4 mt-3" v-if="toteutus === 'vapaasivistystyo'">
          <label>&nbsp;</label>
          <EpToggle v-model="jotpa" checkbox>{{$t('nayta-vain-jotpa-rahoitteiset')}}</EpToggle>
        </b-form-group>
      </div>
    </template>
    <b-container fluid class="pl-0">
      <b-row>
        <b-col>
          <div class="ops">
            <EpSpinner v-if="!opslista" />
            <h2>{{ $t(kaannokset['keskeneraiset']) }}</h2>
            <div class="ops__info" v-if="keskeneraiset.length === 0 && hasRajain">
              {{ $t('ei-hakutuloksia') }}
            </div>
            <div class="d-flex flex-wrap">
              <div
                v-if="!hasRajain"
                class="opsbox"
                v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'opetussuunnitelma' }">
                <RouterLink tag="a" :to="{ name: kaannokset['uusiRoute'] }">
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
                <OpsKeskeneraisetTile :ops="ops" :toteutus="toteutus" v-for="ops in keskeneraiset" :key="ops.id"/>
            </div>
          </div>

          <div class="ops">
            <h2 class="mt-4">{{ $t(kaannokset['julkaistut']) }}</h2>
            <div class="info" v-if="julkaistut.length === 0">
              <div v-if="hasRajain">
                {{ $t('ei-hakutuloksia') }}
              </div>
              <EpAlert v-else :ops="true" :text="$t(kaannokset['eiJulkaistuja'])" class="mt-4" />
            </div>
            <div class="d-flex flex-wrap">
              <OpsJulkaistutTile :ops="ops" v-for="ops in julkaistut" :key="'julkaistu-' + ops.id"/>
            </div>
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
import { ArkistointiTekstit, OpetussuunnitelmalistausKielistykset, ToteutuksenKoulutustyypit } from '@/utils/toteutustypes';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import EpArkistoidutOps from '@/components/EpArkistoidutOps/EpArkistoidutOps.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { koulutusTyyppiTile } from '@shared/utils/bannerIcons';
import { Opetussuunnitelmat, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTilaEnum, JulkinenApi } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import OpsKeskeneraisetTile from './OpsKeskeneraisetTile.vue';
import OpsJulkaistutTile from './OpsJulkaistutTile.vue';
import { Toteutus } from '@shared/utils/perusteet';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { KoulutustoimijaBaseDto } from '@shared/generated/amosaa';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';

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
  },
})
export default class RouteOpetussuunnitelmaListaus extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Prop({ required: true })
  private opsTyyppi!: 'ops' | 'opspohja';

  private rajain = '';
  private jotpa: boolean = false;
  private opslista: OpetussuunnitelmaDto[] | null = null;
  private ystavien: OpetussuunnitelmaDto[] | null = [];
  private koulutustoimijat: KoulutustoimijaBaseDto[] | null = [];
  private koulutustoimijaRajaus: KoulutustoimijaBaseDto[] | null = [];

  mounted() {
    this.init();
  }

  @Watch('koulutustoimijaId')
  koulutustoimijaChange() {
    this.init();
  }

  protected async init() {
    this.opslista = null;
    if (this.opsTyyppi === 'ops') {
      this.opslista = (await Opetussuunnitelmat.getKoulutustoimijaOpetussuunnitelmat(this.koulutustoimijaId, this.koulutustyypit, 'OPS')).data;
      this.ystavien = (await Opetussuunnitelmat.getAllOtherOrgsOpetussuunnitelmat(this.koulutustoimijaId, this.koulutustyypit)).data;
      if (this.hasOphHallintaOikeus) {
        this.koulutustoimijat = (await JulkinenApi.findKoulutusTyypinJaOpsTyypinKoulutustoimijat(this.koulutustyypit, 'OPS')).data;
      }
    }

    if (this.opsTyyppi === 'opspohja') {
      this.opslista = (await Opetussuunnitelmat.getKoulutustoimijaOpetussuunnitelmat(this.koulutustoimijaId, this.koulutustyypit, 'OPSPOHJA')).data;
    }
  }

  async onRestoreOps({ id }: { id: number }) {
    await vaihdaOpetussunnitelmaTilaConfirm(
      this,
      {
        ...ArkistointiTekstit.palautus[this.toteutus].meta,
        toteutussuunnitelmaId: id,
        callback: async () => this.init(),
      },
    );
  }

  get hasRajain() {
    return !_.isEmpty(this.rajain) || this.jotpa;
  }

  get jarjestetyt() {
    return _(this.opslista)
      .filter((ops: OpetussuunnitelmaDto) => _.includes(
        _.toLower(_.get(ops, 'nimi.' + Kielet.getSisaltoKieli.value)),
        _.toLower(this.rajain)
      ))
      .filter(ops => !this.jotpa || !!ops.jotpatyyppi)
      .sortBy('luotu')
      .reverse()
      .value();
  }

  get arkistoimattomat() {
    return _.reject(this.jarjestetyt, (ops: OpetussuunnitelmaDto) => (ops.tila as string) === 'poistettu');
  }

  get keskeneraiset() {
    return _.chain(this.arkistoimattomat)
      .filter((ops: OpetussuunnitelmaDto) => this.shouldIncludeAfterKoulutustoimijaCheck(ops.koulutustoimija))
      .reject((ops: OpetussuunnitelmaDto) => (ops.tila as string) === this.kaannokset['julkaisuTila'])
      .value();
  }

  get julkaistut() {
    return _.chain(this.arkistoimattomat)
      .filter((ops: OpetussuunnitelmaDto) => (ops.tila as string) === this.kaannokset['julkaisuTila'] && this.shouldIncludeAfterKoulutustoimijaCheck(ops.koulutustoimija))
      .map((ops: OpetussuunnitelmaDto) => this.opsBannerImage(ops))
      .value();
  }

  get poistetut() {
    return _.filter(this.jarjestetyt, (ops: OpetussuunnitelmaDto) => (ops.tila as string) === 'poistettu' && this.shouldIncludeAfterKoulutustoimijaCheck(ops.koulutustoimija));
  }

  get koulutustyypit() {
    return ToteutuksenKoulutustyypit[this.toteutus];
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

  get hasOphHallintaOikeus() {
    return this.$hasOikeus('hallinta', 'oph');
  }

  get showOrganisaatioFilter() {
    return this.hasOphHallintaOikeus && this.opsTyyppi === 'ops';
  }

  private shouldIncludeAfterKoulutustoimijaCheck(koulutustoimija) {
    return (this.hasOphHallintaOikeus && !_.isEmpty(this.koulutustoimijaRajaus)) ? _.includes(_.map(this.koulutustoimijaRajaus, 'id'), koulutustoimija.id) : true;
  }

  opsBannerImage(ops) {
    return { ...ops, bannerImage: koulutusTyyppiTile(ops.peruste ? ops.peruste!.koulutustyyppi : ops.koulutustyyppi) };
  }

  nimiSearchIdentity(obj: any) {
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

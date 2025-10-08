<template>
  <EpMainView :container="true">
    <template #header>
      <h1 class="mb-3">
        {{ $t(kaannoksetValue['otsikko']) }}
      </h1>
      <div class="d-md-flex justify-content-between">
        <p class="mt-2">
          {{ $t(kaannoksetValue['kuvaus']) }}
        </p>
        <EpArkistoidutOps
          v-if="poistetut && poistetut.length > 0"
          :opetussuunnitelmat="poistetut"
          :title="kaannoksetValue['arkistoidut']"
          @restore="onRestoreOps"
        />
      </div>
      <div class="d-flex">
        <b-form-group
          :label="$t('nimi')"
          class="col-6 col-lg-4"
        >
          <EpSearch
            v-model="query.nimi"
            max-width
            :placeholder="$t('etsi')"
          />
        </b-form-group>
        <b-form-group
          v-if="$isAdmin()"
          :label="$t('koulutustoimija')"
          class="col-6 col-lg-4"
        >
          <EpMultiSelect
            v-model="valitutKoulutustoimijat"
            class="multiselect"
            :enable-empty-option="true"
            :placeholder="$t('kaikki')"
            :is-editing="true"
            :options="koulutustoimijat"
            :multiple="true"
            track-by="id"
            :search-identity="koulutustoimijaSearchIdentity"
          >
            <template #option="{ option }">
              {{ $kaanna(option.nimi) }}
            </template>

            <template #selection="{ values }">
              <span v-if="values.length > 1">{{ $t('valittu') }} {{ values.length }} {{ $t('koulutustoimijaa') }}</span>
              <span v-if="values.length === 1">{{ $kaanna(values[0].nimi) }}</span>
            </template>
          </EpMultiSelect>
        </b-form-group>
        <b-form-group
          v-if="toteutus === 'vapaasivistystyo'"
          class="ml-4 mt-3"
        >
          <label>&nbsp;</label>
          <EpToggle
            v-model="query.jotpa"
            checkbox
          >
            {{ $t('nayta-vain-jotpa-rahoitteiset') }}
          </EpToggle>
        </b-form-group>
      </div>
    </template>
    <template #custom-content>
      <b-container
        fluid
        class="mt-2 pl-0"
      >
        <b-row>
          <b-col>
            <div class="ops">
              <div class="d-flex">
                <h2>{{ $t(kaannoksetValue['keskeneraiset']) }}</h2>
                <EpSpinner v-if="!opetussuunnitelmat || isUpdatingOpsSivu" />
              </div>
              <div class="d-flex flex-wrap">
                <div
                  v-oikeustarkastelu="{ oikeus: 'luonti', kohde: 'opetussuunnitelma' }"
                  class="opsbox"
                >
                  <RouterLink
                    :to="{ name: kaannoksetValue['uusiRoute'] }"
                  >
                    <div class="opsbox__new">
                      <div class="opsbox__plus-icon">
                        <EpMaterialIcon size="60px">
                          add
                        </EpMaterialIcon>
                      </div>
                      <div class="opsbox__text">
                        {{ $t('luo-uusi') }}
                      </div>
                    </div>
                  </RouterLink>
                </div>
                <OpsKeskeneraisetTile
                  v-for="ops in opetussuunnitelmat"
                  :key="ops.id"
                  :ops="ops"
                  :toteutus="toteutus"
                />
                <div
                  v-if="(query.nimi || query.jotpa) && opetussuunnitelmat && opetussuunnitelmat.length === 0"
                  class="ops__info mt-4 ml-4"
                >
                  <EpAlert
                    :ops="true"
                    :text="$t('ei-hakutuloksia')"
                    class="mt-4"
                  />
                </div>
              </div>

              <ep-pagination
                v-model="opsSivu"
                class="mt-3"
                :total-rows="opetussuunnitelmatKokonaismaara"
                :per-page="9"
                align="center"
              />
            </div>

            <div class="ops mt-4">
              <div class="d-flex">
                <h2>{{ $t(kaannoksetValue['julkaistut']) }}</h2>
                <EpSpinner v-if="!julkaistut || isUpdatingJulkaistutSivu" />
              </div>
              <div
                v-if="julkaistut && julkaistut.length === 0"
                class="info"
              >
                <EpAlert
                  :ops="true"
                  :text="$t(kaannoksetValue['eiJulkaistuja'])"
                  class="mt-4"
                />
              </div>

              <div class="d-flex flex-wrap">
                <OpsJulkaistutTile
                  v-for="ops in julkaistut"
                  :key="'julkaistu-' + ops.id"
                  :ops="ops"
                />
              </div>
              <ep-pagination
                v-model="julkaisutSivu"
                class="mt-3"
                :total-rows="julkaistutKokonaismaara"
                :per-page="10"
                align="center"
              />
            </div>

            <div
              v-if="ystavienKeskeneraiset.length > 0"
              class="ops"
            >
              <h2 class="mt-4">
                {{ $t(kaannoksetValue['ystavien'] + '-keskeneraiset') }}
              </h2>

              <div class="d-flex flex-wrap">
                <OpsKeskeneraisetTile
                  v-for="ops in ystavienKeskeneraiset"
                  :key="'ystava-keskenerainen-' + ops.id"
                  :ops="ops"
                  :toteutus="toteutus"
                />
              </div>
            </div>

            <div
              v-if="ystavienJulkaistut.length > 0"
              class="ops"
            >
              <h2 class="mt-4">
                {{ $t(kaannoksetValue['ystavien'] + '-julkaistut') }}
              </h2>

              <div class="d-flex flex-wrap">
                <OpsJulkaistutTile
                  v-for="ops in ystavienJulkaistut"
                  :key="'ystava-julkaistu-' + ops.id"
                  :ops="ops"
                />
              </div>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </template>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import _ from 'lodash';

import EpArkistoidutOps from '@/components/EpArkistoidutOps/EpArkistoidutOps.vue';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import KoulutustyyppiSelect from '@shared/components/forms/EpKoulutustyyppiSelect.vue';
import EpProgress from '@shared/components/EpProgressPopover/EpProgress.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import OpsKeskeneraisetTile from './OpsKeskeneraisetTile.vue';
import OpsJulkaistutTile from './OpsJulkaistutTile.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

import { ArkistointiTekstit, OpetussuunnitelmalistausKielistykset, ToteutuksenKoulutustyypit } from '@/utils/toteutustypes';
import { vaihdaOpetussunnitelmaTilaConfirm } from '@/utils/arkistointi';
import { koulutusTyyppiTile } from '@shared/utils/bannerIcons';
import { OpetussuunnitelmaDtoTilaEnum } from '@shared/api/amosaa';
import { Toteutus } from '@shared/utils/perusteet';
import { KayttajaStore } from '@/stores/kayttaja';
import { OpetussuunnitelmatStore } from '@/stores/OpetussuunnitelmatStore';
import { Kielet } from '@shared/stores/kieli';
import { $t, $kaanna, $isAdmin } from '@shared/utils/globals';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  koulutustoimijaId: string;
  toteutus: Toteutus;
  kayttajaStore: KayttajaStore;
  opetussuunnitelmatStore: OpetussuunnitelmatStore;
  opsTyyppi: 'ops' | 'opspohja';
}>();

const sivut = reactive({
  keskeneraisetSivu: 0,
  julkaistutSivu: 0,
});

const koulutustyypit = computed(() => {
  return ToteutuksenKoulutustyypit[props.toteutus] as string[];
});

const query = reactive<any>({
  koulutustoimijat: [],
  koulutustyyppi: koulutustyypit.value,
  tyyppi: props.opsTyyppi,
  nimi: '',
  jotpa: false,
  kieli: Kielet.getSisaltoKieli.value,
});

const isUpdatingOpsSivu = ref(false);
const isUpdatingJulkaistutSivu = ref(false);

const route = useRoute();
const router = useRouter();

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const koulutustoimijat = computed(() => {
  return _.sortBy(props.kayttajaStore.koulutustoimijat.value, kt => $kaanna(kt.nimi!));
});

const valitutKoulutustoimijat = computed({
  get() {
    return _.filter(koulutustoimijat.value, (kt: any) => _.includes(query.koulutustoimijat, kt.id));
  },
  set(value: any[]) {
    if (_.size(value) === 0) {
      query.koulutustoimijat = [];
    }
    else {
      query.koulutustoimijat = _.map(value, 'id');
    }
  },
});

const opsSivu = computed({
  get() {
    return sivut.keskeneraisetSivu + 1;
  },
  set(sivu: number) {
    sivut.keskeneraisetSivu = sivu - 1;
  },
});

const julkaisutSivu = computed({
  get() {
    return sivut.julkaistutSivu + 1;
  },
  set(sivu: number) {
    sivut.julkaistutSivu = sivu - 1;
  },
});

const poistetut = computed(() => {
  return props.opetussuunnitelmatStore.arkistoidutOpetussuunnitelmat.value;
});

const opetussuunnitelmat = computed(() => {
  return props.opetussuunnitelmatStore.opetussuunnitelmat.value?.data;
});

const opsBannerImage = (ops: any) => {
  return { ...ops, bannerImage: koulutusTyyppiTile(ops.peruste ? ops.peruste!.koulutustyyppi : ops.koulutustyyppi) };
};

const julkaistut = computed(() => {
  if (props.opetussuunnitelmatStore.julkaistutOpetussuunnitelmat.value) {
    return _.map(props.opetussuunnitelmatStore.julkaistutOpetussuunnitelmat.value?.data, ops => opsBannerImage(ops));
  }
  return undefined;
});

const opetussuunnitelmatKokonaismaara = computed(() => {
  return props.opetussuunnitelmatStore.opetussuunnitelmat.value?.kokonaismäärä;
});

const julkaistutKokonaismaara = computed(() => {
  return props.opetussuunnitelmatStore.julkaistutOpetussuunnitelmat.value?.kokonaismäärä;
});

const ystavien = computed(() => {
  return props.opetussuunnitelmatStore.ystavienOpetussuunnitelmat.value;
});

const ystavienKeskeneraiset = computed(() => {
  return _.filter(ystavien.value, ystava => ystava.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.LUONNOS) || ystava.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.VALMIS));
});

const ystavienJulkaistut = computed(() => {
  return _.chain(ystavien.value)
    .filter(ystavaOps => ystavaOps.tila === _.toLower(OpetussuunnitelmaDtoTilaEnum.JULKAISTU))
    .map(ystavaOps => opsBannerImage(ystavaOps))
    .value();
});

const kaannoksetValue = computed(() => {
  return OpetussuunnitelmalistausKielistykset[props.toteutus][props.opsTyyppi];
});

const init = async () => {
  props.opetussuunnitelmatStore.init(props.koulutustoimijaId, query, $isAdmin());
};

const initKeskeneraiset = async () => {
  await props.opetussuunnitelmatStore.fetchKeskeneraiset(props.koulutustoimijaId, { ...query, sivu: sivut.keskeneraisetSivu });
};

const initJulkaistut = async () => {
  await props.opetussuunnitelmatStore.fetchJulkaistut(props.koulutustoimijaId, { ...query, sivu: sivut.julkaistutSivu });
};

const onRestoreOps = async ({ id }: { id: number }) => {
  await vaihdaOpetussunnitelmaTilaConfirm(
    { $t, $kaanna, route, router },
    {
      ...ArkistointiTekstit.palautus[props.toteutus].meta,
      toteutussuunnitelmaId: id,
      callback: async () => {
        await initKeskeneraiset();
        await initJulkaistut();
        await props.opetussuunnitelmatStore.fetchPoistetut(props.koulutustoimijaId, query);
      },
    },
  );
};

const koulutustoimijaSearchIdentity = (obj: any) => {
  return _.toLower($kaanna(obj.nimi));
};

onMounted(async () => {
  await init();
});

watch(() => props.koulutustoimijaId, async () => {
  await init();
});

watch(kieli, async () => {
  query.kieli = kieli.value;
});


const debouncedQueryUpdate = _.debounce(async () => {
  await init();
}, 300);

watch(query, debouncedQueryUpdate, { deep: true });

watch(opsSivu, async () => {
  isUpdatingOpsSivu.value = true;
  await initKeskeneraiset();
  isUpdatingOpsSivu.value = false;
});

watch(julkaisutSivu, async () => {
  isUpdatingJulkaistutSivu.value = true;
  await initJulkaistut();
  isUpdatingJulkaistutSivu.value = false;
});
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

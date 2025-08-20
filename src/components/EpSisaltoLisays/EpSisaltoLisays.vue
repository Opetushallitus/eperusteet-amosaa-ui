<template>
  <b-dropdown
    variant="link"
    toggle-class="text-decoration-none"
    no-caret
  >
    <template #button-content>
      + {{ $t('lisaa-sisaltoa') }}
    </template>

    <b-dropdown-item>
      <ep-tekstikappale-lisays
        :tekstikappaleet="tekstikappaleet"
        :paatasovalinta="true"
        :tallenna="lisaaUusiTekstikappale"
      >
        <template #default="{tekstikappale}">
          {{ $kaanna(tekstikappale.label) }}
        </template>
      </ep-tekstikappale-lisays>
    </b-dropdown-item>

    <div v-if="!opsYhteinenOsuus">
      <b-dropdown-item>
        <span @click="lisaaUusiTutkinnonosa">{{ $t('uusi-tutkinnon-osa') }}</span>
      </b-dropdown-item>

      <hr class="mt-1 mb-1">

      <b-dropdown-item>
        <span @click="lisaaUusiSuorituspolku">{{ $t('uusi-suorituspolku') }}</span>
      </b-dropdown-item>

      <b-dropdown-item>
        <span @click="lisaaUusiOsaSuorituspolku">{{ $t('uusi-osasuorituspolku') }}</span>
      </b-dropdown-item>

      <hr class="mt-1 mb-1">

      <b-dropdown-item>
        <ep-sisallon-tuonti
          v-if="toteutussuunnitelma"
          :opetussuunnitelma-id="toteutussuunnitelma.id"
          :koulutustoimija-id="koulutustoimijaId"
          :update-navigation="updateNavigation"
        />
      </b-dropdown-item>
    </div>
  </b-dropdown>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, getCurrentInstance } from 'vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { SisaltoviiteMatalaDto, MatalaTyyppiEnum, SisaltoViiteKevytDtoTyyppiEnum, NavigationNodeDto, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpSisallonTuonti from '@/components/EpSisaltoLisays/EpSisallonTuonti.vue';
import { $t, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  toteutussuunnitelmaId: number;
  koulutustoimijaId: string;
  navigation: NavigationNodeDto;
  updateNavigation: () => Promise<void>;
  toteutussuunnitelma: OpetussuunnitelmaDto;
}>();

const instance = getCurrentInstance();

const navigationChildren = (navigations: NavigationNodeDto[]): NavigationNodeDto[] => {
  return _.flatten(_.map(navigations, navigation => {
    return [
      navigation,
      ...navigationChildren(navigation.children as []),
    ];
  }));
};

const navigationNodes = computed(() => {
  if (props.navigation) {
    return [
      props.navigation,
      ...navigationChildren(props.navigation.children as []),
    ];
  }
  return undefined;
});

const tekstikappaleet = computed(() => {
  return _.filter(navigationNodes.value, navigationNode => navigationNode.type === 'tekstikappale');
});

const rootSisaltoviiteId = computed((): number => {
  return props.navigation.id!;
});

const lisaaUusiTekstikappale = async (otsikko: any, valittuTekstikappale: any) => {
  let parentId = rootSisaltoviiteId.value;
  if (valittuTekstikappale && valittuTekstikappale.id) {
    parentId = valittuTekstikappale.id;
  }

  SisaltoViiteStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.TEKSTIKAPPALE),
      tekstiKappale: {
        nimi: otsikko,
      },
    } as SisaltoviiteMatalaDto);
};

const lisaaUusiTutkinnonosa = async () => {
  let parentId = _.find(navigationNodes.value, navigationNode => navigationNode.type === 'tutkinnonosat')!.id!;

  SisaltoViiteStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.TUTKINNONOSA),
      tekstiKappale: {
        nimi: { [Kielet.getSisaltoKieli.value]: '' },
      },
    } as SisaltoviiteMatalaDto);
};

const lisaaUusiSuorituspolku = async () => {
  let parentId = _.find(navigationNodes.value, navigationNode => navigationNode.type === 'suorituspolut')!.id!;

  SisaltoViiteStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.SUORITUSPOLKU),
      tekstiKappale: {
        nimi: { [Kielet.getSisaltoKieli.value]: '' },
      },
    } as SisaltoviiteMatalaDto);
};

const lisaaUusiOsaSuorituspolku = async () => {
  let parentId = _.find(navigationNodes.value, navigationNode => navigationNode.type === 'suorituspolut')!.id!;

  SisaltoViiteStore.add(
    props.toteutussuunnitelmaId,
    parentId,
    props.koulutustoimijaId,
    {
      tyyppi: _.toLower(MatalaTyyppiEnum.OSASUORITUSPOLKU),
      tekstiKappale: {
        nimi: { [Kielet.getSisaltoKieli.value]: '' },
      },
    } as SisaltoviiteMatalaDto);
};

const opsYhteinenOsuus = computed(() => {
  return props.toteutussuunnitelma?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.YHTEINEN);
});

</script>

<style scoped lang="scss">

  :deep(.dropdown-toggle) {
    font-size: 0.8rem !important;
    padding-bottom: 0px;
  }

  :deep(.dropdown-item) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  :deep(.dropdown-menu) {
    margin-left: 15px;
    font-size: 0.8rem;
  }

</style>

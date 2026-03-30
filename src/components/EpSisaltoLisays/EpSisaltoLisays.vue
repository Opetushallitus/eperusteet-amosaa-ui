<template>
  <EpDropdown
    no-caret
    content-class="ml-[15px] text-sm"
  >
    <template #button-content>
      <span class="text-inherit no-underline text-[0.8rem] pb-0">
        + {{ $t('lisaa-sisaltoa') }}
      </span>
    </template>

    <EpDropdownItem>
      <ep-tekstikappale-lisays
        :tekstikappaleet="tekstikappaleet"
        :paatasovalinta="true"
        :tallenna="lisaaUusiTekstikappale"
      >
        <template #default="{tekstikappale}">
          {{ $kaanna(tekstikappale.label) }}
        </template>
      </ep-tekstikappale-lisays>
    </EpDropdownItem>

    <div v-if="!opsYhteinenOsuus">
      <EpDropdownItem @click="lisaaUusiTutkinnonosa">
        {{ $t('uusi-tutkinnon-osa') }}
      </EpDropdownItem>

      <EpDropdownDivider />

      <EpDropdownItem @click="lisaaUusiSuorituspolku">
        {{ $t('uusi-suorituspolku') }}
      </EpDropdownItem>

      <EpDropdownItem @click="lisaaUusiOsaSuorituspolku">
        {{ $t('uusi-osasuorituspolku') }}
      </EpDropdownItem>

      <EpDropdownDivider />

      <EpDropdownItem>
        <ep-sisallon-tuonti
          v-if="toteutussuunnitelma"
          :opetussuunnitelma-id="toteutussuunnitelma.id"
          :koulutustoimija-id="koulutustoimijaId"
          :update-navigation="updateNavigation"
        />
      </EpDropdownItem>
    </div>
  </EpDropdown>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { EpDropdown, EpDropdownItem, EpDropdownDivider } from '@shared/components/EpDropdown';
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

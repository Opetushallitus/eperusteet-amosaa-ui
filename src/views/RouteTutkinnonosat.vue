<template>
  <div
    id="scroll-anchor"
    class="m-3"
  >
    <h2 class="m-0">
      {{ $t('tutkinnon-osat') }}
    </h2>

    <ep-spinner v-if="!tutkinnonosat || isDeleting" />

    <div v-else>
      <div class="d-flex justify-content-between mb-4">
        <EpSearch
          v-model="queryNimi"
          :placeholder="$t('etsi')"
        />

        <div class="d-flex">
          <EpButton
            variant="link"
            icon="delete"
            class="btn btn-link p-0"
            :disabled="selectedTutkinnonosat.length === 0"
            @click="removeSelected()"
          >
            {{ $t('poista-valitut') }}
          </EpButton>
          <ep-tutkinnonosa-tuonti
            :tutkinnonosat-tuonti-store="tutkinnonosatTuontiStore"
            :toteutussuunnitelma-id="toteutussuunnitelmaId"
            :koulutustoimija-id="koulutustoimijaId"
            :update-navigation="updateNavigation"
          />
        </div>
      </div>

      <b-table
        responsive
        striped
        hover
        no-local-sorting
        no-sort-reset
        :items="tutkinnonosatWithSelected"
        :fields="fields"
        class="vertical-middle"
        @row-clicked="selectRow"
      >
        <template #head(valitse-kaikki)>
          <div
            class="selectable"
            @click="selectAllRows()"
          >
            <EpMaterialIcon
              v-if="valitseKaikki"
              class="checked mr-2"
            >
              check_box
            </EpMaterialIcon>
            <EpMaterialIcon
              v-else
              class="checked mr-2"
            >
              check_box_outline_blank
            </EpMaterialIcon>
          </div>
        </template>
        <template #cell(valitse-kaikki)="{ item }">
          <div class="selectable">
            <EpMaterialIcon
              v-if="item.selected"
              class="checked mr-2"
            >
              check_box
            </EpMaterialIcon>
            <EpMaterialIcon
              v-else
              class="checked mr-2"
            >
              check_box_outline_blank
            </EpMaterialIcon>
          </div>
        </template>
        <template #cell(nimi)="data">
          <router-link :to="{ name: 'tutkinnonosa', params: { sisaltoviiteId: data.item.tutkinnonosaViite.id } }">
            {{ $kaanna(data.item.nimi) }}
            <span
              v-if="data.item.tutkinnonosaViite.tosa.tyyppi === 'oma'"
              class="paikallinen"
            >({{ $t('tutkinnon-osa-paikallinen-merkki') }})</span>
          </router-link>
        </template>
        <template #cell(actions)="data">
          <EpSpinner
            v-if="data.item.poistossa"
            small
          />
          <EpButton
            v-else
            variant="link"
            icon="delete"
            class="btn btn-link p-0"
            @click="remove(data.item.tutkinnonosaViite.id)"
          />
        </template>
      </b-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import _ from 'lodash';

import { TutkinnonOsatStore } from '@/stores/TutkinnonOsatStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpTutkinnonosaTuonti from '@/components/EpSisaltoLisays/EpTutkinnonosaTuonti.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

import { Kielet } from '@shared/stores/kieli';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { TutkinnonosatTuontiStore } from '@/stores/TutkinnonosatTuontiStore';
import { SisaltoviiteLaajaDto, Sisaltoviitteet } from '@shared/api/amosaa';
import { $t, $kaanna, $sdt, $bvModal } from '@shared/utils/globals';

const props = defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  tutkinnonosatTuontiStore: TutkinnonosatTuontiStore;
  toteutussuunnitelmaId: number;
  koulutustoimijaId: string;
}>();

const tutkinnonOsatStore = new TutkinnonOsatStore();

const queryNimi = ref('');
const poistossa = ref<number[]>([]);
const isDeleting = ref(false);
const valitseKaikki = ref(false);
const selectedTutkinnonosat = ref<SisaltoviiteLaajaDto[]>([]);

const opetussuunnitelma = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value;
});

const tutkinnonosat = computed(() => {
  if (tutkinnonOsatStore?.tutkinnonosat.value) {
    return _.chain(tutkinnonOsatStore.tutkinnonosat.value)
      .filter(tutkinnonosa => _.includes(
        _.toLower(_.get(tutkinnonosa, 'tutkinnonosaViite.tekstiKappale.nimi.' + Kielet.getSisaltoKieli.value)),
        _.toLower(queryNimi.value),
      ))
      .map(tutkinnonosa => {
        return {
          ...tutkinnonosa,
          nimi: _.has(tutkinnonosa.tutkinnonosaViite.tekstiKappale.nimi, Kielet.getSisaltoKieli.value) ? tutkinnonosa.tutkinnonosaViite.tekstiKappale.nimi : $t('uusi-tutkinnonosa'),
          poistossa: _.includes(poistossa.value, tutkinnonosa.tutkinnonosaViite.id),
        };
      })
      .value();
  }
  return undefined;
});

const tutkinnonosatWithSelected = computed(() => {
  return _.map(tutkinnonosat.value, tutkinnonosa => {
    return {
      ...tutkinnonosa,
      selected: _.includes(_.map(selectedTutkinnonosat.value, 'tutkinnonosaViite.id'), _.get(tutkinnonosa, 'tutkinnonosaViite.id')),
    };
  });
});

const fields = computed(() => {
  return [{
    key: 'valitse-kaikki',
    sortable: false,
    tdClass: 'align-middle',
  }, {
    key: 'jarjestysnro',
    label: $t('nro') as string,
    sortable: true,
    tdClass: 'align-middle',
  }, {
    key: 'nimi',
    sortable: true,
    sortByFormatted: true,
    label: $t('nimi') as string,
    tdClass: 'align-middle',
    formatter: (value: any, key: string, item: any) => {
      return $kaanna(value);
    },
  }, {
    key: 'perusteenTutkinnonosaViite.laajuus',
    sortable: true,
    label: $t('laajuus') as string,
    tdClass: 'align-middle',
    formatter: (value: any, key: string, item: any) => {
      const laajuus = item.perusteenTutkinnonosaViite?.laajuus || item.tutkinnonosaViite?.tosa?.omatutkinnonosa?.laajuus;
      return laajuus ? laajuus + ' ' + $t('osaamispiste') : '';
    },
  }, {
    key: 'tutkinnonosaViite.tosa.muokattu',
    sortable: true,
    label: $t('muokattu') as string,
    tdClass: 'align-middle',
    formatter: (value: any, key: string, item: any) => {
      return $sdt(item.tutkinnonosaViite.tosa.muokattu);
    },
  }, {
    key: 'actions',
    label: '',
    thStyle: { borderBottom: '0px' },
    tdStyle: { width: '50px' },
    tdClass: 'text-center',
  }];
});

const fetch = async () => {
  valitseKaikki.value = false;
  if (opetussuunnitelma.value) {
    await tutkinnonOsatStore.fetch(opetussuunnitelma.value.id!,
      _.toString(opetussuunnitelma.value.koulutustoimija!.id),
      opetussuunnitelma.value.peruste!.id!);
  }
  selectedTutkinnonosat.value = [];
};

const confirm = async () => {
  return $bvModal.msgBoxConfirm($t('tata-toimintoa-ei-voida-perua') as string, {
    title: $t('varmista-poisto'),
    okVariant: 'primary',
    okTitle: $t('poista'),
    cancelVariant: 'link',
    cancelTitle: $t('peruuta'),
    centered: true,
  });
};

const remove = async (tutkinnonosaId: any) => {
  if (await confirm()) {
    poistossa.value.push(tutkinnonosaId);
    await Sisaltoviitteet.removeSisaltoViite(props.toteutussuunnitelmaId, tutkinnonosaId, props.koulutustoimijaId);
    await updateNavigation();
    await fetch();
    _.pull(poistossa.value, tutkinnonosaId);
  }
};

const removeSelected = async () => {
  let ids = _.chain(selectedTutkinnonosat.value)
    .map(osa => _.toNumber(_.get(osa, 'tutkinnonosaViite.id')))
    .value();
  if (await confirm()) {
    isDeleting.value = true;
    await Sisaltoviitteet.removeSisaltoViitteet(props.toteutussuunnitelmaId, props.koulutustoimijaId, ids);
    await updateNavigation();
    await fetch();
    isDeleting.value = false;
  }
};

const updateNavigation = async () => {
  await props.toteutussuunnitelmaStore.initNavigation();
};

const selectAllRows = () => {
  valitseKaikki.value = !valitseKaikki.value;
  if (valitseKaikki.value) {
    selectedTutkinnonosat.value = [
      ...(tutkinnonosat.value || []) as SisaltoviiteLaajaDto[],
    ];
  }
  else {
    selectedTutkinnonosat.value = [];
  }
};

const selectRow = (item: any) => {
  if (_.includes(_.map(selectedTutkinnonosat.value, 'tutkinnonosaViite.id'), item.tutkinnonosaViite.id)) {
    selectedTutkinnonosat.value = _.filter(selectedTutkinnonosat.value, tutkinnonosa => {
      return _.get(tutkinnonosa, 'tutkinnonosaViite.id') !== item.tutkinnonosaViite.id;
    });
  }
  else {
    selectedTutkinnonosat.value = [
      ...selectedTutkinnonosat.value,
      item,
    ];
  }
};

watch(opetussuunnitelma, async () => {
  await fetch();
}, { immediate: true });
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.paikallinen {
  color: $black;
  font-size: 0.9rem;
  font-weight: 600;
}

.selectable {
  cursor: pointer;

  .checked {
    color: $paletti-blue;
  }
}
</style>

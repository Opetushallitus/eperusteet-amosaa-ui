<template>
  <div>
    <div @click="openModal">
      <span class="cursor-pointer">
        {{ $t(sisaltoTuontiKaannokset['tuoBtn']) }}
      </span>
    </div>
    <ep-modal
      ref="sisallontuontiModal"
      size="lg"
      :header="$t('tuo-sisaltoa')"
      @cancel="onModalCancel"
    >
      <div v-if="!toteutussuunnitelma">
        <p>{{ $t(sisaltoTuontiKaannokset['topicNoOps']) }}</p>
        <ep-search
          v-model="query.nimi"
          :placeholder="$t(sisaltoTuontiKaannokset['searchPlaceholder'])"
        />
        <ep-spinner v-if="!opetussuunnitelmatpage" />

        <div v-else>
          <ep-table
            responsive
            striped
            :items="opetussuunnitelmatFiltered"
            :fields="opetussuunnitelmaFields"
            data-key="id"
          >
            <template #cell(nimi)="{ item }">
              <ep-button
                variant="link"
                @click="valitseToteutussuunnitelma(item)"
              >
                {{ $kaanna(item.nimi) }}
              </ep-button>
            </template>
          </ep-table>

          <ep-b-pagination
            v-model="page"
            :total="totalRows"
            :items-per-page="query.sivukoko"
            aria-controls="tuo-sisaltoa-modaali"
          />
        </div>
      </div>

      <div v-else>
        <p>{{ $t(sisaltoTuontiKaannokset['topicOps']) }} {{ $kaanna(toteutussuunnitelma.nimi) }}</p>
        <ep-spinner v-if="!sisaltoviitteet" />

        <div v-else>
          <div
            v-for="(sisaltoTaulu, index) in sisaltoTaulut"
            :key="'sisaltotaulu'+index"
          >
            <ep-table
              responsive
              striped
              :items="sisaltoTaulu.items"
              :fields="sisaltoTaulu.fields"
              :per-page="sisaltoSivuKoko"
              :current-page="sisaltoPages[sisaltoTaulu.page]"
              data-key="id"
              @update:current-page="(p) => setSisaltoPage(sisaltoTaulu.page, p)"
            >
              <template #cell(nimi)="{ item }">
                <div
                  class="selectable"
                  @click="selectRow(item.id)"
                >
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
                  <span>{{ $kaanna(item.tekstiKappale.nimi) }}</span>
                </div>
              </template>
            </ep-table>
          </div>
        </div>
      </div>

      <template #modal-footer>
        <ep-button
          v-if="toteutussuunnitelma"
          variant="link"
          @click="back"
        >
          {{ $t('edellinen') }}
        </ep-button>
        <ep-button
          variant="link"
          @click="clear"
        >
          {{ $t('peruuta') }}
        </ep-button>
        <ep-button
          v-if="toteutussuunnitelma"
          @click="save"
        >
          {{ $t('tuo-valitut-sisallot') }}
        </ep-button>
      </template>
    </ep-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref, watch, useTemplateRef } from 'vue';
import _ from 'lodash';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpBPagination from '@shared/components/EpBPagination/EpBPagination.vue';
import EpModal from '@shared/components/EpModal/EpModal.vue';
import EpTable from '@shared/components/EpTable/EpTable.vue';

import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { SisaltotuontiStore } from '@/stores/SisaltotuontiStore';
import { $t, $kaanna, $success } from '@shared/utils/globals';

const kaannokset = {
  default: {
    tuoBtn: 'tuo-sisaltoa-muista-toteutussuunnitelmista',
    topicNoOps: 'valitse-ensin-mista-suunnitelmasta-haluat-tuoda-sisaltoa',
    topicOps: 'valitse-mitka-sisallot-haluat-tuoda-toteutussuunnitelmasta',
    searchPlaceholder: 'etsi-toteutussuunnitelmaa-tai-jaettua-osaa-tai-yhteista-osaa',
  },
  organisaatioRyhma: {
    tuoBtn: 'tuo-sisaltoa-toisesta-raportista',
    topicNoOps: 'valitse-ensin-mista-tunnistamisrapostista-haluat-tuoda-sisaltoa',
    topicOps: 'valitse-mitka-sisallot-haluat-tuoda-tunnistamisraportista',
    searchPlaceholder: 'etsi',
  },
};

const props = defineProps<{
  opetussuunnitelmaId: number;
  koulutustoimijaId: string;
  updateNavigation: () => Promise<void>;
}>();

const koulutustoimija = inject<any>('koulutustoimija');

const query = ref<any>({});
const sisaltoPages = ref<Record<string, number>>({});
const sisaltoSivuKoko = ref(5);
const sisaltotuontiStore = ref<SisaltotuontiStore | null>(null);
const toteutussuunnitelma = ref<OpetussuunnitelmaDto | null>(null);
const valitutSisaltoviitteet = ref<number[]>([]);

const sisallontuontiModal = useTemplateRef<InstanceType<typeof EpModal>>('sisallontuontiModal');

const defaults = () => {
  query.value = {
    sivu: 0,
    sivukoko: 10,
    kieli: Kielet.getSisaltoKieli.value,
    tila: ['luonnos', 'valmis', 'julkaistu'],
    nimi: '',
  };

  sisaltoPages.value = {
    tekstikappaleet: 1,
    suorituspolut: 1,
    tutkinnonosat: 1,
  };
};

const opetussuunnitelmat = computed(() => {
  if (sisaltotuontiStore.value && sisaltotuontiStore.value.opetussuunnitelmat) {
    return (sisaltotuontiStore.value.opetussuunnitelmat as any).data;
  }
  return undefined;
});

const opetussuunnitelmatFiltered = computed(() => {
  return _.filter(opetussuunnitelmat.value, ops => ops.id !== props.opetussuunnitelmaId);
});

const sisaltoviitteet = computed(() => {
  if (sisaltotuontiStore.value) {
    return sisaltotuontiStore.value.sisaltoviitteet;
  }
  return undefined;
});

const tekstikappaleet = computed(() => {
  if (sisaltotuontiStore.value) {
    return sisaltotuontiStore.value.tekstikappaleet;
  }
  return undefined;
});

const suorituspolut = computed(() => {
  if (sisaltotuontiStore.value) {
    return sisaltotuontiStore.value.suorituspolut;
  }
  return undefined;
});

const tutkinnonosat = computed(() => {
  if (sisaltotuontiStore.value) {
    return sisaltotuontiStore.value.tutkinnonosat;
  }
  return undefined;
});

const opetussuunnitelmatpage = computed(() => {
  if (sisaltotuontiStore.value) {
    return sisaltotuontiStore.value.opetussuunnitelmat;
  }
  return 0;
});

const totalRows = computed(() => {
  return _.get(opetussuunnitelmatpage.value, 'kokonaismäärä');
});

const page = computed({
  get() {
    return _.get(opetussuunnitelmatpage.value, 'sivu') + 1;
  },
  set(value: number) {
    query.value.sivu = value - 1;
  },
});

const opetussuunnitelmaFields = computed(() => {
  let tableFields: any[] = [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: false,
  }];

  if (!koulutustoimija?.organisaatioRyhma) {
    tableFields = [
      ...tableFields,
      {
        key: 'tyyppi',
        sortable: false,
        label: $t('tyyppi'),
        formatter: (value: any, key: string, item: OpetussuunnitelmaDto) => {
          return $t('amosaa-tyyppi-' + value);
        },
      }, {
        key: 'perusteDiaarinumero',
        sortable: false,
        label: $t('diaarinumero'),
      }];
  }

  return tableFields;
});

const sisaltoviiteMap = (sisaltoviitteet: any[]) => {
  return _.map(sisaltoviitteet, sisaltoviite => {
    return {
      ...sisaltoviite,
      selected: itemSelected(sisaltoviite.id),
    };
  });
};

const itemSelected = (itemId: number) => {
  return _.includes(valitutSisaltoviitteet.value, itemId);
};

const sisaltoviiteFields = (tyyppi: string) => {
  return [{
    key: 'nimi',
    label: $t(tyyppi),
    sortable: false,
  }];
};

const sisaltoTaulut = computed(() => {
  return [
    {
      items: sisaltoviiteMap(tekstikappaleet.value || []),
      fields: sisaltoviiteFields('tekstikappale'),
      page: 'tekstikappaleet',
    },
    {
      items: sisaltoviiteMap(suorituspolut.value || []),
      fields: sisaltoviiteFields('suorituspolku'),
      page: 'suorituspolut',
    },
    {
      items: sisaltoviiteMap(tutkinnonosat.value || []),
      fields: sisaltoviiteFields('tutkinnonosa'),
      page: 'tutkinnonosat',
    },
  ];
});

const sisaltoTuontiKaannokset = computed(() => {
  return kaannokset[koulutustoimija?.organisaatioRyhma ? 'organisaatioRyhma' : 'default'];
});

function setSisaltoPage(pageKey: string, p: number) {
  sisaltoPages.value = { ...sisaltoPages.value, [pageKey]: p };
}

function onModalCancel() {
  toteutussuunnitelma.value = null;
  valitutSisaltoviitteet.value = [];
  sisaltotuontiStore.value!.clear();
}

const openModal = async () => {
  sisallontuontiModal.value?.show();
  defaults();
  await sisaltotuontiStore.value!.fetch(query.value);
};

const selectRow = (itemId: number) => {
  if (itemSelected(itemId)) {
    valitutSisaltoviitteet.value = _.filter(valitutSisaltoviitteet.value, id => id !== itemId);
  }
  else {
    valitutSisaltoviitteet.value = [
      ...valitutSisaltoviitteet.value,
      itemId,
    ];
  }
};

const valitseToteutussuunnitelma = (toteutussuunnitelmaValue: any) => {
  toteutussuunnitelma.value = toteutussuunnitelmaValue;
  sisaltotuontiStore.value!.fetchSisallot(toteutussuunnitelmaValue.id);
};

const save = async () => {
  await sisaltotuontiStore.value!.tuoSisaltoa(valitutSisaltoviitteet.value);
  sisaltotuontiStore.value!.clear();
  clear();
  $success($t('sisallot-tuotu-onnistuneesti'));
  await props.updateNavigation();
};

const back = () => {
  toteutussuunnitelma.value = null;
  valitutSisaltoviitteet.value = [];
};

const clear = () => {
  onModalCancel();
  sisallontuontiModal.value?.hide();
};

onMounted(() => {
  sisaltotuontiStore.value = new SisaltotuontiStore(props.opetussuunnitelmaId, props.koulutustoimijaId);
});

watch(query, async () => {
  await sisaltotuontiStore.value!.fetch(query.value);
}, { deep: true });

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(.filter) {
    max-width: 100%;
  }

  .selectable {
    cursor: pointer;

    .checked {
      color: $paletti-blue;
    }
  }

</style>

<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <ep-editointi
      :store="editointiStore"
      :use-container="true"
    >
      <template #header>
        <h1 class="organisaatio-title">
          {{ $t('organisaation-hallinta') }}
        </h1>
      </template>

      <template #default="{ data, isEditing }">
        <div class="container">
          <h2 class="mt-3">
            {{ $t('koulutusjarjestaja-kuvaus') }}
          </h2>

          <ep-content
            v-model="data.kuvaus"
            layout="minimal"
            :is-editable="isEditing"
            class="mb-5"
          />

          <h2>{{ $t('yhteistyo') }}</h2>

          <div class="mb-5">
            <h3>{{ $t('oma-organisaatiohierarkia') }}</h3>

            <div v-if="hierarkia">
              <!-- Värien merkitys ohjeet -->
              <ul class="colors-menu d-flex flex-row justify-content-end mb-2">
                <li class="oma">
                  {{ $t('oma-organisaatio') }}
                </li>
                <li class="odotetaan">
                  {{ $t('yhteistyo-kysytty') }}
                </li>
                <li class="pyynto">
                  {{ $t('yhteistyo-odottaa-hyvaksymista') }}
                </li>
                <li class="yhteistyo">
                  {{ $t('yhteistyo-organisaation-kanssa') }}
                </li>
              </ul>

              <ul style="list-style-type: none; padding-left: 0;">
                <ep-organization-tree
                  :value="hierarkia"
                  :is-editing="isEditing"
                  :yhteistyo-map="yhteistyoMap"
                />
              </ul>
            </div>
            <ep-spinner v-else />
          </div>

          <h3>{{ $t('muut-organisaatiot') }}</h3>

          <ep-toggle
            v-model="data.salliystavat"
            :is-s-witch="false"
            :is-editing="isEditing"
            class="my-3"
            size="lg"
          >
            {{ $t('salli-yhteistyo') }}
          </ep-toggle>

          <div v-if="hasMuut">
            <div v-if="!isMuutEmpty">
              <!-- Värien merkitys ohjeet -->
              <ul class="colors-menu d-flex flex-row justify-content-end mb-2">
                <li class="odotetaan">
                  {{ $t('yhteistyo-kysytty') }}
                </li>
                <li class="pyynto">
                  {{ $t('yhteistyo-odottaa-hyvaksymista') }}
                </li>
                <li class="yhteistyo">
                  {{ $t('yhteistyo-organisaation-kanssa') }}
                </li>
              </ul>

              <div
                v-for="(node, idx) in muut"
                :key="idx"
              >
                <ep-organization-node
                  :value="node"
                  :is-editing="isEditing"
                  :yhteistyo-map="yhteistyoMap"
                />
              </div>
            </div>
          </div>
          <ep-spinner v-else />

          <ep-button
            v-if="!isEditing"
            v-oikeustarkastelu="{ oikeus: 'hallinta' }"
            variant="primary"
            :show-spinner="!yhteistyoKoulutustoimijat"
            @click="lahetaYhteistyopyyntoModalRef?.show()"
          >
            {{ $t('laheta-yhteistyopyynto') }}
          </ep-button>

          <b-modal
            id="laheta-yhteistyopyynto-modal"
            ref="lahetaYhteistyopyyntoModalRef"
            :title="$t('tee-yhteistyopyynto')"
            :hide-footer="true"
            size="lg"
          >
            <p>{{ $t('tee-yhteistyopyynto-kuvaus') }}</p>

            <ep-search
              v-model="nimiFilter"
              :placeholder="$t('etsi-organisaatiota')"
              class="mb-3"
            />

            <b-table
              responsive
              striped
              :items="yhteistyoKoulutustoimijatFormatted"
              :fields="fields"
              :per-page="perPage"
              :current-page="currentPage"
            >
              <template #cell(actions)="row">
                <div class="float-right">
                  <ep-button
                    v-if="row.item.status"
                    v-oikeustarkastelu="{ oikeus: 'hallinta' }"
                    variant="link"
                    disabled
                  >
                    <span v-if="row.item.status === 'oma'">{{ $t('oma-organisaatio') }}</span>
                    <span v-else-if="row.item.status === 'odotetaan'">{{ $t('yhteistyo-kysytty') }}</span>
                    <span v-else-if="row.item.status === 'pyynto'">{{ $t('yhteistyo-odottaa-hyvaksymista') }}</span>
                    <span v-else-if="row.item.status === 'yhteistyo'">{{ $t('yhteistyo-organisaation-kanssa') }}</span>
                  </ep-button>
                  <ep-button
                    v-else
                    v-oikeustarkastelu="{ oikeus: 'hallinta' }"
                    variant="link"
                    @click="lahetaYhteistyopyynto(row.item)"
                  >
                    {{ $t('laheta-yhteistyopyynto') }}
                  </ep-button>
                </div>
              </template>
            </b-table>

            <ep-pagination
              v-model="currentPage"
              :total-rows="rows"
              :per-page="perPage"
              align="center"
              aria-controls="laheta-yhteistyopyynto-modal"
            />
          </b-modal>
        </div>
      </template>
    </ep-editointi>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import _, { get } from 'lodash';

import { fail, success } from '@shared/utils/notifications';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Koulutustoimijat, OrganisaatioHierarkiaDto, KoulutustoimijaYstavaDto, KoulutustoimijaBaseDto } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';

import { KayttajaStore } from '@/stores/kayttaja';
import { OrganisaatioStore } from '@/stores/OrganisaatioStore';
import { OrganizationEventBus } from '@/components/EpOrganizationTree/OrganizationEventBus';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpColorCircle from '@shared/components/EpColorIndicator/EpColorCircle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpOrganizationTree from '@/components/EpOrganizationTree/EpOrganizationTree.vue';
import EpOrganizationNode from '@/components/EpOrganizationTree/EpOrganizationNode.vue';
import EpPagination from '@shared/components/EpPagination/EpPagination.vue';

import { $t, $fail, $kaanna, $filterBy, $bvModal, $success } from '@shared/utils/globals';

const logger = createLogger('RouteOrganisaatio');

const props = defineProps<{
  kayttajaStore: KayttajaStore;
  koulutustoimijaId: string;
}>();

const lahetaYhteistyopyyntoModalRef = useTemplateRef('lahetaYhteistyopyyntoModalRef');

const editointiStore = ref<EditointiStore | null>(null);
const hierarkia = ref<OrganisaatioHierarkiaDto | null>(null);
const ystavat = ref<KoulutustoimijaYstavaDto[] | null>(null);
const pyynnot = ref<KoulutustoimijaBaseDto[] | null>(null);
const yhteistyoKoulutustoimijat = ref<KoulutustoimijaBaseDto[] | null>(null);
const currentPage = ref(1);
const perPage = ref(5);
const nimiFilter = ref('');

const koulutustoimija = computed(() => {
  return props.kayttajaStore.koulutustoimija.value;
});

const hierarkiaFlatten = computed(() => {
  const nodes: any[] = [];
  function traverseTree(node: any, depth: number) {
    nodes.push({
      oid: node.oid,
      parentOid: node.parentOid,
      nimi: node.nimi,
      depth,
    });
    return _.map(node.children, child => traverseTree(child, depth + 1));
  }

  if (hierarkia.value) {
    traverseTree(hierarkia.value, 0);
    return nodes;
  }

  return undefined;
});

const muut = computed(() => {
  return _(ystavat.value || [])
    .concat(pyynnot.value || [])
    .filter(node => !_.find(hierarkiaFlatten.value, { oid: node.organisaatio }))
    .sortBy(node => node.nimi ? $kaanna(node.nimi) : Number.MAX_SAFE_INTEGER)
    .value();
});

const hasMuut = computed(() => {
  return ystavat.value || pyynnot.value;
});

const isMuutEmpty = computed(() => {
  return _.isEmpty(muut.value);
});

const yhteistyoMap = computed(() => {
  const map: any = {};
  if (hierarkia.value && hierarkiaFlatten.value) {
    // Oma organisaatio
    const kt = editointiStore.value!.data;
    if (kt && kt.organisaatio) {
      map[kt.organisaatio] = {
        ...map[kt.organisaatio],
        id: kt.id,
        status: 'oma',
      };
    }

    if (ystavat.value) {
      _.each(ystavat.value, ystava => {
        if (ystava.organisaatio && ystava.status) {
          map[ystava.organisaatio] = {
            ...map[ystava.organisaatio],
            id: ystava.id,
            status: ystava.status,
          };
        }
      });
      _.each(pyynnot.value, pyynto => {
        if (pyynto.organisaatio) {
          map[pyynto.organisaatio] = {
            ...map[pyynto.organisaatio],
            id: pyynto.id,
            status: 'pyynto',
          };
        }
      });
    }
  }
  return map;
});

const fields = computed(() => {
  return [{
    key: 'nimiLocalized',
    label: $t('nimi'),
    sortable: true,
  }, {
    key: 'actions',
    label: $t('toiminto'),
    class: 'toiminto-cell',
  }];
});

const rows = computed(() => {
  return yhteistyoKoulutustoimijat.value ? yhteistyoKoulutustoimijat.value.length : 0;
});

const yhteistyoKoulutustoimijatFormatted = computed(() => {
  if (yhteistyoMap.value) {
    return _(yhteistyoKoulutustoimijat.value)
      .filter('organisaatio')
      .map(kt => {
        const yhteistyo = yhteistyoMap.value[kt.organisaatio!];
        return {
          ...kt,
          nimiLocalized: $kaanna(kt.nimi!),
          status: yhteistyo ? yhteistyo.status : undefined,
        };
      })
      .filter($filterBy('nimiLocalized', nimiFilter.value))
      .sortBy(kt => kt.nimiLocalized ? kt.nimiLocalized : Number.MAX_SAFE_INTEGER)
      .value();
  }

  return undefined;
});

const hasYhteistyoKoulutustoimijatFormatted = computed(() => {
  return !_.isEmpty(yhteistyoKoulutustoimijatFormatted.value);
});

const fetch = async () => {
  editointiStore.value = new EditointiStore(new OrganisaatioStore(props.koulutustoimijaId));

  try {
    const res = _.map(await (Promise.all([
      Koulutustoimijat.getHierarkia(props.koulutustoimijaId),
      Koulutustoimijat.getOmatYstavat(props.koulutustoimijaId),
      Koulutustoimijat.getPyynnot(props.koulutustoimijaId),
      Koulutustoimijat.getYhteistyoKoulutustoimijat(props.koulutustoimijaId),
    ])), 'data') as any;

    hierarkia.value = res[0] || koulutustoimija.value;
    ystavat.value = res[1];
    pyynnot.value = res[2];
    yhteistyoKoulutustoimijat.value = res[3];
  }
  catch (e) {
    $fail($t('virhe-palvelu-virhe') as string);
    hierarkia.value = {};
    ystavat.value = [];
    pyynnot.value = [];
    yhteistyoKoulutustoimijat.value = [];
  }
};

const peruutaYhteistyopyynto = async (event: any) => {
  if (await $bvModal.msgBoxConfirm($t('varmista-yhteistyopyynto-perutus', { nimi: $kaanna(event.nimi) }) as string, {
    title: $t('peruuta-yhteistyopyynto') as string,
    okVariant: 'primary',
    okTitle: $t('kylla') as string,
    cancelVariant: 'link',
    cancelTitle: $t('ei') as string,
    centered: true,
  })) {
    try {
      const kt = editointiStore.value!.data;
      const id = _.toString(event.id);
      if (ystavat.value && kt && _.includes(kt.ystavat, id)) {
        kt.ystavat.splice(_.indexOf(kt.ystavat, id), 1);
        await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
        ystavat.value.splice(_.indexOf(ystavat.value, event), 1);
        $success('yhteistyopyynto-peruutettu');
        return;
      }
    }
    catch (err) {
      logger.error('yhteistyopyynto-peruutus-epaonnistui', err);
    }
    $fail('yhteistyopyynto-peruutus-epaonnistui');
    fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
  }
};

const hylkaaYhteistyopyynto = async (event: any) => {
  if (await $bvModal.msgBoxConfirm($t('varmista-hylkaa-yhteistyopyynto', { nimi: $kaanna(event.nimi) }) as string, {
    title: $t('hylkaa-yhteistyopyynto') as string,
    okVariant: 'primary',
    okTitle: $t('hylkaa-yhteistyopyynto') as string,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as string,
    centered: true,
  })) {
    try {
      if (pyynnot.value) {
        await Koulutustoimijat.hylkaaYhteistyopyynto(event.id, _.toString(props.koulutustoimijaId));
        pyynnot.value.splice(_.indexOf(pyynnot.value, event), 1);
        $success('yhteistyopyynto-hylkaa');
        return;
      }
    }
    catch (err) {
      logger.error('yhteistyopyynto-hylkaaminen-epaonnistui', err);
    }
    $fail('yhteistyopyynto-hylkaaminen-epaonnistui');
    fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
  }
};

const hyvaksyYhteistyopyynto = async (event: any) => {
  if (await $bvModal.msgBoxConfirm($t('varmista-hyvaksy-yhteistyopyynto', { nimi: $kaanna(event.nimi) }) as string, {
    title: $t('hyvaksy-yhteistyopyynto') as string,
    okVariant: 'primary',
    okTitle: $t('hyvaksy-yhteistyopyynto') as string,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as string,
    centered: true,
  })) {
    try {
      const kt = editointiStore.value!.data;
      const id = _.toString(event.id);
      if (ystavat.value && pyynnot.value && kt && !_.includes(kt.ystavat, id)) {
        kt.ystavat.push(id);
        await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
        pyynnot.value.splice(_.indexOf(pyynnot.value, event), 1);
        ystavat.value.push({
          ...event,
          status: 'yhteistyo',
        });
        $success('yhteistyopyynto-hyvaksytty');
        return;
      }
    }
    catch (err) {
      logger.error('yhteistyopyynto-lahetys-epaonnistui', err);
    }
    $fail('yhteistyopyynto-hyvaksyminen-epaonnistui');
    fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
  }
};

const lopetaYhteistyo = async (event: any) => {
  if (await $bvModal.msgBoxConfirm($t('varmista-lopeta-yhteistyopyynto', { nimi: $kaanna(event.nimi) }) as string, {
    title: $t('lopeta-yhteistyo') as string,
    okVariant: 'primary',
    okTitle: $t('lopeta-yhteistyo') as string,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as string,
    centered: true,
  })) {
    try {
      const kt = editointiStore.value!.data;
      const id = _.toString(event.id);
      if (pyynnot.value && ystavat.value && kt && _.includes(kt.ystavat, id)) {
        kt.ystavat.splice(_.indexOf(kt.ystavat, id), 1);
        await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
        await Koulutustoimijat.hylkaaYhteistyopyynto(event.id, _.toString(kt.id));
        ystavat.value.splice(_.indexOf(ystavat.value, event), 1);
        $success('yhteistyo-lopetettu');
        return;
      }
    }
    catch (err) {
      logger.error('yhteistyo-lopetus-epaonnistui', err);
    }
    $fail('yhteistyo-lopetus-epaonnistui');
    fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
  }
};

const lahetaYhteistyopyynto = async (event: any) => {
  if (await $bvModal.msgBoxConfirm($t('varmista-laheta-yhteistyopyynto', { nimi: $kaanna(event.nimi) }) as string, {
    title: $t('laheta-yhteistyopyynto') as string,
    okVariant: 'primary',
    okTitle: $t('laheta-yhteistyopyynto') as string,
    cancelVariant: 'link',
    cancelTitle: $t('peruuta') as string,
    centered: true,
  })) {
    try {
      const kt = editointiStore.value!.data;
      const id = _.toString(event.id);
      if (ystavat.value && kt && !_.includes(kt.ystavat, id)) {
        kt.ystavat.push(id);
        await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
        ystavat.value.push({
          ...event,
          status: 'odotetaan',
        });
        success('yhteistyopyynto-lahetetty');
        return;
      }
    }
    catch (err) {
      console.
        logger.error('yhteistyopyynto-lahetys-epaonnistui', err);
    }
    $fail('yhteistyopyynto-lahetys-epaonnistui');
    fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
  }
};

onMounted(() => {
  OrganizationEventBus.$off(); // Prevent duplicate listener on hot reload
  OrganizationEventBus.$on('peruuta-yhteistyopyynto', peruutaYhteistyopyynto);
  OrganizationEventBus.$on('hylkaa-yhteistyopyynto', hylkaaYhteistyopyynto);
  OrganizationEventBus.$on('hyvaksy-yhteistyopyynto', hyvaksyYhteistyopyynto);
  OrganizationEventBus.$on('lopeta-yhteistyo', lopetaYhteistyo);
  OrganizationEventBus.$on('laheta-yhteistyopyynto', lahetaYhteistyopyynto);
});

watch(() => props.koulutustoimijaId, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    await fetch();
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
.organisaatio-title {
  font-size: 1.25rem;
  margin-bottom: 0;
}

ul.colors-menu {
  padding: 0;
  li {
    font-size: 0.8rem;
    font-weight: 300;
    display: inline-block;

    margin-left: 1rem;
    padding-left: 1.5rem;
    position: relative;

    &:before {
      content: '\2B24';
      font-size: 1rem;
      position: absolute;
      top: -0.3rem;
      left: 0rem;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact
    }

    &:first-child {
      margin-left: 0;
    }
  }

  .oma {
    &:before {
      color: #E60895;
    }
  }

  .odotetaan {
    &:before {
      color: #99B3F1;
    }
  }

  .pyynto {
    &:before {
      color: #FFCD32;
    }
  }

  .yhteistyo {
    &:before {
      color: #BEEAA0;
    }
  }
}

:deep(.toiminto-cell) {
  width: 30%;
}

</style>

<template>
  <div>
    <div
      v-if="depth > 0"
      class="d-flex"
    >
      <div class="w-100">
        <div
          class="rakenne"
          :style="style"
        >
          <div
            class="d-flex w-100 justify-content-between"
            :class="{'kuvaukseton': !node.kuvaus}"
          >
            <div
              v-if="node.osat && node.osat.length > 0"
              @click="toggleOsat()"
            >
              <EpMaterialIcon v-if="!showOsat">
                expand_more
              </EpMaterialIcon>
              <EpMaterialIcon v-else>
                expand_less
              </EpMaterialIcon>
            </div>
            <div
              class="w-75"
              :class="{'ml-3' : node.osat && node.osat.length > 0}"
            >
              <slot name="nimi">
                <span v-if="isRyhma" />
                <span v-else>
                  <ep-color-indicator
                    :id="'node-' + node.tunniste"
                    :tooltip="false"
                    :kind="node.pakollinen ? 'pakollinen' : 'valinnainen'"
                    class="mr-2"
                  />
                  <b-popover
                    :target="'node-' + node.tunniste"
                    :placement="'bottom'"
                    triggers="hover"
                  >
                    <span v-if="node.pakollinen">{{ $t('pakollinen-tutkinnon-osa') }}</span>
                    <span v-if="!node.pakollinen">{{ $t('valinnainen-tutkinnon-osa') }}</span>
                  </b-popover>
                </span>
                <span :style="{ 'text-decoration': paikallinen.piilotettu ? 'line-through' : '' }">
                  {{ $kaanna(info.nimi) }}
                  <span
                    v-if="info.koodi"
                    class="ml-1"
                  >({{ info.koodi }})</span>
                </span>
              </slot>
            </div>
            <div class="w-25 text-right">
              <span v-if="isRyhma">
                <span :class="{'text-warning': osienLaajuus < info.minimi}">
                  {{ info.minimi }} - {{ info.maksimi }}
                </span>
                <span
                  v-else
                  class="text-warning"
                >
                  {{ osienLaajuus }} &lt; {{ info.minimi }}
                </span>
              </span>
              <span v-else>
                {{ info.minimi }}
              </span>
              <div
                v-if="isEditing"
                class="btn-group"
              >
                <button
                  v-if="!paikallinen.piilotettu"
                  class="btn btn-link"
                  @click="muokkaa()"
                >
                  <EpMaterialIcon>edit</EpMaterialIcon>
                </button>
                <button
                  class="btn btn-link"
                  @click="toggleNode()"
                >
                  <EpMaterialIcon>delete</EpMaterialIcon>
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="(node.kuvaus || paikallinen.kuvaus) && !naytaKuvaukset"
            class="text-center"
            @click="toggleKuvaus()"
          >
            <EpMaterialIcon>more_horiz</EpMaterialIcon>
          </div>
          <div
            v-if="(node.kuvaus || paikallinen.kuvaus) && (showKuvaus || naytaKuvaukset)"
            class="kuvaus"
          >
            <div v-html="$kaanna(node.kuvaus)" />
            <div
              v-if="paikallinen && paikallinen.kuvaus"
              v-html="$kaanna(paikallinen.kuvaus)"
            />
          </div>
        </div>
      </div>
    </div>
    <div>
      <div
        v-if="paikallinen.koodit.length > 0"
        class="paikalliset"
      >
        <div
          v-for="kiinnitetty in kiinnitetyt"
          :key="'osa-' + kiinnitetty.koodi"
          class="kiinnitys paikallinen"
        >
          <ep-color-indicator
            :id="'node-' + node.tunniste"
            :tooltip="false"
            kind="pakollinen"
            class="mr-2"
          />
          {{ kiinnitetty.nimi }} ({{ kiinnitetty.koodiArvo }})
          <div
            v-if="kiinnitetty.laajuus"
            class="float-right"
          >
            {{ kiinnitetty.laajuus }} {{ $t('osaamispiste') }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="node.osat && !paikallinen.piilotettu && showOsat">
      <div class="aliosat">
        <div
          v-for="(osa, idx) in osat"
          :key="'osa-' + idx"
          class="osa"
        >
          <EpSuorituspolkuNode
            v-model="model"
            :is-editing="isEditing"
            :tutkinnon-osat="tutkinnonOsat"
            :tutkinnon-osa-viitteet="tutkinnonOsaViitteet"
            :tutkinnon-osa-viitteet-by-tutkinnon-osa-id="tutkinnonOsaViitteetByTutkinnonOsaId"
            :liitettavat-osat="liitettavatOsat"
            :node="osa"
            :nayta-piilotetut="naytaPiilotetut"
            :nayta-kuvaukset="naytaKuvaukset"
            :viimeinen="idx === node.osat.length - 1"
            :depth="depth + 1"
            :nayta-rakenne="naytaRakenne"
          />
        </div>
      </div>
    </div>
    <b-modal
      :id="'suorituspolku-modal-' + node.tunniste"
      ref="muokkausModal"
      size="lg"
      :title="$t('muokkaa') + ': ' + $kaanna(info.nimi)"
      :hide-footer="true"
    >
      <div v-if="modalData">
        <b-form-group :label="$t('kuvaus')">
          <ep-content
            v-model="modalData.kuvaus"
            layout="normal"
            :is-editable="true"
          />
        </b-form-group>
        <div v-if="node.rooli === 'määrittelemätön'">
          <b-table
            responsive
            striped
            :items="tutkinnonOsaArvot"
            :fields="tutkinnonOsaFields"
          >
            <template #cell(nimi)="{ item }">
              <div
                class="selectable"
                @click="selectKoodi(item)"
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
                <span>{{ item.nimi }} ({{ item.koodiArvo }})</span>
              </div>
            </template>
          </b-table>
        </div>
      </div>
      <div class="float-right">
        <button
          class="btn btn-link"
          @click="peruuta()"
        >
          {{ $t('peruuta') }}
        </button>
        <button
          class="btn btn-primary"
          @click="tallenna()"
        >
          {{ $t('tallenna') }}
        </button>
      </div>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch, withDefaults } from 'vue';
import _ from 'lodash';

import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

import { rakenneNodecolor } from '@shared/utils/perusterakenne';
import { $t, $kaanna } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  isEditing: boolean;
  modelValue: any;
  tutkinnonOsat: any;
  tutkinnonOsaViitteet: any;
  tutkinnonOsaViitteetByTutkinnonOsaId: any;
  liitettavatOsat: any;
  node: any;
  depth?: number;
  naytaKuvaukset?: boolean;
  naytaRakenne?: boolean;
  naytaPiilotetut?: boolean;
  viimeinen?: boolean;
}>(), {
  depth: 0,
  naytaKuvaukset: false,
  naytaRakenne: false,
  naytaPiilotetut: false,
  viimeinen: false,
});

const muokkausModalRef = useTemplateRef('muokkausModal');

const showKuvaus = ref(false);
const showOsat = ref(true);
const modalData = ref<any | null>(null);

const emit = defineEmits(['update:modelValue']);

const findPaikallinen = (tunniste: any) => {
  return _.find(props.modelValue.rivit, { rakennemoduuli: tunniste });
};

const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const paikallinen = computed(() => {
  if (props.node.tunniste) {
    return findPaikallinen(props.node.tunniste) || {
      id: props.node.id,
      rakennemoduuli: props.node.tunniste,
      piilotettu: false,
      kuvaus: null,
      koodit: [],
    };
  }
  return null;
});

const isRyhma = computed(() => {
  return !!props.node.muodostumisSaanto || !!props.node.tutkintonimike || !!props.node.osaamisala || !!props.node.osat;
});

const hasParent = computed(() => {
  return props.depth > 0;
});

const tov = computed(() => {
  if (!isRyhma.value) {
    const viite = props.node._tutkinnonOsaViite;
    if (viite) {
      return props.tutkinnonOsaViitteet[viite] || null;
    }
  }
  return null;
});

const tosa = computed(() => {
  if (tov.value) {
    return props.tutkinnonOsat[tov.value._tutkinnonOsa] || null;
  }
  return null;
});

const suodataOsat = (node: any) => {
  if (!props.naytaPiilotetut) {
    return _.filter(node.osat, osa => {
      const paikallinenOsa = findPaikallinen(osa.tunniste);
      return !paikallinenOsa || !paikallinenOsa.piilotettu;
    });
  }
  else {
    return node.osat || [];
  }
};

const osat = computed(() => {
  return suodataOsat(props.node);
});

const style = computed(() => {
  return 'border-color: ' + rakenneNodecolor(props.node, false);
});

const liitettavatByKoodi = computed(() => {
  return _.keyBy(props.liitettavatOsat, osa =>
    _.get(osa, 'tosa.omatutkinnonosa.koodi')
      || _.get(osa, 'tosa.koodi'));
});

const getLaajuusByKoodi = (koodi: string) => {
  const liitettava = liitettavatByKoodi.value[koodi];
  if (liitettava.tosa.omatutkinnonosa) {
    return liitettava.tosa.omatutkinnonosa.laajuus;
  }
  else {
    const pviite = props.tutkinnonOsaViitteetByTutkinnonOsaId[liitettava.tosa.perusteentutkinnonosa];
    return pviite?.laajuus || 0;
  }
};

const laskennallinenLaajuus = (node: any) => {
  return _.get(node, 'muodostumisSaanto.laajuus.maksimi')
    || _.get(node, 'muodostumisSaanto.laajuus.minimi')
    || _.get(props.tutkinnonOsaViitteet[node._tutkinnonOsaViite], 'laajuus')
    || _.get(node, 'tosa.omatutkinnonosa.laajuus')
    || 0;
};

const laskettuOsienLaajuus = (node: any) => {
  const osalaajuus = _(paikallinen.value?.koodit)
    .map(getLaajuusByKoodi)
    .filter(_.isNumber)
    .sum();

  const ryhmalaajuus = _(suodataOsat(node))
    .map(laskennallinenLaajuus)
    .sum();

  return osalaajuus + ryhmalaajuus;
};

const osienLaajuus = computed(() => {
  return laskettuOsienLaajuus(props.node);
});

const info = computed(() => {
  const result = {
    nimi: props.node.nimi,
    minimi: null as number | null,
    maksimi: null as number | null,
    koodi: _.get(tosa.value, 'koodi.arvo')
      || _.get(props.node, 'tutkintonimike.arvo')
      || _.get(props.node, 'osaamisala.arvo')
      || null,
  };

  if (isRyhma.value) {
    result.nimi = props.node.nimi;
    if (props.node.muodostumisSaanto) {
      result.minimi = _.get(props.node, 'muodostumisSaanto.laajuus.minimi');
      result.maksimi = _.get(props.node, 'muodostumisSaanto.laajuus.maksimi');
    }
    else {
      result.minimi = osienLaajuus.value;
      result.maksimi = osienLaajuus.value;
    }
  }
  else if (tov.value && tosa.value) {
    result.nimi = tosa.value.nimi;
    result.minimi = tov.value.laajuus;
  }
  return result;
});

const mapData = (viite: any) => {
  if (viite) {
    if (viite.tosa.omatutkinnonosa) {
      const koodi = viite.tosa.omatutkinnonosa.koodi;
      return {
        nimi: $kaanna(viite.tekstiKappale.nimi),
        koodi,
        koodiArvo: koodi,
        paikallinen: viite.tosa,
        laajuus: viite.tosa.omatutkinnonosa.laajuus,
        selected: _.includes(modalData.value?.koodit, koodi),
      };
    }
    else {
      const pviite = props.tutkinnonOsaViitteetByTutkinnonOsaId[viite.tosa.perusteentutkinnonosa];
      return {
        nimi: $kaanna(viite.tekstiKappale.nimi),
        koodi: viite.tosa.koodi,
        paikallinen: viite.tosa,
        koodiArvo: _.split(viite.tosa.koodi, '_')[1],
        laajuus: pviite?.laajuus,
        selected: _.includes(modalData.value?.koodit, viite.tosa.koodi),
      };
    }
  }
  return undefined;
};

const koodiToOsa = computed(() => {
  return _(props.liitettavatOsat)
    .map(mapData)
    .keyBy('koodi')
    .value();
});

const kiinnitetyt = computed(() => {
  return _(paikallinen.value?.koodit)
    .map(koodi => koodiToOsa.value[koodi])
    .sortBy('nimi')
    .value();
});

const tutkinnonOsaArvot = computed(() => {
  return _(props.liitettavatOsat)
    .map(mapData)
    .filter()
    .filter('koodi')
    .sortBy('nimi')
    .value();
});

const tutkinnonOsaFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
    sortable: true,
    thStyle: { width: '100%' },
  }];
});

const selectKoodi = (rivi: any) => {
  if (_.includes(modalData.value?.koodit, rivi.koodi)) {
    modalData.value.koodit = _.filter(modalData.value.koodit, (koodi: string) => koodi !== rivi.koodi);
  }
  else {
    modalData.value.koodit = [...modalData.value.koodit, rivi.koodi];
  }
};

const updatePaikallinen = (paikallinenData: any) => {
  if (!paikallinen.value) {
    return;
  }
  const filtered = _.reject(props.modelValue.rivit, { rakennemoduuli: props.node.tunniste });
  model.value.rivit = [...filtered, { ...paikallinenData }];
};

const muokkaa = () => {
  modalData.value = {
    kuvaus: null,
    ...paikallinen.value,
    koodit: paikallinen.value?.koodit || [],
  };
  (muokkausModalRef.value as any)?.show();
};

const peruuta = () => {
  (muokkausModalRef.value as any)?.hide();
  modalData.value = null;
};

const tallenna = () => {
  updatePaikallinen(modalData.value);
  peruuta();
};

const toggleOsat = () => {
  showOsat.value = !showOsat.value;
};

const toggleKuvaus = () => {
  showKuvaus.value = !showKuvaus.value;
};

const toggleNode = () => {
  updatePaikallinen({
    ...paikallinen.value,
    piilotettu: !paikallinen.value?.piilotettu,
  });
};

watch(() => props.naytaRakenne, () => {
  showOsat.value = props.depth === 0 || props.naytaRakenne;
}, { immediate: true });
</script>

<style scoped lang="scss">
  @import '@shared/styles/_variables.scss';

  .rakenne {
    border-radius: 0.3rem 0 0 0;
    border: 0;
    border-left: 0.3rem;
    border-style: solid;
    border-color: $gray;
    padding:20px 20px 0px 20px;
    margin-top: 20px;
    background-color: $white;
    cursor: pointer;

    .kuvaus {
      padding: 20px;
    }

    .kuvaukseton {
      padding-bottom: 20px;
    }
  }

  .kiinnitys {
    margin-left: 1rem;
    border-radius: 0.3rem 0 0 0;
    border: 0;
    border-left: 0rem;
    border-style: solid;
    border-color: $gray;
    padding:10px 10px 10px 10px;
    margin-top: 10px;
    background-color: $white;
    cursor: pointer;

    .kuvaus {
      padding: 20px;
    }

    .kuvaukseton {
      padding-bottom: 20px;
    }
  }

  .liitosviiva {
    width: 20px;
    border-top: 2px solid $gray-lighten-3;
    transform: translateY(3rem);
  }

  .parentviiva {
    border-left: 2px solid $gray-lighten-3;
  }

  .parentviiva.viimeinen {
    height: 50px;
  }

  .rakenneosat.viimeinen {
    margin-left: 2px;
  }

  .aliosat {
    margin-left: 20px;
  }

</style>

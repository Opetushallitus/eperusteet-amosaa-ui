<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :versionumero="versionumero"
      :muokkaus-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }"
    >
      <template #header="{ data }">
        <h2
          v-if="data.opintokokonaisuus.koodiArvo"
          class="m-0"
        >
          {{ $kaanna(data.opintokokonaisuus.kooditettuNimi) }}
        </h2>
        <h2
          v-else
          class="m-0"
        >
          {{ $kaanna(data.tekstiKappale.nimi) }}
        </h2>
      </template>
      <template #default="{ data, isEditing, validation, data: { opintokokonaisuus }, data: { opintokokonaisuus: { tyyppi } } }">
        <b-row>
          <b-col
            v-if="tyyppi === TyyppiSource.OMA || tyyppi === TyyppiSource.PERUSTEESTA && !isEditing"
            md="7"
          >
            <b-form-group
              :label="$t(tyyppikielistys['nimiotsikko']) + (isEditing ? ' *' : '')"
              required
            >
              <EpField
                v-if="opintokokonaisuus.koodiArvo"
                v-model="opintokokonaisuus.kooditettuNimi"
              />
              <EpField
                v-else
                v-model="data.tekstiKappale.nimi"
                :is-editing="isEditing"
                :validation="validation.tekstiKappale.nimi"
              />
            </b-form-group>
          </b-col>
          <b-col md="3">
            <b-form-group :label="$t('laajuus')">
              <EpLaajuusYksikkoInput
                v-model="data.opintokokonaisuus"
                :is-editing="isEditing"
                :validation="validation.opintokokonaisuus"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="10">
            <b-form-group>
              <template #label>
                <div class="d-flex align-items-center">
                  <div>{{ $t('opintokokonaisuuden-koodi') }}</div>
                  <div
                    v-b-popover.hover.right="$t('opintokokonaisuus-koodi-selite')"
                    class="ml-4 default-icon clickable"
                  >
                    <EpMaterialIcon icon-shape="outlined">
                      info
                    </EpMaterialIcon>
                  </div>
                </div>
              </template>
              <div v-if="opintokokonaisuus.koodiArvo">
                {{ opintokokonaisuus.koodiArvo }}
              </div>
              <div
                v-else
                class="font-italic"
              >
                {{ $t('koodi-generoidaan-julkaisussa') }}
              </div>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="10">
            <b-form-group
              :label="$t('kuvaus') + (isEditing && tyyppi === TyyppiSource.OMA ? ' *' : '')"
              required
            >
              <EpContent
                v-model="opintokokonaisuus.kuvaus"
                layout="normal"
                :is-editable="isEditing && tyyppi === TyyppiSource.OMA"
                :validation="validation.opintokokonaisuus.kuvaus"
              />
            </b-form-group>
          </b-col>
        </b-row>
        <hr>
        <h3 class="pt-3">
          {{ $t(tyyppikielistys['tavoiteotsikko']) }}
        </h3>
        <b-row>
          <b-col md="10">
            <b-form-group
              :label="$t('tavoitteiden-otsikko') + (isEditing && !isOpsPohja ? ' *' : '')"
              required
            >
              <ep-input
                v-model="opintokokonaisuus.opetuksenTavoiteOtsikko"
                :is-editing="isEditing"
                :validation="validation.opintokokonaisuus.opetuksenTavoiteOtsikko"
              />
            </b-form-group>
            <h4 class="pb-2">
              {{ $t('tavoitteiden-kuvaus') }}
            </h4>
            <b-form-group v-if="isEditing || opintokokonaisuus.tavoitteidenKuvaus && !isEditing">
              <EpContent
                v-model="opintokokonaisuus.tavoitteidenKuvaus"
                layout="normal"
                :is-editable="isEditing"
              />
            </b-form-group>
            <EpAlert
              v-if="!opintokokonaisuus.tavoitteidenKuvaus && !isEditing"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"
            />
          </b-col>
        </b-row>
        <b-form-group
          :label="$t('tavoitteet') + (isEditing && !isOpsPohja ? ' *' : '')"
          required
        >
          <div v-if="isEditing">
            <VueDraggable
              v-bind="tavoitteetOptions"
              v-model="opintokokonaisuus.tavoitteet"
              tag="div"
            >
              <b-row
                v-for="(tavoiteItem, index) in opintokokonaisuus.tavoitteet"
                :key="tavoiteItem.id"
                class="pb-2"
              >
                <b-col
                  cols="11"
                  md="10"
                >
                  <VaatimusField
                    ref="koodistoSelect"
                    v-model="opintokokonaisuus.tavoitteet[index]"
                    nimi-key="tavoite"
                    :koodisto="koodisto"
                    :is-editing="isEditing"
                    :validation="validation.opintokokonaisuus.tavoitteet?.$each?.$response.$data[index]?.tavoite"
                    @add="updateTavoiteByIndex($event, index)"
                  />
                </b-col>
                <b-col
                  v-if="isEditing && !tavoiteItem.perusteesta"
                  cols="1"
                >
                  <div
                    class="default-icon clickable mt-2"
                    @click="onRemoveListItem(tavoiteItem, 'tavoitteet')"
                  >
                    <EpMaterialIcon icon-shape="outlined">
                      delete
                    </EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </VueDraggable>
            <EpButton
              v-if="isEditing"
              variant="outline"
              icon="add"
              @click="addTavoite()"
            >
              {{ $t('lisaa-tavoite') }}
            </EpButton>
          </div>
          <div v-else>
            <ul>
              <li
                v-for="tavoiteItem in opintokokonaisuus.tavoitteet"
                :key="tavoiteItem.id"
              >
                {{ $kaanna(tavoiteItem.tavoite) }}
              </li>
            </ul>
          </div>
        </b-form-group>
        <hr>
        <h3 class="py-3">
          {{ $t('keskeiset-sisallot') }}
        </h3>
        <b-row>
          <b-col md="10">
            <b-form-group v-if="isEditing || opintokokonaisuus.keskeisetSisallot && !isEditing">
              <EpContent
                v-model="opintokokonaisuus.keskeisetSisallot"
                layout="normal"
                :is-editable="isEditing"
              />
            </b-form-group>
            <EpAlert
              v-if="!opintokokonaisuus.keskeisetSisallot && !isEditing"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"
            />
          </b-col>
        </b-row>
        <hr>
        <h3 class="pt-3">
          {{ $t('arviointi') }}
        </h3>
        <b-row>
          <b-col
            md="10"
            class="py-3"
          >
            <h4 class="pb-2">
              {{ $t('arvioinnin-kuvaus') }}
            </h4>
            <b-form-group v-if="isEditing || opintokokonaisuus.arvioinninKuvaus && !isEditing">
              <EpContent
                v-model="opintokokonaisuus.arvioinninKuvaus"
                layout="normal"
                :is-editable="isEditing"
              />
            </b-form-group>
            <EpAlert
              v-if="!opintokokonaisuus.arvioinninKuvaus && !isEditing"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"
            />
          </b-col>
        </b-row>
        <b-form-group
          :label="$t('opiskelijan-osaamisen-arvioinnin-kohteet') + (isEditing && !isOpsPohja ? ' *' : '')"
          required
        >
          <div v-if="isEditing">
            <VueDraggable
              v-bind="arvioinnitOptions"
              v-model="opintokokonaisuus.arvioinnit"
              tag="div"
            >
              <b-row
                v-for="(arviointiItem, index) in opintokokonaisuus.arvioinnit"
                :key="arviointiItem.id"
                class="pb-2"
              >
                <b-col md="10">
                  <EpInput
                    v-model="arviointiItem.arviointi"
                    :is-editing="isEditing"
                    :disabled="arviointiItem.perusteesta"
                    :validation="validation.opintokokonaisuus.arvioinnit?.$each?.$response.$data[index]?.arviointi"
                  >
                    <template #left>
                      <div class="order-handle m-2">
                        <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                      </div>
                    </template>
                  </EpInput>
                </b-col>
                <b-col
                  v-if="isEditing && !arviointiItem.perusteesta"
                  cols="1"
                >
                  <div
                    class="default-icon clickable mt-2"
                    @click="onRemoveListItem(arviointiItem, 'arvioinnit')"
                  >
                    <EpMaterialIcon icon-shape="outlined">
                      delete
                    </EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </VueDraggable>

            <div class="d-flex">
              <EpButton
                v-if="isEditing"
                variant="outline"
                icon="add"
                @click="onAddListItem('arvioinnit')"
              >
                {{ $t('lisaa-arvioinnin-kohde') }}
              </EpButton>
              <EpOpintokokonaisuusArviointiImport
                v-if="isEditing && hasPohja"
                :toteutussuunnitelma-id="toteutussuunnitelmaId"
                :koulutustoimija-id="koulutustoimijaId"
                :add-arvioinnit="addPohjanArvioinnit"
              />
            </div>
          </div>
          <div v-else>
            <ul>
              <li
                v-for="arviointiItem in opintokokonaisuus.arvioinnit"
                :key="arviointiItem.id"
              >
                {{ $kaanna(arviointiItem.arviointi) }}
              </li>
            </ul>
          </div>
        </b-form-group>
        <hr>
        <h3 class="pt-3 py-3">
          {{ $t('kansalliset-perustaitojen-osaamismerkit') }}
        </h3>
        <EpButton
          v-if="isEditing && !data.opintokokonaisuus.osaamismerkkiKappale"
          variant="outline"
          icon="add"
          @click="addOsaamismerkkiKappale()"
        >
          {{ $t('lisaa-osaamismerkki-kappale') }}
        </EpButton>

        <EpOsaamismerkkiKappale
          v-if="data.opintokokonaisuus.osaamismerkkiKappale"
          v-model="data.opintokokonaisuus.osaamismerkkiKappale"
          :toteutussuunnitelma-id="toteutussuunnitelmaId"
          :koulutustoimija-id="koulutustoimijaId"
          :is-editing="isEditing"
        />
        <EpAlert
          v-if="!data.opintokokonaisuus.osaamismerkkiKappale && !isEditing"
          :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
          class="pb-3"
        />
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';

import { VueDraggable } from 'vue-draggable-plus';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpLaajuusYksikkoInput from '@shared/components/forms/EpLaajuusYksikkoInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpOpintokokonaisuusArviointiImport from '@/components/EpOpintokokonaisuusArviointiImport/EpOpintokokonaisuusArviointiImport.vue';
import EpOsaamismerkkiKappale from '@/components/EpOsaamismerkkiKappale/EpOsaamismerkkiKappale.vue';

import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { Koodisto } from '@shared/api/eperusteet';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { Murupolku } from '@shared/stores/murupolku';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { $t, $kaanna } from '@shared/utils/globals';
import { nextTick } from 'vue';
import VaatimusField from '@shared/components/EpAmmattitaitovaatimukset/VaatimusField.vue';
import { Kielet } from '@shared/stores/kieli';


enum TyyppiSource {
  PERUSTEESTA = 'perusteesta',
  OMA = 'oma'
}

const props = defineProps<{
  koulutustoimijaId: string;
  toteutussuunnitelmaId: number;
  sisaltoviiteId: number;
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
}>();

const route = useRoute();
const koodistoSelect = ref<InstanceType<typeof VaatimusField>[]>([]);

const editointiStore = ref<EditointiStore | null>(null);

const koodisto = new KoodistoSelectStore({
  koodisto: 'opintokokonaisuustavoitteet',
  async query(query: string, sivu = 0, koodisto) {
    return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
      params: {
        sivu,
        sivukoko: 10,
      },
    })).data as any;
  },
});

const versionumero = computed(() => {
  return _.toNumber(route.query.versionumero);
});

const defaultDragOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    handle: '.order-handle',
    disabled: !editointiStore.value?.isEditing,
    ghostClass: 'dragged',
  };
});

const tavoitteetOptions = computed(() => {
  return {
    ...defaultDragOptions.value,
    group: {
      name: 'tavoitteet',
    },
  };
});

const arvioinnitOptions = computed(() => {
  return {
    ...defaultDragOptions.value,
    group: {
      name: 'arvioinnit',
    },
  };
});

const opintokokonaisuustyyppi = computed(() => {
  return editointiStore.value?.data?.opintokokonaisuus.tyyppi;
});

const tyyppitekstit = computed(() => {
  return {
    [TyyppiSource.OMA]: {
      nimiotsikko: 'opintokokonaisuuden-nimi',
      tavoiteotsikko: 'osaamistavoitteet',
      murupolku: 'opintokokonaisuus',
    },
    [TyyppiSource.PERUSTEESTA]: {
      nimiotsikko: 'osaamiskokonaisuuden-nimi',
      tavoiteotsikko: 'opetuksen-tavoitteet',
      murupolku: 'osaamiskokonaisuus',
    },
  };
});

const tyyppikielistys = computed(() => {
  return tyyppitekstit.value[opintokokonaisuustyyppi.value];
});

const isOpsPohja = computed(() => {
  return props.toteutussuunnitelmaStore.toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
});

const hasPohja = computed(() => {
  return _.get(props.toteutussuunnitelmaStore.toteutussuunnitelma.value, '_pohja');
});

const fetch = () => {
  editointiStore.value = new EditointiStore(
    new OpintokokonaisuusStore(
      props.toteutussuunnitelmaId,
      props.koulutustoimijaId,
      props.sisaltoviiteId,
      versionumero.value,
      props.toteutussuunnitelmaStore.toteutussuunnitelma,
      editointiStore.value! as any));
};

const updateTavoiteByIndex = (val: any, index: number) => {
  const updatedTavoitteet = [...editointiStore.value!.data.opintokokonaisuus.tavoitteet];
  updatedTavoitteet[index] = {
    perusteesta: false,
    tavoite: val.nimi,
    tavoiteKoodi: val.uri,
    koodi: {
      nimi: val.nimi,
    },
  };

  editointiStore.value?.setData({
    ...editointiStore.value?.data,
    opintokokonaisuus: {
      ...editointiStore.value?.data.opintokokonaisuus,
      tavoitteet: [
        ...updatedTavoitteet,
      ],
    },
  });
};

const addTavoite = async () => {
  onAddListItem('tavoitteet', { tavoite: {[Kielet.getSisaltoKieli.value]: null}});
  await nextTick();
  await koodistoSelect.value?.[koodistoSelect.value?.length - 1]?.openDialog();
};

const onAddListItem = async (array: string, values?: any) => {
  editointiStore.value?.setData({
    ...editointiStore.value?.data,
    opintokokonaisuus: {
      ...editointiStore.value?.data.opintokokonaisuus,
      [array]: [
        ..._.get(editointiStore.value?.data.opintokokonaisuus, array),
        {
          perusteesta: false,
          ...(!_.isEmpty(values) && values),
        },
      ],
    },
  });
};

const onRemoveListItem = (poistettavaRivi: { [key: string]: any }, array: string) => {
  editointiStore.value?.setData({
    ...editointiStore.value?.data,
    opintokokonaisuus: {
      ...editointiStore.value?.data.opintokokonaisuus,
      [array]: _.filter(_.get(editointiStore.value?.data.opintokokonaisuus, array), rivi => rivi !== poistettavaRivi),
    },
  });
};

const addOsaamismerkkiKappale = () => {
  editointiStore.value?.setData({
    ...editointiStore.value?.data,
    opintokokonaisuus: {
      ...editointiStore.value?.data.opintokokonaisuus,
      osaamismerkkiKappale: {
        kuvaus: null,
        osaamismerkkiKoodit: [],
      },
    },
  });
};

const addPohjanArvioinnit = (arvioinnit: any[]) => {
  _.forEach(arvioinnit, arviointi => onAddListItem('arvioinnit',
    {
      'arviointi': {
        ...arviointi,
      },
    }));
};

watch(() => props.sisaltoviiteId, () => {
  fetch();
}, { immediate: true });

watch(versionumero, () => {
  fetch();
}, { immediate: true });

watch(opintokokonaisuustyyppi, (val) => {
  if (tyyppikielistys.value) {
    Murupolku.aseta('opintokokonaisuus', $t(tyyppikielistys.value['murupolku']));
  }
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  :deep(fieldset) {
    padding-right: 0;
  }

  :deep(.input-wrapper) {
    flex: 1 1 0;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>

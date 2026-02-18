<template>
  <EpMainView>
    <b-container>
      <EpSteps
        ref="epsteps"
        :steps="steps"
        :initial-step="0"
        :on-save="onSave"
        @cancel="onCancel"
      >
        <template #toteutussuunnitelma>
          <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group
                :label="$t('koulutustoimija')"
                class="mt-4 pt-2"
              >
                <EpMultiSelect
                  :model-value="selectedKoulutustoimijaForSelect"
                  :placeholder="$t('valitse-koulutustoimija')"
                  :is-editing="true"
                  :options="koulutustoimijat"
                  :multiple="false"
                  track-by="id"
                  :searchable="false"
                  @update:model-value="onKoulutustoimijaChange"
                >
                  <template #singleLabel="{ option }">
                    {{ $kaanna(option.nimi) }}
                  </template>
                  <template #option="{ option }">
                    {{ $kaanna(option.nimi) }}
                  </template>
                </EpMultiSelect>
              </b-form-group>

              <b-form-group
                v-if="pohjanValinta"
                class="mt-4 pt-2 "
              >
                <template #label>
                  <div class="d-flex">
                    <span>{{ $t('kayta-pohjana')+' *' }}</span>
                    <div
                      id="infopopup"
                      class="ml-2 default-icon clickable"
                    >
                      <EpMaterialIcon icon-shape="outlined">
                        info
                      </EpMaterialIcon>
                    </div>
                    <b-popover
                      v-if="tyypinRadioButtons"
                      target="infopopup"
                      triggers="hover click blur"
                    >
                      <div
                        v-for="(radiobutton, index) in tyypinRadioButtons"
                        :key="'infopopup'+index"
                        class="mb-3"
                      >
                        <span class="font-weight-bold">{{ $t(radiobutton.text) }}: </span>
                        <span>{{ $t('uusi-opetussuunnitelma-ohje-' + radiobutton.text) }}</span>
                      </div>
                    </b-popover>
                  </div>
                </template>
                <EpRadio
                  v-for="(radiobutton, index) in tyypinRadioButtons"
                  :key="'radiobutton'+index"
                  v-model="pohjanTyyppi"
                  class="p-2 pl-4"
                  :value="radiobutton.value"
                  :disabled="radiobutton.disabled"
                >
                  {{ $t(radiobutton.text) }}
                </EpRadio>
              </b-form-group>

              <template v-if="pohjanTyyppi !== 'pohjaton'">
                <b-form-group
                  v-if="pohjanTyyppi && pohjanTyyppi !== 'uusi'"
                  :label="$t(kaannokset[pohjanTyyppi].pohjaLabel) +' *'"
                >
                  <div v-if="pohjanTyyppi === 'peruste'">
                    <EpMultiSelect
                      v-model="peruste"
                      :placeholder="$t(kaannokset[pohjanTyyppi].pohjaValintaPlaceHolder)"
                      :is-editing="true"
                      :options="perusteet || []"
                      :validation="$v.peruste"
                      @search="onPerusteSearch"
                    >
                      <template #singleLabel="{ option }">
                        {{ $kaanna(option.nimi) }} | {{ option.diaarinumero }}<span v-if="option.voimassaoloAlkaa"> | {{ $t('astuu-voimaan') }}: {{ $sd(option.voimassaoloAlkaa) }}</span>
                      </template>
                      <template #option="{ option }">
                        {{ $kaanna(option.nimi) }} | {{ option.diaarinumero }}<span v-if="option.voimassaoloAlkaa"> | {{ $t('astuu-voimaan') }}: {{ $sd(option.voimassaoloAlkaa) }}</span>
                      </template>
                      <template #noOptions>
                        <EpSpinner v-if="perusteetFetching" />
                        <span v-else>
                          {{ $t('voit-hakea-tutkintoa-nimella') }}
                        </span>
                      </template>
                      <template #noResult>
                        <EpSpinner v-if="perusteetFetching" />
                        <span v-else-if="perusteet && perusteet.length === 0">{{ $t('ei-hakutuloksia') }}</span>
                        <span />
                      </template>
                    </EpMultiSelect>
                  </div>

                  <div v-if="pohjanTyyppi === 'toteutussuunnitelma' || pohjanTyyppi === 'ophPohja' || pohjanTyyppi === 'opsPohja'">
                    <EpMultiSelect
                      v-if="pohjat"
                      v-model="toteutussuunnitelma"
                      :placeholder="$t(kaannokset[pohjanTyyppi].pohjaValintaPlaceHolder)"
                      :is-editing="true"
                      :options="pohjat"
                      :validation="$v.toteutussuunnitelma"
                      :search-identity="nimiSearchIdentity"
                    >
                      <template #singleLabel="{ option }">
                        {{ $kaanna(option.nimi) }}
                      </template>
                      <template #option="{ option }">
                        {{ $kaanna(option.nimi) }}
                      </template>
                    </EpMultiSelect>
                    <EpSpinner v-else />
                  </div>
                </b-form-group>
              </template>

              <b-form-group
                v-if="pohjanTyyppi || !pohjanValinta"
                :label="$t(kaannokset.nimiLabel) +' *'"
              >
                <ep-field
                  v-model="nimi"
                  :is-editing="true"
                  :validation="$v.nimi"
                />
              </b-form-group>

              <div
                v-if="korvaavaPeruste"
                class="korvaavaPeruste"
                v-html="$t('tutkinnolla-korvaava-peruste-selite', {korvaavaPerusteNimi})"
              />

              <EpToggle
                v-if="naytaKopioiPohjanTiedot"
                v-model="kopioiPohjanTiedot"
                checkbox
              >
                {{ $t('kopioi-yhteisen-osuuden-tiedot') }}
              </EpToggle>

              <b-form-group
                v-if="tutkinnonosatValinta"
                :label="$t(kaannokset.tutkinnonosatLabel) +' *'"
              >
                <ep-spinner v-if="!tutkinnonosat" />

                <b-table
                  v-else
                  responsive
                  borderless
                  striped
                  fixed
                  hover
                  :items="tutkinnonosat"
                  :fields="tutkinnonosatFields"
                  :selectable="true"
                  select-mode="single"
                  selected-variant=""
                  @row-selected="onRowSelected"
                >
                  <template #cell(nimi)="{ item }">
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
                    {{ $kaanna(item.nimi) }}
                  </template>
                </b-table>
              </b-form-group>

              <EpJotpaSelect
                v-if="pohjanTyyppi && pohjanTyyppi === 'pohjaton'"
                v-model="jotpa"
                :toteutus="toteutus"
                :is-editing="true"
                as-rows
              />
            </div>
          </div>
        </template>

        <template #luo>
          <span>
            {{ $t(kaannokset.luoLabel) }}
          </span>
        </template>
      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as _ from 'lodash';
import { useVuelidate } from '@vuelidate/core';
import { minLength, required } from '@vuelidate/validators';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSteps from '@shared/components/EpSteps/EpSteps.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpJotpaSelect, { OpsJotpa } from '@/components/EpJotpa/EpJotpaSelect.vue';

import { notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { KoulutustoimijaBaseDto, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum, PerusteDto, Perusteet } from '@shared/api/amosaa';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { OphPohjatStore } from '@/stores/OphPohjatStore';
import { OphOpsPohjatStore } from '@/stores/OphOpsPohjatStore';
import { PohjanTutkinnonosatStore } from '@/stores/PohjanTutkinnonosatStore';
import { OpetussuunnitelmaPohjatStore } from '@/stores/OpetussuunnitelmaPohjatStore';
import { OpetussuunnitelmaLuontiKielistykset } from '@/utils/toteutustypes';
import { createLogger } from '@shared/utils/logger';
import { EperusteetKoulutustyyppiRyhmat, isAmmatillinenKoulutustyyppi, perusteenSuoritustapa, Toteutus } from '@shared/utils/perusteet';
import { KayttajaStore } from '@/stores/kayttaja';
import { $t, $kaanna, $sd, $fail } from '@shared/utils/globals';
import { setItem } from '@shared/utils/localstorage';
import EpRadio from '@shared/components/forms/EpRadio.vue';
import { JaetutOsaPerustePohjatStore } from '@/stores/JaetutOsaPerustePohjatStore';

const props = defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  perusteetStore?: PerusteetStore;
  ophPohjatStore?: OphPohjatStore;
  ophOpsPohjatStore?: OphOpsPohjatStore;
  jaetutOsaPerustePohjatStore?: JaetutOsaPerustePohjatStore;
  pohjanTutkinnonosatStore: PohjanTutkinnonosatStore;
  kayttajaStore: KayttajaStore;
  koulutustoimijaId: number;
  opetussuunnitelmanTyyppi: 'ops' | 'yleinen' | 'yhteinen' | 'pohja' | 'tunnistamisraportti';
  opetussuunnitelmanSuoritustapa?: string;
  opetussuunnitelmaPohjatStore?: OpetussuunnitelmaPohjatStore;
  toteutus: Toteutus;
}>();

const router = useRouter();

const selectedKoulutustoimijaId = ref<number>(props.koulutustoimijaId);
const pohjanTyyppi = ref<'toteutussuunnitelma' | 'peruste' | 'uusi' | 'ophPohja' | 'opsPohja' | 'pohjaton' | null>(null);
const peruste = ref<PerusteDto | null>(null);
const toteutussuunnitelma = ref<OpetussuunnitelmaDto | null>(null);
const nimi = ref<any | null>(null);
const tutkinnonosaKoodit = ref<string[]>([]);
const toteutussuunnitelmaPohjatStoreLocal = ref<OpetussuunnitelmaPohjatStore | null>(null);
const jotpa = ref<OpsJotpa>({ jotpa: false, jotpatyyppi: null });
const korvaavaPeruste = ref<PerusteDto | null>(null);
const kopioiPohjanTiedot = ref(false);
const perusteetFetching = ref(false);

const tyyppi = computed(() => {
  return props.opetussuunnitelmanTyyppi !== 'tunnistamisraportti' ? props.opetussuunnitelmanTyyppi : 'ops';
});

const kielistykset = computed(() => {
  return {
    'ops': OpetussuunnitelmaLuontiKielistykset[props.toteutus],
    'yleinen': {
      stepName: 'uusi-jaettu-osa',
      toteutussuunnitelma: {
        pohjaLabel: 'jaetun-osan-pohja',
        pohjaValintaPlaceHolder: 'valitse-jaettu-osa',
      },
      peruste: {
        pohjaLabel: 'pohja',
        pohjaValintaPlaceHolder: 'valitse-pohja',
      },
      nimiLabel: 'jaetun-osan-nimi',
      luoLabel: 'luo-jaettu-osa',
    },
    'yhteinen': {
      stepName: 'uusi-yhteinen-osa',
      toteutussuunnitelma: {
        pohjaLabel: 'koulutustoimijan-yhteinen-osuus',
        pohjaValintaPlaceHolder: 'valitse-yhteinen-osuus',
      },
      ophPohja: {
        pohjaLabel: 'suunnitelman-pohja',
        pohjaValintaPlaceHolder: 'valitse-pohja',
      },
      nimiLabel: 'yhteisen-osan-nimi',
      luoLabel: 'luo-yhteinen-osa',
    },
    'pohja': {
      stepName: 'uusi-yhteisten-osien-pohja',
      nimiLabel: 'pohjan-nimi',
      luoLabel: 'luo-pohja',
    },
    'tunnistamisraportti': {
      stepName: 'uusi-oppimisympariston-tunnistamisraportti',
      peruste: {
        pohjaLabel: 'pohja',
        pohjaValintaPlaceHolder: 'valitse-pohja',
      },
      toteutussuunnitelma: {
        pohjaLabel: 'pohja',
        pohjaValintaPlaceHolder: 'valitse-tunnistamisraportti',
      },
      nimiLabel: 'oppimisympariston-tunnistamisraportin-nimi',
      luoLabel: 'luo-tunnistamisraportti',
      tutkinnonosatLabel: 'valitse-tutkinnonosat-jotka-tuodaan-pohjasta',
    },
  };
});

const kaannokset = computed(() => {
  return kielistykset.value[props.opetussuunnitelmanTyyppi];
});

const radioButtons = computed(() => {
  return {
    ops: OpetussuunnitelmaLuontiKielistykset[props.toteutus]['radioButtons'],
    yleinen: [
      {
        value: 'toteutussuunnitelma',
        text: 'toista-jaettua-osaa',
      },
      {
        value: 'peruste',
        text: 'luo-uusi',
      },
    ],
    yhteinen: [
      {
        value: 'ophPohja',
        text: 'suunnitelman-pohjaa',
      },
      {
        value: 'toteutussuunnitelma',
        text: 'koulutustoimijan-yhteista-osuutta',
      },
    ],
    tunnistamisraportti: [
      {
        value: 'peruste',
        text: 'perusteprojektia',
      },
      {
        value: 'toteutussuunnitelma',
        text: 'toista-oppimisympariston-tunnistamisraporttia',
      },
    ],
  };
});

const tyypinRadioButtons = computed(() => {
  return radioButtons.value[props.opetussuunnitelmanTyyppi];
});

const koulutustyyppi = computed((): any => {
  return EperusteetKoulutustyyppiRyhmat[props.toteutus][0];
});

const tallennettavaSuoritustapa = computed(() => {
  if (props.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && peruste.value) {
    return perusteenSuoritustapa(props.pohjanTutkinnonosatStore.peruste.value);
  }
  return props.opetussuunnitelmanSuoritustapa;
});

const validator = computed(() => {
  let validation = {
    nimi: {
      ...requiredLokalisoituTeksti(),
    },
  } as any;

  if (pohjanTyyppi.value === 'peruste') {
    validation = {
      ...validation,
      peruste: notNull(),
    };
  }

  if (pohjanTyyppi.value === 'toteutussuunnitelma' || pohjanTyyppi.value === 'ophPohja' || pohjanTyyppi.value === 'opsPohja') {
    validation = {
      ...validation,
      toteutussuunnitelma: notNull(),
    };
  }

  if (props.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && pohjanTyyppi.value === 'peruste') {
    validation = {
      ...validation,
      tutkinnonosaKoodit: {
        'min-length': minLength(1),
        required,
      },
    };
  }

  if (jotpa.value?.jotpa) {
    validation = {
      ...validation,
      jotpa: {
        jotpatyyppi: notNull(),
      },
    };
  }

  return validation;
});

const $v = useVuelidate(validator, { nimi, peruste, toteutussuunnitelma, tutkinnonosaKoodit, jotpa });

const toteutussuunnitelmat = computed(() => {
  if (toteutussuunnitelmaPohjatStoreLocal.value?.opetussuunnitelmat) {
    return _.sortBy(toteutussuunnitelmaPohjatStoreLocal.value.opetussuunnitelmat, ops => $kaanna(ops.nimi!));
  }
  return undefined;
});

const opsPohjat = computed(() => {
  if (props.opetussuunnitelmaPohjatStore?.opetussuunnitelmat.value) {
    return props.opetussuunnitelmaPohjatStore?.opetussuunnitelmat.value;
  }
  return undefined;
});

const ophOpsPohjat = computed(() => {
  return props.ophOpsPohjatStore?.opsPohjat.value;
});

const ophPohjat = computed(() => {
  return props.ophPohjatStore?.pohjat.value || undefined;
});

const pohjat = computed(() => {
  if (pohjanTyyppi.value === 'toteutussuunnitelma') {
    return toteutussuunnitelmat.value;
  }

  if (pohjanTyyppi.value === 'ophPohja') {
    return ophPohjat.value;
  }

  if (pohjanTyyppi.value === 'opsPohja') {
    return _.sortBy(
      _.uniqBy([
        ...(opsPohjat.value ? opsPohjat.value : []),
        ...(ophOpsPohjat.value ? ophOpsPohjat.value : []),
      ], ops => ops.id),
      ops => $kaanna(ops.nimi!));
  }

  return undefined;
});

const perusteet = computed(() => {
  if (props.perusteetStore) {
    if (props.perusteetStore.perusteetKevyt.value) {
      return _.sortBy(props.perusteetStore.perusteetKevyt.value, [(perusteItem: any) => {
        return $kaanna(perusteItem.nimi);
      }]);
    }
    return undefined;
  }

  if (props.jaetutOsaPerustePohjatStore && props.jaetutOsaPerustePohjatStore.jaetutOsatPohjat.value) {
    return _.sortBy(props.jaetutOsaPerustePohjatStore.jaetutOsatPohjat.value, [(perusteItem: any) => {
      return $kaanna(perusteItem.nimi);
    }]);
  }

  return undefined;
});

const koulutustoimijat = computed(() => {
  const kt = props.kayttajaStore.koulutustoimijat.value || [];
  return _.sortBy(kt, k => $kaanna(k.nimi!));
});

const selectedKoulutustoimijaForSelect = computed(() =>
  _.find(koulutustoimijat.value, k => _.toString(k.id) === _.toString(selectedKoulutustoimijaId.value)) ?? null,
);

const pohjanValinta = computed(() => {
  return props.opetussuunnitelmanTyyppi !== 'pohja';
});

const tutkinnonosatValinta = computed(() => {
  return props.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && (peruste.value !== null);
});

const tutkinnonosat = computed(() => {
  if (!props.pohjanTutkinnonosatStore.tutkinnonosat.value) {
    return props.pohjanTutkinnonosatStore.tutkinnonosat.value;
  }

  return _.map(props.pohjanTutkinnonosatStore.tutkinnonosat.value, tutkinnonosa => {
    return {
      ...tutkinnonosa,
      selected: _.includes(tutkinnonosaKoodit.value, tutkinnonosa.koodi),
    };
  });
});

const tutkinnonosatFields = computed(() => {
  return [{
    key: 'nimi',
    label: $t('nimi'),
  }, {
    key: 'laajuus',
    label: $t('laajuus'),
    thStyle: { width: '10rem' },
  }];
});

const korvaavaPerusteNimi = computed(() => {
  if (korvaavaPeruste.value) {
    return `${$kaanna(korvaavaPeruste.value!.nimi!)} (${korvaavaPeruste.value!.diaarinumero}, ${$sd(korvaavaPeruste.value!.voimassaoloAlkaa!)} - ${(korvaavaPeruste.value!.voimassaoloLoppuu ? $sd(korvaavaPeruste.value!.voimassaoloLoppuu) : '')})`;
  }

  return '';
});

const ophPohjienIdt = computed(() => {
  return _.map(props.ophPohjatStore?.pohjat.value, 'id');
});

const naytaKopioiPohjanTiedot = computed(() => {
  return props.opetussuunnitelmanTyyppi === 'yhteinen'
    && !!toteutussuunnitelma.value
    && _.includes(ophPohjienIdt.value, _.toNumber(_.get(toteutussuunnitelma.value, '_pohja')))
    && toteutussuunnitelma.value.tyyppi !== _.toLower(OpetussuunnitelmaDtoTyyppiEnum.POHJA);
});

const steps = computed(() => {
  return [{
    key: 'toteutussuunnitelma',
    name: $t(kaannokset.value.stepName),
    isValid() {
      return !$v.value.$invalid;
    },
  }];
});

const nimiSearchIdentity = (tietue: any) => {
  return _.toLower($kaanna(tietue.nimi));
};

const onPerusteSearch = _.debounce(async (query: string) => {
  if (props.perusteetStore && query && query.length > 2) {
    perusteetFetching.value = true;
    await props.perusteetStore.fetchJulkaistutPerusteet(query);
    perusteetFetching.value = false;
  }
}, 500);

const onSave = async () => {
  try {
    const luotu = await props.toteutussuunnitelmaStore.create(_.toString(selectedKoulutustoimijaId.value), {
      perusteId: peruste.value ? peruste.value.id : undefined,
      perusteDiaarinumero: peruste.value ? peruste.value.diaarinumero : undefined,
      opsId: toteutussuunnitelma.value?.id,
      tyyppi: tyyppi.value as any,
      suoritustapa: tallennettavaSuoritustapa.value,
      nimi: nimi.value,
      tutkinnonOsaKoodiIncludes: tutkinnonosaKoodit.value,
      koulutustyyppi: peruste.value ? undefined : koulutustyyppi.value,
      jotpatyyppi: jotpa.value ? jotpa.value.jotpatyyppi as any : null,
      kopioiPohjanTiedot: kopioiPohjanTiedot.value,
    } as any);

    router.push({
      name: 'toteutussuunnitelma',
      params: {
        toteutussuunnitelmaId: _.toString(luotu.id),
      },
    });
  }
  catch (e) {
    createLogger('RouteToteutussuunnitelmaLuonti').error(e);
    $fail($t('toteutussuunnitelman-luonti-virhe'));
  }
};

const onCancel = () => {
  history.back();
};

const onRowSelected = (item: any) => {
  if (!_.isEmpty(item)) {
    if (_.includes(tutkinnonosaKoodit.value, item[0].koodi)) {
      tutkinnonosaKoodit.value = _.filter(tutkinnonosaKoodit.value, koodi => koodi !== item[0].koodi);
    }
    else {
      tutkinnonosaKoodit.value.push(item[0].koodi);
    }
  }
};

function fetchKoulutustoimijaPohjat() {
  if (toteutussuunnitelmaPohjatStoreLocal.value) {
    toteutussuunnitelmaPohjatStoreLocal.value.fetch(selectedKoulutustoimijaId.value, props.toteutus, ['luonnos', 'valmis', 'julkaistu'], tyyppi.value);
  }
  if (props.opetussuunnitelmaPohjatStore) {
    props.opetussuunnitelmaPohjatStore.fetch(selectedKoulutustoimijaId.value, props.toteutus, ['valmis', 'julkaistu'], 'opsPohja');
  }
}

onMounted(async () => {
  toteutussuunnitelmaPohjatStoreLocal.value = new OpetussuunnitelmaPohjatStore();
  fetchKoulutustoimijaPohjat();

  if (props.perusteetStore && props.toteutus !== Toteutus.AMMATILLINEN) {
    perusteetFetching.value = true;
    await props.perusteetStore.fetchJulkaistutPerusteet();
    perusteetFetching.value = false;
  }

  if (props.ophPohjatStore) {
    await props.ophPohjatStore.fetch();
  }

  if (props.jaetutOsaPerustePohjatStore) {
    perusteetFetching.value = true;
    await props.jaetutOsaPerustePohjatStore.fetch();
    perusteetFetching.value = false;
  }

  if (props.ophOpsPohjatStore) {
    await props.ophOpsPohjatStore.fetch(EperusteetKoulutustyyppiRyhmat[props.toteutus]);
  }
});

watch(() => props.koulutustoimijaId, (newVal) => {
  selectedKoulutustoimijaId.value = _.toNumber(newVal);
}, { immediate: true });

async function onKoulutustoimijaChange(koulutustoimija: KoulutustoimijaBaseDto | null) {
  if (koulutustoimija) {
    selectedKoulutustoimijaId.value = _.toNumber(koulutustoimija.id);
    const current = router.currentRoute.value as any;
    const next = {
      ...current,
      params: {
        ...current.params,
        koulutustoimijaId: _.toString(koulutustoimija.id),
      },
    };
    try {
      await router.push(next);
      setItem('koulutustoimija', koulutustoimija.id);
    }
    catch (err) {
      // Silently ignore router push errors
    }
  }
}

watch(selectedKoulutustoimijaId, () => {
  fetchKoulutustoimijaPohjat();
  peruste.value = null;
  toteutussuunnitelma.value = null;
  korvaavaPeruste.value = null;
});

watch(pohjanTyyppi, () => {
  peruste.value = null;
  toteutussuunnitelma.value = null;
  korvaavaPeruste.value = null;
});

watch(peruste, async () => {
  tutkinnonosaKoodit.value = [];

  if (props.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && peruste.value) {
    await props.pohjanTutkinnonosatStore.fetchPerusteesta(peruste.value.id);
  }
});

watch(toteutussuunnitelma, async () => {
  tutkinnonosaKoodit.value = [];

  if (toteutussuunnitelma.value && isAmmatillinenKoulutustyyppi(toteutussuunnitelma.value.peruste!.koulutustyyppi)) {
    korvaavaPeruste.value = (await Perusteet.getKoulutuskoodillaKorvaavaPeruste(toteutussuunnitelma.value!.id!, _.toString(selectedKoulutustoimijaId.value))).data;
  }
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.tieto {
  padding: 20px 20px 20px 0;

  .nimi {
    font-weight: 600;
  }
}

.checked {
  color: $paletti-blue;
}

.korvaavaPeruste {
  border-radius: 10px;
  border: 1px solid $blue-lighten-3;
  padding: 12px;
  margin-right: 10px;
  background-color: $blue-lighten-4;
}

</style>

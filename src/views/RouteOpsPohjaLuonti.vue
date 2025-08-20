<template>
  <EpMainView>
    <b-container>
      <EpSteps
        ref="epstepsRef"
        :steps="steps"
        :initial-step="0"
        :on-save="onSave"
        @cancel="onCancel"
      >
        <template #pohja>
          <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group :label="$t(kielistykset['nimi']) +' *'">
                <ep-field
                  v-model="nimi"
                  :is-editing="true"
                  :validation="$v.nimi"
                />
              </b-form-group>
            </div>
          </div>

          <div
            v-if="perusteValinta"
            class="row"
          >
            <div class="col-sm-10 mb-4">
              <b-form-group :label="$t('peruste') +' *'">
                <EpMultiSelect
                  v-if="perusteet"
                  v-model="peruste"
                  :is-editing="true"
                  :options="perusteet"
                  :validation="$v.peruste"
                  :search-identity="nimiSearchIdentity"
                >
                  <template #singleLabel="{ option }">
                    {{ $kaanna(option.nimi) }} ({{ option.diaarinumero }}<span v-if="option.voimassaoloAlkaa">, {{ $sd(option.voimassaoloAlkaa) }}</span>)
                  </template>
                  <template #option="{ option }">
                    {{ $kaanna(option.nimi) }} ({{ option.diaarinumero }}<span v-if="option.voimassaoloAlkaa">, {{ $sd(option.voimassaoloAlkaa) }}</span>)
                  </template>
                </EpMultiSelect>
                <EpSpinner v-else />
              </b-form-group>
            </div>
          </div>
        </template>

        <template #luo>
          <span>
            {{ $t('luo-pohja') }}
          </span>
        </template>
      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import * as _ from 'lodash';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSteps, { Step } from '@shared/components/EpSteps/EpSteps.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaLuontiDtoTyyppiEnum, PerusteDto } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';
import { notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import { OpetussuunnitelmaPohjaLuontiStepSetups } from '@/utils/toteutustypes';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { Toteutus } from '@shared/utils/perusteet';
import { $t, $fail, $kaanna, $sd } from '@shared/utils/globals';

const props = withDefaults(defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  perusteetStore?: PerusteetStore;
  koulutustoimijaId: string | number;
  toteutus: Toteutus;
}>(), {
  perusteetStore: undefined,
});

const router = useRouter();

const epstepsRef = useTemplateRef('epstepsRef');

const nimi = ref<any | null>(null);
const peruste = ref<PerusteDto | null>(null);

const kielistykset = computed(() => {
  return OpetussuunnitelmaPohjaLuontiStepSetups[props.toteutus];
});

const perusteValinta = computed(() => {
  return OpetussuunnitelmaPohjaLuontiStepSetups[props.toteutus]['perustevalinta'];
});

const perusteet = computed(() => {
  if (props.perusteetStore && props.perusteetStore.perusteetKevyt.value) {
    return _.sortBy(props.perusteetStore.perusteetKevyt.value, [(peruste: any) => {
      return $kaanna(peruste.nimi);
    }]);
  }

  return undefined;
});

const validationRules = computed(() => {
  return {
    nimi: {
      ...requiredLokalisoituTeksti(),
    },
    ...(perusteValinta.value && { peruste: notNull() }),
  };
});

const $v = useVuelidate(validationRules, { nimi, peruste });

const steps = computed(() => {
  return [{
    key: 'pohja',
    name: $t(kielistykset.value['stepName']),
    isValid() {
      return !$v.value.$invalid;
    },
  }];
});

const nimiSearchIdentity = (tietue: any) => {
  return _.toLower($kaanna(tietue.nimi));
};

const onSave = async () => {
  try {
    const luotu = await props.toteutussuunnitelmaStore.create(_.toString(props.koulutustoimijaId), {
      tyyppi: OpetussuunnitelmaLuontiDtoTyyppiEnum.OPSPOHJA,
      suoritustapa: 'reformi',
      koulutustyyppi: OpetussuunnitelmaPohjaLuontiStepSetups[props.toteutus]['koulutustyyppi'] as any,
      nimi: nimi.value,
      perusteId: peruste.value?.id,
    });

    router.push({
      name: 'toteutussuunnitelma',
      params: {
        toteutussuunnitelmaId: _.toString(luotu.id),
      },
    });
  }
  catch (e) {
    createLogger('RouteToteutussuunnitelmaLuonti').error(e);
    $fail($t('virhe-palvelu-virhe') as string);
  }
};

const onCancel = () => {
  history.back();
};

onMounted(async () => {
  if (props.perusteetStore && perusteValinta.value) {
    props.perusteetStore.fetchJulkaistutPerusteet();
  }
});
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.tieto {
  padding: 20px 20px 20px 0px;

  .nimi {
    font-weight: 600;
  }
}

.checked {
  color: $paletti-blue;
}

</style>

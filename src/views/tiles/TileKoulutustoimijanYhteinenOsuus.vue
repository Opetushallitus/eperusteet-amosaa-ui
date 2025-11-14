<template>
  <EpHomeTile
    icon="article"
    :route="{ name: 'yhteinen' }"
    :header-bg-color="{ top: '#009700', bottom: '#007500' }"
  >
    <template #header>
      <span>{{ $t('tile-koulutustoimijan-yhteinen-osuus') }}</span>
    </template>
    <template #content>
      <div v-if="etusivu">
        <table class="count-table">
          <tbody>
            <tr>
              <td width="50%">
                <div class="bignumber">
                  {{ etusivu.ktYhteinenOsuusKeskeneraiset }}
                </div>
                <div class="description">
                  {{ $t('keskeneraista') }}
                </div>
              </td>
              <td
                class="spacer"
                width="50%"
              >
                <div class="bignumber">
                  {{ etusivu.ktYhteinenOsuusJulkaistut }}
                </div>
                <div class="description">
                  {{ $t('julkaistua') }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ep-spinner v-else />
    </template>
  </EpHomeTile>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import EpHomeTile from '@shared/components/EpHomeTiles/EpHomeTile.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';

import { EperusteetKoulutustyyppiRyhmat, Toteutus } from '@shared/utils/perusteet';
import { KayttajaStore } from '@/stores/kayttaja';
import { $t } from '@shared/utils/globals';

const props = defineProps<{
  kayttajaStore: KayttajaStore;
  koulutustoimijaId: string;
  toteutus: Toteutus;
}>();

const fetch = async () => {
  await props.kayttajaStore.fetchEtusivu(props.koulutustoimijaId, EperusteetKoulutustyyppiRyhmat[props.toteutus]);
};

const etusivu = computed(() => {
  return props.kayttajaStore?.etusivu?.value || null;
});

onMounted(async () => {
  await fetch();
});

watch(() => props.koulutustoimijaId, async () => {
  await fetch();
});
</script>

<style scoped lang="scss">
.ops {
  .ops-container {
    align-items: center;
  }
  .data {
    text-align: left;
    .name {
      font-weight: bold;
    }
    .tiedot {
      .description {
        font-size: 70%;
      }
      .muokattu {
        font-size: 70%;
      }
    }
  }
}
.count-table {
  width: 100%;
  .spacer {
    border-left: 1px solid #DADADA;;
  }
  td {
    padding: 8px;
    .bignumber {
      color: #28344F;
      font-size: 32px;
    }
    .description {
    }
  }
}
</style>

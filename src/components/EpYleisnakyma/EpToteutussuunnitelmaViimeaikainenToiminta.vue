<template>
  <div class="content text-left">
    <h3>{{ $t('viimeaikainen-toiminta') }}</h3>

    <ep-spinner v-if="!muokkaustiedot || !peruste" />

    <div
      v-else
      class="container text-center"
    >
      <div
        v-for="(muokkaustieto, index) in muokkaustiedotRouted"
        :key="index"
        class="row muokkaustieto"
      >
        <div class="col col-auto ikoni-col center-block">
          <div class="ikoni d-inline-block">
            <EpMaterialIcon :class="muokkaustieto.iconClass">
              {{ muokkaustieto.icon }}
            </EpMaterialIcon>
          </div>
          <div
            v-if="index != muokkaustiedotRouted.length - 1"
            class="aikajana"
          >
&nbsp;
          </div>
        </div>

        <div class="col router-col text-left">
          <div v-if="muokkaustieto.poistettu">
            <div
              class="router-box"
              :class="{ 'router-box-poistettu': muokkaustieto.poistettu }"
            >
              <div class="row">
                <div class="col nimi">
                  {{ muokkaustieto.kayttajaNimi }}
                </div>
                <div class="col aika text-right">
                  {{ $ago(muokkaustieto.luotu) }}
                </div>
              </div>
              <div class="kohde">
                {{ muokkaustieto.tapahtumateksti }}
              </div>
            </div>
          </div>
          <router-link
            v-else
            :to="muokkaustieto.route"
          >
            <div
              class="router-box"
              :class="{ 'router-box-poistettu': muokkaustieto.poistettu }"
            >
              <div class="row">
                <div class="col nimi">
                  {{ muokkaustieto.kayttajaNimi }}
                </div>
                <div class="col aika text-right">
                  {{ $ago(muokkaustieto.luotu) }}
                </div>
              </div>
              <div class="kohde">
                {{ muokkaustieto.tapahtumateksti }}
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <span
        v-if="muokkaustiedot && muokkaustiedot.length === 0"
        class="tyhja"
      >{{ $t('viimeaikainen-toiminta-tyhja') }}</span>

      <div v-else>
        <ep-button
          v-if="!lisahaku && muokkaustiedotRouted.length % hakuLukumaara == 0 && muokkaustiedot && (!viimeinenHaku || viimeinenHaku.length > 0)"
          variant="link"
          @click="haeLisaa"
        >
          {{ $t('nayta-lisaa') }}
        </ep-button>

        <ep-spinner v-if="lisahaku" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { MuokkaustietoStore } from '@/stores/MuokkaustietoStore';
import { muokkaustietoRoute, muokkaustietoIcon } from '@shared/utils/tapahtuma';
import { OpetussuunnitelmaMuokkaustietoDto, OpetussuunnitelmaMuokkaustietoDtoTapahtumaEnum } from '@shared/api/amosaa';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { $t, $ago, $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  muokkaustietoStore: MuokkaustietoStore;
}>();

const lisahaku = ref(false);

const muokkaustiedot = computed(() => {
  return props.muokkaustietoStore.muokkaustiedot.value;
});

const viimeinenHaku = computed(() => {
  return props.muokkaustietoStore.viimeinenHaku.value;
});

const hakuLukumaara = computed(() => {
  return props.muokkaustietoStore.hakuLukumaara.value;
});

const haeLisaa = async () => {
  lisahaku.value = true;
  await props.muokkaustietoStore.update();
  lisahaku.value = false;
};

const tapahtumateksti = (muokkaustieto: OpetussuunnitelmaMuokkaustietoDto) => {
  if (muokkaustieto.lisatieto) {
    return $t(muokkaustieto.lisatieto);
  }

  return $t(tapahtumakaannos(muokkaustieto)) + ': ' + tapahtumakohde(muokkaustieto);
};

const tapahtumakaannos = (muokkaustieto: OpetussuunnitelmaMuokkaustietoDto) => {
  if (muokkaustieto.tapahtuma === _.lowerCase(OpetussuunnitelmaMuokkaustietoDtoTapahtumaEnum.LUONTI)) {
    return 'tapahtuma-' + muokkaustieto.tapahtuma + '-' + muokkaustieto.kohde;
  }

  return 'tapahtuma-' + muokkaustieto.tapahtuma;
};

const tapahtumakohde = (muokkaustieto: OpetussuunnitelmaMuokkaustietoDto) => {
  return $kaanna(muokkaustieto.nimi);
};

const muokkaustietoIconClass = (muokkaustieto: OpetussuunnitelmaMuokkaustietoDto) => {
  return muokkaustieto.tapahtuma;
};

const muokkaustiedotRouted = computed(() => {
  return _.chain(muokkaustiedot.value)
    .map((muokkaustieto: OpetussuunnitelmaMuokkaustietoDto) => {
      return {
        ...muokkaustieto,
        route: muokkaustietoRoute(muokkaustieto.kohdeId, muokkaustieto.kohde, muokkaustieto.tapahtuma),
        icon: muokkaustietoIcon(muokkaustieto.kohde, muokkaustieto.tapahtuma),
        iconClass: muokkaustietoIconClass(muokkaustieto),
        kayttajaNimi: muokkaustieto.kayttajanTieto ? parsiEsitysnimi(muokkaustieto.kayttajanTieto) : muokkaustieto.muokkaaja,
        tapahtumateksti: tapahtumateksti(muokkaustieto),
      };
    })
    .sortBy('luotu')
    .reverse()
    .value();
});
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .container {
    margin-top: 40px;
    margin-bottom: 20px;
    min-width: 450px;

    .muokkaustieto {
      margin-top: 0;
      margin-bottom: 10px;

      .ikoni-col {
        padding-top: 0;

        .ikoni {
          width:45px;
          border-radius: 30px;
          padding: 10px;
          box-shadow: 1px 1px 5px 0 rgba(0,26,88,0.1);
          z-index: 15;
          background-color: #fff;
          color: $black;

          .luonti {
            color: $green-lighten-2;
          }

          .paivitys {
            color: $pink;
          }

          .kommentointi {
            color: $blue;
          }

          .luokaton {
            color: $gray;
          }

          .poisto {
            color: $gray;
          }

          .palautus {
            color: $blue-darken-1;
          }

        }

        .aikajana {
          z-index: 10;
          height: 100%;
          background: linear-gradient($gray-lighten-2, $gray-lighten-2) no-repeat center/2px 100%;
        }

      }

      .router-col {
        padding: 0;
        width: 0;

        .router-box {
          line-height: 1;
          padding: 10px;
          border-radius: 0.5rem;
          box-shadow: 1px 1px 5px 0 rgba(0,26,88,0.1);
          color: $black;

          .nimi {
            font-weight: bold;
            padding-bottom: 10px;
          }

          .aika {
            color: $gray-lighten-2;
          }

          .kohde {
            padding-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

        }
      }
    }

  }

  .tyhja {
    color: $gray-lighten-2;
    font-style: italic;
  }
</style>

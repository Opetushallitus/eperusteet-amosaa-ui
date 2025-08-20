<template>
  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
      <h2 class="otsikko">
        {{ $t('luo-pdf') }}
      </h2>
    </div>
    <div class="sisalto mb-4">
      <h3>{{ $t('luo-ja-lataa-pdf') }}</h3>
      <p>{{ $t(selite) }}</p>
      <ep-pdf-luonti
        :store="dokumenttiStore"
        :pdfnimi="$kaanna(opetussuunnitelmanimi)"
      />

      <h3 class="mt-5">
        {{ $t('lisaasetukset') }}
      </h3>

      <div
        v-for="(kuva, index) in kuvat"
        :key="'kuva'+index"
        class="row"
      >
        <div class="col kuvalataus">
          <EpPdfKuvalataus
            :tyyppi="kuva.tyyppi"
            :kuva-url="kuva.url"
            @saveImage="saveImage"
            @removeImage="removeImage"
          />
        </div>
        <div class="col-4 text-center sijaintikuva">
          <div class="sijainti-topic">
            <span v-if="kuva.first">{{ $t('sijainti') }}</span>
          </div>
          <ep-public-image :image="kuva.image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import _ from 'lodash';

import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpPdfLuonti from '@shared/components/EpPdfLuonti/EpPdfLuonti.vue';
import EpPdfKuvalataus from '@shared/components/EpTiedosto/EpPdfKuvalataus.vue';
import EpPublicImage from '@shared/components/EpPublicImage/EpPublicImage.vue';

import { DokumenttiStore, Kuvatyyppi } from '@/stores/DokumenttiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Toteutus } from '@shared/utils/perusteet';
import { PdfLuontiSelite } from '@/utils/toteutustypes';
import { $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  toteutussuunnitelmaStore: ToteutussuunnitelmaStore;
  toteutus: Toteutus;
}>();

const dokumenttiStore = ref<DokumenttiStore | null>(null);

const opetussuunnitelmanimi = computed(() => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
    return props.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi;
  }

  return undefined;
});

const dokumenttiDto = computed(() => {
  if (dokumenttiStore.value) {
    return dokumenttiStore.value.dokumentti;
  }

  return undefined;
});

const kuvat = computed(() => {
  if (dokumenttiStore.value) {
    return _.map(dokumenttiStore.value.kuvat, (kuvatyyppi: Kuvatyyppi, index: number) => {
      return {
        ...kuvatyyppi,
        first: index === 0,
      };
    });
  }

  return undefined;
});

const kieli = computed(() => {
  return Kielet.getSisaltoKieli.value;
});

const selite = computed(() => {
  return PdfLuontiSelite[props.toteutus];
});

const saveImage = (file: any, tyyppi: any) => {
  dokumenttiStore.value!.saveImage(file, tyyppi);
};

const removeImage = (tyyppi: any) => {
  dokumenttiStore.value!.removeImage(tyyppi);
};

watch(opetussuunnitelmanimi, async () => {
  if (props.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
    dokumenttiStore.value = await DokumenttiStore.create(props.toteutussuunnitelmaStore.toteutussuunnitelma.value as any);
    await dokumenttiStore.value?.init();
  }
}, { immediate: true });

watch(kieli, async () => {
  await dokumenttiStore.value?.init();
});

</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.dokumentit {
  margin-top: 4px;

  .ylapaneeli {
    border-bottom: 1px solid #eee;
    font-weight: 600;
    padding: 5px 15px 5px 15px;
    height: 50px;

    .otsikko {
      margin-bottom: 0;
    }
  }

  .sisalto {
    margin: 35px 50px 20px 15px;

    @media(max-width: 575px) {

      .sijaintikuva {
        display:none;
      }
    }

    .kuvalataus {
      min-width: 300px;
    }

    .sijainti-topic {
      margin-bottom: 10px;
      font-weight: 600;
    }
  }
}

</style>

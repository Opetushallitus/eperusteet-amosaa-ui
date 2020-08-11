<template>

  <div class="dokumentit">
    <div class="ylapaneeli d-flex align-items-center">
        <h2 class="otsikko">{{ $t('luo-pdf') }}</h2>
    </div>
    <div class="sisalto">
      <div class="mb-4">
        <h3>{{ $t('luo-ja-lataa-pdf') }}</h3>
        <p>{{ $t('luo-pdf-selite-amosaa')}}</p>
        <ep-pdf-luonti :store="dokumenttiStore" :pdfnimi="$kaanna(opetussuunnitelmanimi)"/>

        <h3 class="mt-5">{{$t('lisaasetukset')}}</h3>

        <div class="row" v-for="(kuva, index) in kuvat" :key="'kuva'+index">
          <div class="col kuvalataus">
            <ep-fileupload :tyyppi="kuva.tyyppi" :kuvaUrl="kuva.url" @saveImage="saveImage" @removeImage="removeImage"></ep-fileupload>
          </div>
          <div class="col-4 text-center sijaintikuva">
            <div class="sijainti-topic"><span v-if="kuva.first">{{$t('sijainti')}}</span></div>
            <ep-public-image :image="kuva.image" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { DokumenttiStore, Kuvatyyppi } from '@/stores/DokumenttiStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import EpPdfLuonti from '@shared/components/EpPdfLuonti/EpPdfLuonti.vue';
import EpFileupload from '@shared/components/EpFileupload/EpFileupload.vue';
import EpPublicImage from '@shared/components/EpPublicImage/EpPublicImage.vue';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpSpinner,
    EpPdfLuonti,
    EpFileupload,
    EpPublicImage,
  },
})
export default class RoutePdfLuonti extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  private dokumenttiStore: DokumenttiStore | null = null;

  @Watch('opetussuunnitelmanimi', { immediate: true })
  async opetussuunnitelmaChanged() {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
      this.dokumenttiStore = await DokumenttiStore.create(this.toteutussuunnitelmaStore.toteutussuunnitelma.value as any);
    }
  }

  get opetussuunnitelmanimi() {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelma.value) {
      return this.toteutussuunnitelmaStore.toteutussuunnitelma.value.nimi;
    }
  }

  get dokumenttiDto() {
    if (this.dokumenttiStore) {
      return this.dokumenttiStore.dokumentti.value;
    }
  }

  get kuvat() {
    if (this.dokumenttiStore) {
      return _.map(this.dokumenttiStore.kuvat.value, (kuvatyyppi: Kuvatyyppi, index) => {
        return {
          ...kuvatyyppi,
          first: index === 0,
        };
      });
    }
  }

  get kieli() {
    return Kielet.getSisaltoKieli.value;
  }

  @Watch('kieli')
  async kieliChanged() {
    await this.dokumenttiStore?.init();
  }

  saveImage(file, tyyppi) {
    this.dokumenttiStore!.saveImage(file, tyyppi);
  }

  removeImage(tyyppi) {
    this.dokumenttiStore!.removeImage(tyyppi);
  }
}

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
      margin-bottom: 40px;
      font-weight: 600;
    }

  }

}

</style>

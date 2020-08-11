import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import { Dokumentit, OpetussuunnitelmaDto, DokumenttiDto, DokumenttiDtoTilaEnum, baseURL, DokumentitParams } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { IDokumenttiStore } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export interface Kuvatyyppi {
  tyyppi: string;
  image: string;
  url: string | null;
}

export class DokumenttiStore implements IDokumenttiStore {
  private state = reactive({
    dokumentti: null as DokumenttiDto | null,
    polling: null as any | null,
    dokumenttiHref: null as string | null,
    kuvat: null as Kuvatyyppi[] | null,
  });

  private pollingFrequency = 1000;

  public static async create(opetussuunnitelma: OpetussuunnitelmaDto) {
    const result = new DokumenttiStore(opetussuunnitelma);
    result.state.kuvat = [{
      tyyppi: 'kansikuva',
      image: 'pdfkuva_etusivu.svg',
      url: null,
    }, {
      tyyppi: 'ylatunniste',
      image: 'pdfkuva_header.svg',
      url: null,
    }, {
      tyyppi: 'alatunniste',
      image: 'pdfkuva_alatunniste.svg',
      url: null,
    }];
    await result.init();
    return result;
  }

  constructor(private opetussuunnitelma: OpetussuunnitelmaDto) {
  }

  public readonly dokumentti = computed(() => this.state.dokumentti);
  public readonly polling = computed(() => this.state.polling);
  public readonly dokumenttiHref = computed(() => this.state.dokumenttiHref);
  public readonly kuvat = computed(() => this.state.kuvat);

  async init() {
    this.state.dokumentti = (await Dokumentit.queryDokumenttiTila(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;

    this.generateKuvaHref();
    this.setHref();
  }

  async getDokumenttiTila() {
    if (this.state.dokumentti?.id) {
      this.state.dokumentti = (await Dokumentit.queryDokumenttiTila(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;

      if (this.state.dokumentti) {
        if (_.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)
          || _.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
          clearInterval(this.state.polling);
          this.state.polling = null;

          this.setHref();
        }
      }
    }
  }

  setHref() {
    if (this.state.dokumentti) {
      if (_.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS) && this.state.dokumentti.id) {
        this.state.dokumenttiHref = baseURL + DokumentitParams.getPdfDokumentti(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!)).url;
      }
      else {
        this.state.dokumenttiHref = null;
      }
    }
  }

  generateKuvaHref() {
    this.state.kuvat = _.map(this.kuvat.value, (kuva: Kuvatyyppi) => {
      let url;
      if (_.get(this.state.dokumentti, kuva.tyyppi)) {
        url = baseURL + DokumentitParams.getDokumenttiImage(this.opetussuunnitelma.id!, kuva.tyyppi, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!)).url;
      }

      return {
        ...kuva,
        url,
      };
    });
  }

  async luoPdf() {
    clearInterval(this.state.polling);
    this.state.polling = true;

    this.state.dokumentti = (await Dokumentit.createDokumentti(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;

    setTimeout(() => {
      this.state.polling = setInterval(() => {
        this.getDokumenttiTila();
      }, this.pollingFrequency);
    }, this.pollingFrequency);
  }

  async saveImage(file, tyyppi: string) {
    this.state.dokumentti = (await Dokumentit.addDokumenttiImage(this.opetussuunnitelma.id!, tyyppi, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!), file)).data;
    this.generateKuvaHref();
  }

  async removeImage(tyyppi: string) {
    await Dokumentit.deleteDokumenttiImage(this.opetussuunnitelma.id!, tyyppi, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!));
    await this.init();
  }
}

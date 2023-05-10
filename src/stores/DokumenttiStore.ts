import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import * as _ from 'lodash';
import {
  Dokumentit,
  OpetussuunnitelmaDto,
  DokumenttiDto,
  DokumenttiKuvaDto,
  DokumenttiDtoTilaEnum,
  baseURL,
  DokumentitParams,
  JulkinenApi, JulkinenApiParams,
} from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import { IDokumenttiStore } from '@shared/tyypit';
import { Debounced } from '@shared/utils/delay';

Vue.use(VueCompositionApi);

export interface Kuvatyyppi {
  tyyppi: string;
  image: string;
  url: string | null;
}

export class DokumenttiStore implements IDokumenttiStore {
  private state = reactive({
    dokumentti: null as DokumenttiDto | null,
    dokumenttiJulkaisu: null as DokumenttiDto | null,
    dokumenttiKuva: null as DokumenttiKuvaDto | null,
    polling: null as any | null,
    dokumenttiHref: null as string | null,
    dokumenttiJulkaisuHref: null as string | null,
    kuvat: null as Kuvatyyppi[] | null,
  });

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
    return result;
  }

  constructor(private opetussuunnitelma: OpetussuunnitelmaDto) {
  }

  public readonly dokumentti = computed(() => this.state.dokumentti);
  public readonly dokumenttiJulkaisu = computed(() => this.state.dokumenttiJulkaisu);
  public readonly polling = computed(() => this.state.polling);
  public readonly dokumenttiHref = computed(() => this.state.dokumenttiHref);
  public readonly dokumenttiJulkaisuHref = computed(() => this.state.dokumenttiJulkaisuHref);
  public readonly kuvat = computed(() => this.state.kuvat);

  async init() {
    this.state.dokumentti = null;
    this.state.dokumenttiJulkaisu = null;
    await this.getDokumenttiKuva();
    await this.getDokumenttiTila();
    this.generateKuvaHref();
    this.setHref();
  }

  @Debounced(2000)
  async getDokumenttiTila() {
    this.state.dokumentti = (await Dokumentit.getLatestDokumentti(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;

    await this.getJulkaistuDokumentti();

    if (this.state.dokumentti) {
      if (_.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.EPAONNISTUI)
          || _.kebabCase(this.state.dokumentti.tila) === _.kebabCase(DokumenttiDtoTilaEnum.VALMIS)) {
        this.state.polling = false;

        this.setHref();
      }
      else if (_.kebabCase(this.state.dokumentti.tila) !== _.kebabCase(DokumenttiDtoTilaEnum.EIOLE)) {
        this.state.polling = true;
        await this.getDokumenttiTila();
      }
    }
  }

  async getJulkaistuDokumentti() {
    if (this.state.dokumentti && !this.state.dokumentti.julkaisuDokumentti && !this.state.dokumenttiJulkaisu) {
      this.state.dokumenttiJulkaisu = (await JulkinenApi.getJulkaistuDokumentti(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;
      if (this.state.dokumenttiJulkaisu.id) {
        this.state.dokumenttiJulkaisuHref = baseURL + JulkinenApiParams.getDokumentti(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!), this.state.dokumenttiJulkaisu.id).url;
      }
    }
  }

  async getDokumenttiKuva() {
    this.state.dokumenttiKuva = (await Dokumentit.getDokumenttiKuva(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;
    this.generateKuvaHref();
    this.setHref();
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
      if (_.get(this.state.dokumenttiKuva, kuva.tyyppi)) {
        url = baseURL + DokumentitParams.getDokumenttiImage(this.opetussuunnitelma.id!, kuva.tyyppi, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!)).url;
      }

      return {
        ...kuva,
        url,
      };
    });
  }

  async luoPdf() {
    this.state.polling = true;
    this.state.dokumentti = (await Dokumentit.createDokumentti(this.opetussuunnitelma.id!, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!))).data;
    await this.getDokumenttiTila();
  }

  async saveImage(file, tyyppi: string) {
    await Dokumentit.addDokumenttiImage(this.opetussuunnitelma.id!, tyyppi, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!), file);
    await this.getDokumenttiKuva();
  }

  async removeImage(tyyppi: string) {
    await Dokumentit.deleteDokumenttiImage(this.opetussuunnitelma.id!, tyyppi, Kielet.getSisaltoKieli.value, _.toString(this.opetussuunnitelma.koulutustoimija!.id!));
    await this.getDokumenttiKuva();
  }
}

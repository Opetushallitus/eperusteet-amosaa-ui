import Vue from 'vue';
import { Opetussuunnitelmat, PageOpetussuunnitelmaBaseDto, SisaltoViiteKevytDto, Sisaltoviitteet, SisaltoViiteKevytDtoTyyppiEnum } from '@shared/api/amosaa';
import { debounced } from '@shared/utils/delay';
import * as _ from 'lodash';
import { reactive } from 'vue';
import { computed } from 'vue';

export class SisaltotuontiStore {
  public state = reactive({
    opetussuunnitelmat: null as PageOpetussuunnitelmaBaseDto | null,
    sisaltoviitteet: null as SisaltoViiteKevytDto[] | null,
  });

  constructor(private opetusuunnitelmaId: number, private koulutustoimijaId: string) {
  }

  public readonly opetussuunnitelmat = computed(() => this.state.opetussuunnitelmat);
  public readonly sisaltoviitteet = computed(() => this.state.sisaltoviitteet);
  public readonly tekstikappaleet = computed(() => _.filter(this.state.sisaltoviitteet, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.TEKSTIKAPPALE) as any }));
  public readonly suorituspolut = computed(() => _.filter(this.state.sisaltoviitteet, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.SUORITUSPOLKU) as any }));
  public readonly tutkinnonosat = computed(() => _.filter(this.state.sisaltoviitteet, { tyyppi: _.toLower(SisaltoViiteKevytDtoTyyppiEnum.TUTKINNONOSA) as any }));

  public fetch = debounced(async (query) => {
    this.state.opetussuunnitelmat = null;
    this.state.opetussuunnitelmat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatBaseSivutettu(
      this.koulutustoimijaId,
      { params: query })).data;
  });

  clear() {
    this.state.opetussuunnitelmat = null;
  }

  public async fetchSisallot(opetussuunnitelmaId: number) {
    this.state.sisaltoviitteet = null;
    this.state.sisaltoviitteet = _.filter(
      (await Sisaltoviitteet.getOtsikot(opetussuunnitelmaId, this.koulutustoimijaId)).data, sisaltoviite => _.get(sisaltoviite, '_vanhempi')) as SisaltoViiteKevytDto[];
  }

  public async tuoSisaltoa(sisaltoIdt: number[]) {
    await Sisaltoviitteet.linkkaaUusiSisalto(this.opetusuunnitelmaId, this.koulutustoimijaId, sisaltoIdt);
  }
}

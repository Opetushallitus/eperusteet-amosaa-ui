import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { PageOpetussuunnitelmaDto, Opetussuunnitelmat, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { EperusteetKoulutustyyppiRyhmat } from '@shared/utils/perusteet';
import { Toteutus } from '@/utils/toteutustypes';
import { Page } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class OpetussuunnitelmaPohjatStore {
  private state = reactive({
    opspohjat: null as OpetussuunnitelmaDto[] | null,
  })

  public readonly opspohjat = computed(() => this.state.opspohjat);

  public async fetch(koulutustoimijaId: number, ophKtId: number, toteutus: Toteutus) {
    const koulutustoimijanPohjat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatSivutettu(
      _.toString(koulutustoimijaId), undefined,
      {
        params: {
          sivukoko: 1000,
          tila: ['luonnos', 'valmis', 'julkaistu'],
          tyyppi: ['opspohja'],
          koulutustyyppi: EperusteetKoulutustyyppiRyhmat[toteutus],
        },
      })).data as Page<OpetussuunnitelmaDto>;

    const opetushallituksenPohjat = (await Opetussuunnitelmat.getAllOpetussuunnitelmatSivutettu(
      _.toString(ophKtId), undefined,
      {
        params: {
          sivukoko: 1000,
          tila: ['valmis', 'julkaistu'],
          tyyppi: ['opspohja'],
          koulutustyyppi: EperusteetKoulutustyyppiRyhmat[toteutus],
        },
      })).data as Page<OpetussuunnitelmaDto>;

    this.state.opspohjat = [
      ...koulutustoimijanPohjat.data,
      ...opetushallituksenPohjat.data,
    ];
  }
}

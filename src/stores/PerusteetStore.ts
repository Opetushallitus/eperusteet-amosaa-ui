import Vue from 'vue';
import { Arviointiasteikot, Ulkopuoliset, PerusteDtoKoulutustyyppiEnum, PerusteKevytDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { EperusteetKoulutustyyppiRyhmat, Toteutus } from '@shared/utils/perusteet';
import { Koulutustyyppi } from '@shared/tyypit';
import { reactive } from 'vue';
import { computed } from 'vue';
import { Kielet } from '@shared/stores/kieli';

export class PerusteetStore {
  private state = reactive({
    perusteetKevyt: null as PerusteKevytDto[] | null,
    toteutus: null as Toteutus | null,
  });

  private static Arviointiasteikot = null as any | null;
  private static Geneeriset = null as any | null;

  public readonly perusteetKevyt = computed(() => {
    if (this.state.perusteetKevyt) {
      return _.filter(this.state.perusteetKevyt, peruste =>
        !_.includes([Koulutustyyppi.telma, Koulutustyyppi.valma], peruste.koulutustyyppi as any));
    }
    return null;
  });

  public readonly toteutus = computed(() => this.state.toteutus);

  public init(toteutus) {
    this.state.perusteetKevyt = null;
    this.state.toteutus = toteutus;
  }

  public static async fetchArviointiasteikot() {
    if (!PerusteetStore.Arviointiasteikot) {
      const { data } = await Arviointiasteikot.getAllArviointiasteikot();
      PerusteetStore.Arviointiasteikot = _(data)
        .map(asteikko => {
          return {
            ...asteikko,
            osaamistasot: _.keyBy(asteikko.osaamistasot, 'id'),
          };
        })
        .keyBy('id')
        .value();
    }
    return PerusteetStore.Arviointiasteikot;
  }

  public static async fetchGeneeriset() {
    if (!PerusteetStore.Geneeriset) {
      const { data } = await Ulkopuoliset.getGeneerisetArvioinnit();
      PerusteetStore.Geneeriset = data;
    }
    return PerusteetStore.Geneeriset;
  }

  public async fetchJulkaistutPerusteet(nimi?: string) {
    this.state.perusteetKevyt = null;
    this.state.perusteetKevyt = (await Ulkopuoliset.getPerusteet(EperusteetKoulutustyyppiRyhmat[this.toteutus.value!], nimi, Kielet.getSisaltoKieli.value)).data;
  }
}

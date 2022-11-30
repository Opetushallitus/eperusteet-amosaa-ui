import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Perusteet, Sisaltoviitteet, Koodistot, Arviointiasteikot, SisaltoviiteMatalaDto, MatalaTyyppiEnum } from '@shared/api/amosaa';
import * as _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, Kieli } from '@shared/tyypit';

Vue.use(VueCompositionApi);

export class SisaltoEditStore implements IEditoitava {
  constructor(
    private opetussuunnitelmaId: number,
    private koulutustoimijaId: string,
    private sisaltoViiteId: number,
    private perusteId: number,
    private versionumero: number,
    private el: any,
    private uusi: boolean) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.uusi;
  }

  async history() {
  }

  async load(addPerusteData: (data: any) => void) {
    return this.fetch(addPerusteData);
  }

  async supportLoad(data: any) {
    return null;
  }

  async fetch(addPerusteData: (data: any) => void) {
    let result = {};
    if (!this.uusi) {
      if (this.versionumero) {
        const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId)).data as Revision[];
        const rev = revisions[revisions.length - this.versionumero];
        return Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoViiteId, rev.numero, this.koulutustoimijaId);
      }

      const { data } = await Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId)!;
      result = data;

      if (data.tyyppi === _.toLower(MatalaTyyppiEnum.OSASUORITUSPOLKU) || data.tyyppi === _.toLower(MatalaTyyppiEnum.SUORITUSPOLKU)) {
        const { data: rakenne } = await Perusteet.getPerusteRakenne(this.perusteId, 'reformi');
        const { data: tutkinnonOsat } = await Perusteet.getPerusteTutkinnonOsat(this.perusteId);
        const { data: liitettavatOsat } = await Sisaltoviitteet.getTutkinnonosat(this.opetussuunnitelmaId, this.koulutustoimijaId);

        const tutkinnonOsaViitteet = _.keyBy((rakenne as any).tutkinnonOsaViitteet, 'id');
        const tutkinnonOsaViitteetByTutkinnonOsaId = _.keyBy((rakenne as any).tutkinnonOsaViitteet, '_tutkinnonOsa');

        addPerusteData({
          rakenne: (rakenne as any).rakenne,
          tutkinnonOsaViitteet,
          tutkinnonOsaViitteetByTutkinnonOsaId,
          tutkinnonOsat: _.keyBy(tutkinnonOsat, 'id'),
          liitettavatOsat,
        });

        (result as any).suorituspolku = {
          naytaKuvausJulkisesti: false,
          piilotaPerusteenTeksti: false,
          osasuorituspolkuLaajuus: null,
          ...data.suorituspolku,
        };
      }
      else if (data.tosa && data.tosa.perusteentutkinnonosa) {
        const tutkinnonOsa = (await Perusteet.getPerusteTutkinnonOsa(this.perusteId, data.tosa!.perusteentutkinnonosa!)).data as any;
        const tutkinnonOsaViite = (await Perusteet.getTutkinnonOsaViite(this.perusteId, 'reformi', data.tosa!.perusteentutkinnonosa!)).data;
        addPerusteData({
          tutkinnonOsa,
          tutkinnonOsaViite,
        });
      }
    }

    return {
      ...result,
    };
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, data);
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore(rev: number) {
    const restoring = (await Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoViiteId, rev, this.koulutustoimijaId)).data;
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, restoring);
  }

  async revisions() {
    const data = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId)).data;
    return data as Revision[];
  }

  async start() {
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId);
    this.el.$router.push({
      name: 'poistetutsisallot',
    });
  }
  public readonly validator = computed(() => {
    return {};
  });

  public features(data: any) {
    return computed(() => {
      return {
        editable: true,
        removable: true,
        hideable: false,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }

  static async addNewSisalto(toteutussuunnitelmaId: number, parentId: number, ktId: string, params: Object) {
    const { data } = await Sisaltoviitteet.addTekstiKappaleLapsi(toteutussuunnitelmaId, parentId, ktId, params);
    return data;
  }
}

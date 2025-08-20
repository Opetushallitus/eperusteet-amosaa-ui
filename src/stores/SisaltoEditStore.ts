import Vue from 'vue';
import { Perusteet, Sisaltoviitteet, Koodistot, Arviointiasteikot, SisaltoviiteMatalaDto, MatalaTyyppiEnum } from '@shared/api/amosaa';
import * as _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, Kieli } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { computed } from 'vue';
import { Router } from 'vue-router';
import { App } from 'vue';
import { ToteutussuunnitelmaStore } from './ToteutussuunnitelmaStore';
import { $t } from '@shared/utils/globals';

interface SisaltoEditStoreConfig {
  router: Router;
  updateNavigation: () => Promise<void>;
}

export class SisaltoEditStore implements IEditoitava {
  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoViiteId: number,
    public perusteId: number,
    public versionumero: number,
    public uusi: boolean,
  ) {
  }

  protected static config: SisaltoEditStoreConfig;

  public static install(app: App, config: SisaltoEditStoreConfig) {
    SisaltoEditStore.config = config;
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
      const { data } = await this.fetchWithVersion();
      result = data;

      if (data.tyyppi === _.toLower(MatalaTyyppiEnum.OSASUORITUSPOLKU) || data.tyyppi === _.toLower(MatalaTyyppiEnum.SUORITUSPOLKU)) {
        const { data: rakenne } = await Perusteet.getPerusteRakenne(this.perusteId, 'reformi');
        const { data: tutkinnonOsat } = await Perusteet.getPerusteTutkinnonOsat(this.perusteId);
        const { data: liitettavatOsat } = await Sisaltoviitteet.getTutkinnonosat(this.opetussuunnitelmaId, this.koulutustoimijaId);

        const tutkinnonOsaViitteet = _.keyBy((rakenne as any).tutkinnonOsaViitteet, 'id');
        const tutkinnonOsaViitteetByTutkinnonOsaId = _.keyBy((rakenne as any).tutkinnonOsaViitteet, '_tutkinnonOsa');

        addPerusteData({
          rakenne: this.asetaPakollisuus((rakenne as any).rakenne, false),
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
        if (data.peruste?.id) {
          this.perusteId = data.peruste.id;
        }

        if (data.linkattuPeruste) {
          this.perusteId = data.linkattuPeruste;
        }

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

  asetaPakollisuus(node, parentMandatory) {
    const pakollinen = parentMandatory || node.pakollinen || (!!node.nimi && node.nimi[Kielet.getUiKieli.value] === $t('rakenne-moduuli-pakollinen'));
    return {
      ...node,
      pakollinen,
      ...(node.osat && { osat: _.map(node.osat, osa => this.asetaPakollisuus(osa, pakollinen)) }),
    };
  }

  async fetchWithVersion() {
    if (this.versionumero) {
      const revisions = (await Sisaltoviitteet.getSisaltoviiteRevisions(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return Sisaltoviitteet.getSisaltoviiteRevision(this.opetussuunnitelmaId, this.sisaltoViiteId, rev.numero, this.koulutustoimijaId);
    }
    else {
      return Sisaltoviitteet.getSisaltoviiteTekstit(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId)!;
    }
  }

  async save(data: any) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId, data);
    await SisaltoEditStore.config.updateNavigation();
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

  async remove(data) {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId, this.sisaltoViiteId, this.koulutustoimijaId);
    await SisaltoEditStore.config.updateNavigation();
    SisaltoEditStore.config.router.push({
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
        recoverable: true,
      } as EditoitavaFeatures;
    });
  }

  static async addNewSisalto(toteutussuunnitelmaId: number, parentId: number, ktId: string, params: any) {
    const { data } = await Sisaltoviitteet.addTekstiKappaleLapsi(toteutussuunnitelmaId, parentId, ktId, params);
    return data;
  }
}

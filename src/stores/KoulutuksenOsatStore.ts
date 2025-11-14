import Vue from 'vue';
import { Perusteet, OpetussuunnitelmaDto, SisaltoViiteKevytDto, Opetussuunnitelmat, Sisaltoviitteet } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { EditoitavaFeatures, IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';
import { reactive } from 'vue';
import { computed } from 'vue';

export class KoulutuksenOsatStore extends AbstractSisaltoviiteStore implements IEditoitava {
  private state = reactive({
    koulutuksenosat: null as any | null,
  });

  constructor(
    public toteutussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public opetussuunnitelma: OpetussuunnitelmaDto,
  ) {
    super(toteutussuunnitelmaId, koulutustoimijaId, sisaltoviiteId);
  }

  async load() {
    const koulutuksenosat = await Promise.all(_.map((await Sisaltoviitteet.getSisaltoviitteeTyypilla(
      this.toteutussuunnitelmaId,
      'koulutuksenosa',
      this.koulutustoimijaId,
    )).data, async (koulutuksenosaviite) => {
      if (koulutuksenosaviite.perusteenOsaId && this.opetussuunnitelma.peruste) {
        const perusteenOsa = (await Perusteet.getPerusteenOsa(this.opetussuunnitelma.peruste!.id!, koulutuksenosaviite.perusteenOsaId)).data as any;
        return {
          ...koulutuksenosaviite,
          koulutuksenosa: {
            ...koulutuksenosaviite.koulutuksenosa,
            laajuusMinimi: perusteenOsa.laajuusMinimi,
            laajuusMaksimi: perusteenOsa.laajuusMaksimi,
          },
        };
      }

      return koulutuksenosaviite;
    }));

    return {
      sisaltoviite: await this.fetchSisaltoviite(),
      koulutuksenosat,
    };
  }

  async editAfterLoad() {
    return false;
  }

  async hide(data) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.toteutussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, { ...data.sisaltoviite, piilotettu: true });
    await KoulutuksenOsatStore.config.updateNavigation;
  }

  async unHide(data) {
    await Sisaltoviitteet.updateTekstiKappaleViite(this.toteutussuunnitelmaId, this.sisaltoviiteId, this.koulutustoimijaId, { ...data.sisaltoviite, piilotettu: false });
    await KoulutuksenOsatStore.config.updateNavigation;
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: false,
        removable: false,
        recoverable: false,
        hideable: true,
        isHidden: data.sisaltoviite?.piilotettu,
      } as EditoitavaFeatures;
    });
  }
}

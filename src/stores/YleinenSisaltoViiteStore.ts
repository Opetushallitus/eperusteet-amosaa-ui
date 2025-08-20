import _ from 'lodash';
import { OpetussuunnitelmaDto, Perusteet } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';
import { computed } from 'vue';


export class YleinenSisaltoViiteStore extends AbstractSisaltoviiteStore implements IEditoitava {
  constructor(
    public opetussuunnitelmaId?: number,
    public koulutustoimijaId?: string,
    public sisaltoviiteId?: number,
    public versionumero?: number,
    public opetussuunnitelma?: OpetussuunnitelmaDto,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero);
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    let data = await this.fetchSisaltoviite();
    if (data.perusteenOsaId && this.opetussuunnitelma?.peruste) {
      const perusteenOsa = (await Perusteet.getPerusteenOsa(this.opetussuunnitelma.peruste!.id!, data.perusteenOsaId)).data;
      data = {
        ...data,
        perusteenOsa,
      } as any;
    }

    return data;
  }

  async save(data: any) {
    await this.saveSisaltoviite(data);
  }

  public readonly validator = computed(() => {
    return {};
  });

  public features(data: any) {
    return computed(() => {
      return {
        editable: _.toString(this.opetussuunnitelma?.tyyppi) !== 'opspohja',
        removable: true,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }
}

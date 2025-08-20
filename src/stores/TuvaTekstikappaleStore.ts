import { OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { TekstikappaleStore, ITekstikappale } from './TekstikappaleStore';
import { computed } from 'vue';

export class TuvaTekstikappaleStore extends TekstikappaleStore implements ITekstikappale {
  constructor(
    public opetussuunnitelmaId?: number,
    public koulutustoimijaId?: string,
    public sisaltoviiteId?: number,
    public versionumero?: number,
    public opetussuunnitelma?: OpetussuunnitelmaDto,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, opetussuunnitelma);
  }

  public features(data: any) {
    return computed(() => {
      return {
        editable: _.toString(this.opetussuunnitelma?.tyyppi) !== 'opspohja' || !data?.perusteteksti,
        removable: !data?.pohjanTekstikappale?.teksti,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }

  create(opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoviiteId: number,
    versionumero: number,
    opetussuunnitelma: OpetussuunnitelmaDto) {
    return new TuvaTekstikappaleStore(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, opetussuunnitelma);
  }
}

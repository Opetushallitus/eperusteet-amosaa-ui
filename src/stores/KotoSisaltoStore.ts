import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import _ from 'lodash';
import { OpetussuunnitelmaDto, Perusteet, Sisaltoviitteet } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Computed } from '@shared/utils/interfaces';
import { YleinenSisaltoViiteStore } from './YleinenSisaltoViiteStore';

Vue.use(VueCompositionApi);

export class KotoSisaltoStore extends YleinenSisaltoViiteStore implements IEditoitava {
  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public versionumero: number,
    public opetussuunnitelma: OpetussuunnitelmaDto,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, opetussuunnitelma);
  }

  async load() {
    let data = await this.fetchSisaltoviite();
    if (data.perusteenOsaId && this.opetussuunnitelma.peruste) {
      const perusteenOsa = (await Perusteet.getPerusteenOsa(this.opetussuunnitelma.peruste!.id!, data.perusteenOsaId)).data;
      data = {
        ...data,
        perusteenOsa,
      } as any;
    }

    const laot = (await Sisaltoviitteet.getSisaltoviitteeTyypilla(this.opetussuunnitelmaId, 'koto_laajaalainenosaaminen', this.koulutustoimijaId)).data;
    const perusteenLaajaAlaisetOsaamiset = _.chain(
      await Promise.all(_.map(laot, async (lao) => ((await Perusteet.getPerusteenOsa(this.opetussuunnitelma.peruste!.id!, lao.perusteenOsaId!)).data))))
      .map((perusteenLao: any) => perusteenLao.osaamisAlueet)
      .flatMap()
      .value();

    return {
      ...data,
      perusteenLaajaAlaisetOsaamiset,
    };
  }
}

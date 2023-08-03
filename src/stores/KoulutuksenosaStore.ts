import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';
import _ from 'lodash';

import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum, Perusteet } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Computed } from '@shared/utils/interfaces';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';

Vue.use(VueCompositionApi);

export class KoulutuksenosaStore extends AbstractSisaltoviiteStore implements IEditoitava {
  private koulutuksenosa: SisaltoviiteMatalaDto | undefined = undefined;

  constructor(
    public opetussuunnitelmaId: number,
    public koulutustoimijaId: string,
    public sisaltoviiteId: number,
    public versionumero: number,
    public el: any,
    public updateNavigation: Function,
    public opetussuunnitelma: OpetussuunnitelmaDto,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, el, updateNavigation);
  }

  async editAfterLoad() {
    return false;
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
        editable: this.opetussuunnitelma.tyyppi !== _.toLower(OpetussuunnitelmaDtoTyyppiEnum.POHJA),
        removable: true,
        hideable: false,
        recoverable: true,
        lockable: true,
      } as EditoitavaFeatures;
    });
  }

  public static async add(opsId: number, svId: number, ktId: string, koulutuksenosa: SisaltoviiteMatalaDto, el: any, updateNavigation: Function) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, koulutuksenosa)).data;
    await updateNavigation();

    el.$router.push({
      name: 'koulutuksenosa',
      params: {
        sisaltoviiteId: '' + added.id,
      },
    });
  }
}

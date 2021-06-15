import Vue from 'vue';
import VueCompositionApi, { computed } from '@vue/composition-api';

import _ from 'lodash';
import { minLength, required, minValue } from 'vuelidate/lib/validators';

import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko } from '@shared/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { translated } from '@shared/validators/required';
import { Validations } from 'vuelidate-property-decorators';
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
    public opetussuunnitelma: Computed<OpetussuunnitelmaDto>,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero);
  }

  async editAfterLoad() {
    return false;
  }

  async load() {
    return this.fetchSisaltoviite();
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
        editable: this.opetussuunnitelma.value?.tyyppi !== 'opspohja',
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

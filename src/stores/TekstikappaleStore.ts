import Vue from 'vue';
import { SisaltoviiteMatalaDto, Sisaltoviitteet, SisaltoviiteLukko, OpetussuunnitelmaDto } from '@shared/api/amosaa';
import _ from 'lodash';
import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Revision, ILukko, Koulutustyyppi } from '@shared/tyypit';
import { YleinenSisaltoViiteStore } from './YleinenSisaltoViiteStore';
import { computed } from 'vue';
import { Router, useRouter } from 'vue-router';
import { App } from 'vue';
import { AbstractSisaltoviiteStore } from './AbstractSisaltoviiteStore';

export interface ITekstikappale {
  create(opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoviiteId: number,
    versionumero: number,
    opetussuunnitelma: OpetussuunnitelmaDto): TekstikappaleStore
}

export class TekstikappaleStore extends YleinenSisaltoViiteStore implements IEditoitava, ITekstikappale {
  constructor(
    public opetussuunnitelmaId?: number,
    public koulutustoimijaId?: string,
    public sisaltoviiteId?: number,
    public versionumero?: number,
    public opetussuunnitelma?: OpetussuunnitelmaDto,
  ) {
    super(opetussuunnitelmaId, koulutustoimijaId, sisaltoviiteId, versionumero, opetussuunnitelma);
  }

  async cancel() {
  }

  async history() {
  }

  async start() {
  }

  async remove() {
    await Sisaltoviitteet.removeSisaltoViite(this.opetussuunnitelmaId!, this.sisaltoviiteId!, this.koulutustoimijaId!);
    await TekstikappaleStore.config.updateNavigation();
    AbstractSisaltoviiteStore.config.router.replace({
      name: 'toteutussuunnitelma',
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
        lockable: true,
      } as EditoitavaFeatures;
    });
  }

  public static async add(opsId: number, svId: number, ktId: string, tekstikappale: SisaltoviiteMatalaDto) {
    const added = (await Sisaltoviitteet.addTekstiKappaleLapsi(opsId, svId, ktId, tekstikappale)).data;
    await TekstikappaleStore.config.updateNavigation();

    AbstractSisaltoviiteStore.config.router.push({
      name: 'tekstikappale',
      params: {
        sisaltoviiteId: '' + added.id,
      },
    });
  }

  create(opetussuunnitelmaId: number,
    koulutustoimijaId: string,
    sisaltoviiteId: number,
    versionumero: number,
    opetussuunnitelma: OpetussuunnitelmaDto) {
    return new TekstikappaleStore(
      opetussuunnitelmaId,
      koulutustoimijaId,
      sisaltoviiteId,
      versionumero,
      opetussuunnitelma,
    );
  }
}

import Vue from 'vue';
import { Ohjeet, OhjeDto } from '@shared/api/amosaa';
import { Toteutus } from '@shared/utils/perusteet';
import _ from 'lodash';
import { reactive } from 'vue';
import { computed } from 'vue';

const backendToteutus = {
  [Toteutus.KOTOUTUMINEN]: 'kotoutumiskoulutus',
};

const toBackendToteutus = (toteutus) => backendToteutus[toteutus] || toteutus;

export class OhjeetStore {
  private state = reactive({
    ohjeet: null as OhjeDto[] | null,
  });

  public readonly ohjeet = computed(() => this.state.ohjeet);

  public async fetch(toteutus) {
    this.state.ohjeet = (await Ohjeet.getOhjeet(toBackendToteutus(toteutus))).data as any;
  }

  public async save(ohje: OhjeDto) {
    const tallennettava = {
      ...ohje,
      toteutus: toBackendToteutus(ohje.toteutus) as any,
    };

    if (tallennettava.id) {
      const tallennettu = (await Ohjeet.editOhje(tallennettava.id, tallennettava)).data;
      this.state.ohjeet = _.map(this.state.ohjeet, ohje => {
        if (ohje.id === tallennettu.id) {
          return tallennettu;
        }
        return ohje;
      });
    }
    else {
      const tallennettu = (await Ohjeet.addOhje(tallennettava)).data;
      this.state.ohjeet?.push(tallennettu);
    }
  }

  public async delete(poistettavaOhje: OhjeDto) {
    await Ohjeet.removeOhje(poistettavaOhje.id!);
    this.state.ohjeet = _.filter(this.state.ohjeet, ohje => ohje.id !== poistettavaOhje.id);
  }
}

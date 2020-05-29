import Vue from 'vue';
import VueCompositionApi, { reactive, computed } from '@vue/composition-api';
import { Ohjeet, OhjeDto } from '@shared/api/amosaa';
import _ from 'lodash';

Vue.use(VueCompositionApi);

export class OhjeetStore {
  private state = reactive({
    ohjeet: null as OhjeDto[] | null,
  })

  public readonly ohjeet = computed(() => this.state.ohjeet);

  public async fetch() {
    this.state.ohjeet = (await Ohjeet.getOhjeet()).data as any;
  }

  public async save(ohje: OhjeDto) {
    if (ohje.id) {
      const tallennettu = (await Ohjeet.editOhje(ohje.id, ohje)).data;
      this.state.ohjeet = _.map(this.state.ohjeet, ohje => {
        if (ohje.id === tallennettu.id) {
          return tallennettu;
        }
        return ohje;
      });
    }
    else {
      const tallennettu = (await Ohjeet.addOhje(ohje)).data;
      this.state.ohjeet?.push(tallennettu);
    }
  }

  public async delete(poistettavaOhje: OhjeDto) {
    await Ohjeet.removeOhje(poistettavaOhje.id!);
    this.state.ohjeet = _.filter(this.state.ohjeet, ohje => ohje.id !== poistettavaOhje.id);
  }
}

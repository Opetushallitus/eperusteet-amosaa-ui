import Vue from 'vue';
import { Opetussuunnitelmat, PoistettuDto, OpetussuunnitelmaDto, Koulutustoimijat } from '@shared/api/amosaa';
import _ from 'lodash';
import { Computed } from '@shared/utils/interfaces';
import { reactive } from 'vue';
import { computed } from 'vue';
import { watch } from 'vue';

export class PoistetutStore {
  private state = reactive({
    poistetut: null as PoistettuDto[] | null,
  });

  constructor(private opetussuunnitelma: Computed<OpetussuunnitelmaDto>) {
  }

  public readonly fetch = watch([this.opetussuunnitelma], async () => {
    await this.fetchPoistetut();
  });

  public readonly poistetut = computed(() => this.state.poistetut);

  public async fetchPoistetut() {
    if (this.opetussuunnitelma.value) {
      this.state.poistetut = null;

      const poistetut = (await Opetussuunnitelmat.getPoistetutSisaltoviitteet(this.opetussuunnitelma.value.id, this.opetussuunnitelma.value.koulutustoimija.id)).data;
      const kayttajaOids = _.uniq(_.map(poistetut, 'muokkaajaOid'));
      const kayttajatByOid = _.chain(await Promise.all(_.map(kayttajaOids, kayttajaOid => Koulutustoimijat.getKoulutustoimijaKayttaja(kayttajaOid as string, this.opetussuunnitelma.value.koulutustoimija.id))))
        .map('data')
        .keyBy('oidHenkilo')
        .value();

      this.state.poistetut = _.map(poistetut, poistettu => {
        return {
          ...poistettu,
          poistaja: kayttajatByOid[poistettu.muokkaajaOid!],
        };
      });
    }
  }

  public async palauta(poistettuId) {
    await Opetussuunnitelmat.palautaOpetussuunnitelmaSisaltoviite(this.opetussuunnitelma.value.id, poistettuId, this.opetussuunnitelma.value.koulutustoimija.id);
    this.state.poistetut = _.filter(this.state.poistetut, poistettu => poistettu.id !== poistettuId);
  }
}

import Vue from 'vue';
import { Opetussuunnitelmat, VanhentunutPohjaperusteDto, Koulutustoimijat } from '@shared/api/amosaa';
import _ from 'lodash';
import { reactive } from 'vue';
import { computed } from 'vue';

export class PaivitettavatJaSiirrettavatTotsStore {
  private state = reactive({
    vanhentuneetToteutussuunnitelmat: null as VanhentunutPohjaperusteDto[] | null,
    historialiitoksienToteutussuunnitelmat: null as any[] | null,
  });

  public readonly vanhentuneetToteutussuunnitelmat = computed(() => this.state.vanhentuneetToteutussuunnitelmat);
  public readonly historialiitoksienToteutussuunnitelmat = computed(() => this.state.historialiitoksienToteutussuunnitelmat);

  public async fetch(koulutustoimijaId: string) {
    this.state.vanhentuneetToteutussuunnitelmat = null;
    this.state.historialiitoksienToteutussuunnitelmat = null;

    this.state.vanhentuneetToteutussuunnitelmat = (await Opetussuunnitelmat.getPaivitettavatOpetussuunnitelmat(koulutustoimijaId)).data;

    const historialiitokset = (await Koulutustoimijat.getOrganisaatioHistoriaLiitokset(koulutustoimijaId)).data;
    const historialiitoksetOpetussuunnitelmilla = await Promise.all(_.map(historialiitokset, async (historialiitos) => {
      return {
        ...historialiitos,
        opetussuunnitelmat: (await Opetussuunnitelmat.getOpetussuunnitelmatOrganisaatioista(historialiitos.organisaatio!.oid!, koulutustoimijaId)).data,
      };
    }));
    this.state.historialiitoksienToteutussuunnitelmat = _.chain(historialiitoksetOpetussuunnitelmilla)
      .map(liitos =>
        _.map(liitos.opetussuunnitelmat, opetussuunnitelma => (
          {
            opetussuunnitelma,
            historialiitos: liitos,
          })))
      .flatMap()
      .value();
  }

  public async paivita(toteutussuunnitelmaId: number, koulutustoimijaId: string) {
    await Opetussuunnitelmat.paivitaOpetussuunnitelmanPeruste(toteutussuunnitelmaId, koulutustoimijaId);

    this.state.vanhentuneetToteutussuunnitelmat = _.filter(this.state.vanhentuneetToteutussuunnitelmat,
      vanhentunut => vanhentunut.opetussuunnitelma!.id !== toteutussuunnitelmaId);
  }

  public async siirra(toteutussuunnitelmaId: number, koulutustoimijaId: string) {
    await Opetussuunnitelmat.updateOpetussuunnitelmaKoulutustoimijaPassivoidusta(toteutussuunnitelmaId, koulutustoimijaId);

    this.state.historialiitoksienToteutussuunnitelmat = _.filter(this.state.historialiitoksienToteutussuunnitelmat,
      historialiitokset => historialiitokset.opetussuunnitelma!.id !== toteutussuunnitelmaId);
  }
}

import { Watch, Prop, Vue } from 'vue-property-decorator';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import * as _ from 'lodash';

export abstract class ToteutussuunnitelmaRoute extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  protected get toteutussuunnitelmaId(): number {
    return _.toNumber(this.$route.params.toteutussuunnitelmaId);
  }

  protected get koulutustoimijaId(): number {
    return _.toNumber(this.$route.params.koulutustoimijaId);
  }

  protected abstract onProjektiChange(koulutustoimijaId:number, toteutussuunnitelmaId: number): Promise<any>;

  @Watch('toteutussuunnitelmaId', { immediate: true })
  async onToteutussuunnitelmaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      await this.toteutussuunnitelmaStore.init(this.koulutustoimijaId, this.toteutussuunnitelmaId);
      await this.onProjektiChange(this.koulutustoimijaId, this.toteutussuunnitelmaId);
    }
  }

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      await this.toteutussuunnitelmaStore.init(this.koulutustoimijaId, this.toteutussuunnitelmaId);
      await this.onProjektiChange(this.koulutustoimijaId, this.toteutussuunnitelmaId);
    }
  }
}

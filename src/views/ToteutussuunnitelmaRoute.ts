import { Watch, Prop, Vue } from 'vue-property-decorator';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import * as _ from 'lodash';

export abstract class ToteutussuunnitelmaRoute extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  private isInitializing = false;

  protected abstract onProjektiChange(koulutustoimijaId: string, toteutussuunnitelmaId: number): Promise<any>;

  @Watch('toteutussuunnitelmaId', { immediate: true })
  async onToteutussuunnitelmaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue && !this.isInitializing) {
      this.fetch();
    }
  }

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue && !this.isInitializing) {
      this.fetch();
    }
  }

  async fetch() {
    this.isInitializing = true;
    try {
      await this.toteutussuunnitelmaStore.init(_.toNumber(this.koulutustoimijaId), _.toNumber(this.toteutussuunnitelmaId));
      await this.onProjektiChange(_.toNumber(this.koulutustoimijaId), _.toNumber(this.toteutussuunnitelmaId));
    }
    finally {
      this.isInitializing = false;
    }
  }

  async updateNavigation() {
    console.log(this);
    await this.toteutussuunnitelmaStore.initNavigation(this.koulutustoimijaId, this.toteutussuunnitelmaId);
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get navigation() {
    return this.toteutussuunnitelmaStore.navigation;
  }
}

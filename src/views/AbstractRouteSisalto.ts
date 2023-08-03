import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import * as _ from 'lodash';

@Component
export class AbstractRouteSisalto extends Vue {
  @Prop({ required: true })
  protected koulutustoimijaId!: string;

  @Prop({ required: true })
  protected toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  protected sisaltoviiteId!: number;

  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Watch('sisaltoviiteId', { immediate: true })
  sisaltoviiteChange() {
    this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  @Watch('toteutussuunnitelma', { immediate: true })
  opetussuunnitelmaChange() {
    this.fetch();
  }

  get toteutussuunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  protected async fetch() {}
}

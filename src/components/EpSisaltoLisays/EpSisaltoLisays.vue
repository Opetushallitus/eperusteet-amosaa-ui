<template>
  <b-dropdown class="ml-3" variant="link" toggle-class="text-decoration-none" no-caret>
    <template v-slot:button-content>
      + {{$t('lisaa-sisaltoa')}}
    </template>

    <b-dropdown-item>

      <ep-tekstikappale-lisays :tekstikappaleet="tekstikappaleet" :paatasovalinta="true" @save="lisaaUusiTekstikappale">
        <span slot="lisays-btn">{{$t('uusi-tekstikappale')}}</span>
        <template v-slot:default="{tekstikappale}">
          {{$kaanna(tekstikappale.label)}}
        </template>
      </ep-tekstikappale-lisays>

    </b-dropdown-item>

  </b-dropdown>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpSelect from '@shared/components/forms/EpSelect.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpTekstikappaleLisays from '@shared/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { SisaltoviiteMatalaDto, MatalaTyyppiEnum, SisaltoViiteKevytDtoTyyppiEnum, NavigationNodeDto } from '@shared/api/amosaa';

@Component({
  components: {
    EpTekstikappaleLisays,
  },
})
export default class EpSisaltoLisays extends Vue {
  @Prop({ required: true })
  private tekstikappaleStore!: TekstikappaleStore;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private navigation!: NavigationNodeDto;

  @Prop({ required: true })
  private updateNavigation!: Function;

  get tekstikappaleet() {
    return _.filter(this.navigationNodes, navigationNode => navigationNode.type === 'tekstikappale');
  }

  get navigationNodes() {
    return [
      this.navigation,
      ...this.navigationChildren(this.navigation.children as []),
    ];
  }

  navigationChildren(navigations: NavigationNodeDto[]): NavigationNodeDto[] {
    return _.flatten(_.map(navigations, navigation => {
      return [
        navigation,
        ...this.navigationChildren(navigation.children as []),
      ];
    }));
  }

  get rootSisaltoviiteId(): number {
    return this.navigation.id!;
  }

  async lisaaUusiTekstikappale(otsikko: any, valittuTekstikappale: any) {
    let parentId = this.rootSisaltoviiteId;
    if (valittuTekstikappale && valittuTekstikappale.id) {
      parentId = valittuTekstikappale.id;
    }

    this.tekstikappaleStore.add(
      this.toteutussuunnitelmaId,
      parentId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(MatalaTyyppiEnum.TEKSTIKAPPALE),
        tekstiKappale: {
          nimi: otsikko,
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }
}

</script>

<style scoped lang="scss">

  ::v-deep .dropdown-toggle {
    font-size: 0.8rem !important;
    padding-bottom: 0px;
  }

  ::v-deep .dropdown-item {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  ::v-deep .dropdown-menu {
    margin-left: 15px;
    font-size: 0.8rem;
  }

</style>

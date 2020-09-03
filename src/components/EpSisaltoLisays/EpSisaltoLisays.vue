<template>
  <b-dropdown variant="link" toggle-class="text-decoration-none" no-caret>
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

    <div v-if="!opsYhteinenOsuus">
      <b-dropdown-item>
        <span @click="lisaaUusiTutkinnonosa">{{$t('uusi-tutkinnon-osa')}}</span>
      </b-dropdown-item>

      <hr class="mt-1 mb-1"/>

      <b-dropdown-item>
        <span @click="lisaaUusiSuorituspolku">{{$t('uusi-suorituspolku')}}</span>
      </b-dropdown-item>

      <b-dropdown-item>
        <span @click="lisaaUusiOsaSuorituspolku">{{$t('uusi-osasuorituspolku')}}</span>
      </b-dropdown-item>

      <hr class="mt-1 mb-1"/>

      <b-dropdown-item>
        <ep-sisallon-tuonti :opetussuunnitelmaId="toteutussuunnitelma.id" :koulutustoimijaId="koulutustoimijaId" :updateNavigation="updateNavigation"/>
      </b-dropdown-item>
    </div>

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
import { SisaltoViiteStore } from '@/stores/SisaltoViiteStore';
import { SisaltoviiteMatalaDto, MatalaTyyppiEnum, SisaltoViiteKevytDtoTyyppiEnum, NavigationNodeDto, OpetussuunnitelmaDto, OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import { Kielet } from '@shared/stores/kieli';
import EpSisallonTuonti from '@/components/EpSisaltoLisays/EpSisallonTuonti.vue';

@Component({
  components: {
    EpTekstikappaleLisays,
    EpButton,
    EpSisallonTuonti,
  },
})
export default class EpSisaltoLisays extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private navigation!: NavigationNodeDto;

  @Prop({ required: true })
  private updateNavigation!: Function;

  @Prop({ required: true })
  private toteutussuunnitelma!: OpetussuunnitelmaDto;

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

    SisaltoViiteStore.add(
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

  async lisaaUusiTutkinnonosa() {
    let parentId = _.find(this.navigationNodes, navigationNode => navigationNode.type === 'tutkinnonosat')!.id!;

    SisaltoViiteStore.add(
      this.toteutussuunnitelmaId,
      parentId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(MatalaTyyppiEnum.TUTKINNONOSA),
        tekstiKappale: {
          nimi: { [Kielet.getSisaltoKieli.value]: '' },
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }

  async lisaaUusiSuorituspolku() {
    let parentId = _.find(this.navigationNodes, navigationNode => navigationNode.type === 'suorituspolut')!.id!;

    SisaltoViiteStore.add(
      this.toteutussuunnitelmaId,
      parentId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(MatalaTyyppiEnum.SUORITUSPOLKU),
        tekstiKappale: {
          nimi: { [Kielet.getSisaltoKieli.value]: '' },
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }

  async lisaaUusiOsaSuorituspolku() {
    let parentId = _.find(this.navigationNodes, navigationNode => navigationNode.type === 'suorituspolut')!.id!;

    SisaltoViiteStore.add(
      this.toteutussuunnitelmaId,
      parentId,
      this.koulutustoimijaId,
      {
        tyyppi: _.toLower(MatalaTyyppiEnum.OSASUORITUSPOLKU),
        tekstiKappale: {
          nimi: { [Kielet.getSisaltoKieli.value]: '' },
        },
      } as SisaltoviiteMatalaDto,
      this,
      this.updateNavigation);
  }

  get opsYhteinenOsuus() {
    return this.toteutussuunnitelma.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.YHTEINEN);
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

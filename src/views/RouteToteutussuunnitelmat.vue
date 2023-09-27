<template>
  <EpMainView>
    <EpToteutussuunnitelmaListaus
      :provider="toteutussuunnitelmatStore"
      :koulutustoimija-id="koulutustoimijaId"
      :tyypit="tyypit"
      :filters="filters"
      :fieldKeys="tableFields"
      nameLabel="nimi-tai-koulutuskoodi"
      :kayttajaStore="kayttajaStore">

      <div slot="header" class="d-flex justify-content-between">
        <h2>{{ $t(topic) }}</h2>

        <div>
          <router-link :to="luontiRoute" v-oikeustarkastelu="{ oikeus: 'luonti'}">
            <ep-button variant="outline-primary" icon="add">
              {{ $t(lisaaBtnText) }}
            </ep-button>
          </router-link>

          <router-link :to="{name: 'jaettuosaLuonti'}" v-oikeustarkastelu="{ oikeus: 'luonti'}" v-if="!isOrganisaatioRyhma">
            <ep-button variant="outline-primary" icon="add" >
              {{ $t('lisaa-jaettu-osa') }}
            </ep-button>
          </router-link>
        </div>
      </div>
    </EpToteutussuunnitelmaListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpToteutussuunnitelmaListaus from '@/components/EpToteutussuunnitelmaListaus/EpToteutussuunnitelmaListaus.vue';
import { ToteutussuunnitelmatStore } from '@/stores/ToteutussuunnitelmatStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { KayttajaStore } from '@/stores/kayttaja';
import { Murupolku } from '@shared/stores/murupolku';

@Component({
  components: {
    EpMainView,
    EpToteutussuunnitelmaListaus,
    EpButton,
  },
})
export default class RouteToteutussuunnitelmat extends Vue {
  @Prop({ required: true })
  toteutussuunnitelmatStore!: ToteutussuunnitelmatStore;

  @Prop({ required: true })
  kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Watch('isOrganisaatioRyhma', { immediate: true })
  organisaatioRyhmaChange() {
    Murupolku.aseta('toteutussuunnitelmat', this.$t(this.topic));
  }

  get topic() {
    return this.isOrganisaatioRyhma ? 'oppimisympariston-tunnistamisraportit' : 'toteutussuunnitelmat';
  }

  get lisaaBtnText() {
    return this.isOrganisaatioRyhma ? 'lisaa-uusi' : 'lisaa-toteutussuunnitelma';
  }

  get isOrganisaatioRyhma() {
    return this.kayttajaStore.koulutustoimija.value?.organisaatioRyhma;
  }

  get filters() {
    if (this.isOrganisaatioRyhma) {
      return ['voimassaolo', 'tila'];
    }

    return ['tyyppi', 'voimassaolo', 'tila'];
  }

  get tyypit() {
    if (this.isOrganisaatioRyhma) {
      return ['ops'];
    }

    return ['ops', 'yleinen'];
  }

  get tableFields() {
    if (this.isOrganisaatioRyhma) {
      return ['nimi', 'tila', 'muokattu'];
    }

    return undefined;
  }

  get luontiRoute() {
    if (this.isOrganisaatioRyhma) {
      return { name: 'tunnistamisraporttiLuonti' };
    }

    return { name: 'toteutussuunnitelmaLuonti' };
  }
}
</script>

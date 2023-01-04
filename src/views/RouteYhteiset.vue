<template>
  <EpMainView>
    <EpToteutussuunnitelmaListaus
      :provider="storeProvider"
      :koulutustoimija-id="koulutustoimijaId"
      :tyypit="tyypit"
      :filters="['voimassaolo','tila']"
      :fieldKeys="tableFields"
      :kayttajaStore="kayttajaStore">
      <div slot="header" class="d-flex justify-content-between">
        <h2>{{ $t('koulutustoimijan-yhteinen-osuus') }}</h2>

        <div>
          <router-link :to="{name: 'yhteinenLuonti'}">
            <ep-button variant="outline-primary" icon="plussa" >
              {{ $t('lisaa-uusi') }}
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
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { IToteutussuunnitelmaProvider } from '@/components/EpToteutussuunnitelmaListaus/types';
import { KayttajaStore } from '@/stores/kayttaja';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpToteutussuunnitelmaListaus,
    EpButton,
  },
})
export default class RouteYhteiset extends Vue {
  @Prop({ required: true })
  storeProvider!: IToteutussuunnitelmaProvider;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private tyypit!: string[];

  @Prop({ required: true })
  kayttajaStore!: KayttajaStore;

  get tableFields() {
    return ['nimi', 'tila', 'muokattu', 'voimaantulo', 'paatospaivamaara'];
  }
}
</script>

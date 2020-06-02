<template>
  <EpMainView>
    <EpToteutussuunnitelmaListaus :provider="toteutussuunnitelmatStore">
      <div slot="header" class="d-flex justify-content-between">
        <h2>{{ $t('toteutussuunnitelmat') }}</h2>

        <div>
          <router-link :to="{}">
            <ep-button variant="outline-primary" icon="plussa">
              {{ $t('lisaa-toteutussuunnitelma') }}
            </ep-button>
          </router-link>

          <router-link :to="{}">
            <ep-button variant="outline-primary" icon="plussa" >
              {{ $t('lisaa-jaettu-osa') }}
            </ep-button>
          </router-link>
        </div>
      </div>
    </EpToteutussuunnitelmaListaus>
  </EpMainView>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpToteutussuunnitelmaListaus from '@/components/EpToteutussuunnitelmaListaus/EpToteutussuunnitelmaListaus.vue';
import EpIcon from '@shared/components/EpIcon/EpIcon.vue';
import { ToteutussuunnitelmatStore } from '@/stores/ToteutussuunnitelmatStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpIcon,
    EpMainView,
    EpToteutussuunnitelmaListaus,
    EpButton,
  },
})
export default class RouteToteutussuunnitelmat extends Vue {
  @Prop({ required: true })
  toteutussuunnitelmatStore!: ToteutussuunnitelmatStore;
}
</script>

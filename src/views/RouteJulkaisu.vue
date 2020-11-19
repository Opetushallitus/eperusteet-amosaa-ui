<template>
  <div class="p-4">
    <h2>{{ $t('julkaisunakyma') }}</h2>
    <div>{{ $t('julkaisunakyma-kuvaus') }}</div>

    <div class="mt-4">
      <h3>{{ $t('julkaisu-vaikutukset') }}</h3>
      <ul>
        <li>{{ $t('julkaisusta-julkinen') }}</li>
        <li>{{ $t('julkaisusta-luodaan-pdf') }}</li>
        <li>{{ $t('julkaisusta-vanhat-versiot-sailyvat') }}</li>
      </ul>
    </div>
    <div>
      <h3>{{ $t('tarkistukset') }}</h3>
      {{ validationCategories }}
      <template v-if="suunnitelma">
        <hr class="mt-4 mb-4">
        <h3>{{ $t('suunnitelman-tiedot') }}</h3>
        <b-container fluid>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('opetussuunnitelman-nimi')">
                <EpInput v-model="suunnitelma.nimi"/>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col>
              <b-form-group :label="$t('tiivistelma')">
                <EpContent v-model="suunnitelma.kuvaus" layout="full"/>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('paatosnumero')">
                <EpInput v-if="suunnitelma.paatosnumero" v-model="suunnitelma.paatosnumero" type="string"/>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('paatospaivamaara')">
                <EpDatepicker v-model="suunnitelma.paatospaivamaara" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('hyvaksyja')">
                <EpInput v-if="suunnitelma.hyvaksyja" v-model="suunnitelma.hyvaksyja" type="string"/>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
            <b-col lg="6">
              <b-form-group :label="$t('voimassaolo')">
                <div class="d-flex align-items-center">
                  <EpDatepicker v-model="suunnitelma.voimaantulo" />
                  <div class="ml-2 mr-2">-</div>
                  <!-- <EpDatepicker v-model="suunnitelma.voimassaoloLoppuu" /> -->
                </div>
              </b-form-group>
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col lg="6">
              <b-form-group :label="$t('julkaisukielet')">
                <div class="text-nowrap" v-if="suunnitelma.julkaisukielet.length > 0">
                  <span v-for="(kieli, idx) in suunnitelma.julkaisukielet" :key="kieli" :value="kieli">
                    {{ $t(kieli) }}<span class="mr-0" v-if="idx < suunnitelma.julkaisukielet.length - 1">,</span>
                  </span>
                </div>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
             <b-col lg="6">
              <b-form-group :label="$t('esikatselu')">
                <EpExternalLink :url="esikatseluUrl"  v-if="suunnitelma.esikatseltavissa">
                  {{ $t('esikatsele-toteutussuunnitelmaa') }}
                </EpExternalLink>
                <template v-else>-</template>
              </b-form-group>
            </b-col>
          </b-row>
        </b-container>
        <hr class="mt-4 mb-4">
        <h3>{{ $t('uusi-julkaisu') }}</h3>
        <b-form-group :label="$t('julkaisun-tiedote') + ' *'">
          <div class="mt-2 mb-3">TBA</div>
        </b-form-group>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Mixins, Prop, Vue, Watch } from 'vue-property-decorator';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';

import { Toteutus } from '@/utils/toteutustypes';

import EpInput from '@shared/components/forms/EpInput.vue';
import EpDatepicker from '@shared/components/forms/EpDatepicker.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { buildEsikatseluUrl } from '@shared/utils/esikatselu';

import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpInput,
    EpDatepicker,
    EpExternalLink,
    EpContent,
    EpButton,
  }
})
export default class RouteJulkaisu extends Vue {
  @Prop({ required: true })
  protected toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  get suunnitelma() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value;
  }

  get esikatseluUrl() {
    return buildEsikatseluUrl(Kielet.getSisaltoKieli.value, `/toteutussuunnitelma/${this.suunnitelma!.id}/${this.toteutus}`)
  }

  get validationCategories(): string[] | undefined {
    if (this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value) {
      return _.chain(this.toteutussuunnitelmaStore.toteutussuunnitelmaStatus.value.virheet)
        .keyBy('syy')
        .keys()
        .value();
    }
  }
}
</script>

<style scoped lang="scss">
  .content {
    padding: 15px 50px 50px 50px;
  }
</style>

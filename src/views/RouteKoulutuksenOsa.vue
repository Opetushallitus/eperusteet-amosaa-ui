<template>
  <EpEditointi v-if="editointiStore" :store="editointiStore" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
    <template #header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.koulutuksenosa.nimi) }}</h2>
    </template>
     <template #default="{ data, isEditing, validation, data: { koulutuksenosa } }">
       <b-row>
         <b-col>
           <b-form-group :label="$t('laajuus')">
            {{perusteenOsa.laajuusMinimi}} - {{perusteenOsa.laajuusMaksimi}} {{$t('viikkoa')}}
          </b-form-group>
         </b-col>
      </b-row>
      <b-row>
        <b-col md="10">
          <b-form-group :label="$t('kuvaus')">
            <EpContent
              v-model="perusteenOsa.kuvaus"
              layout="normal"
              :is-editable="false"
              :kuvaHandler="kuvaHandler"/>
          </b-form-group>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <h3 class="mb-4">{{$t('tavoitteet')}}</h3>
          <b-form-group :label="$t('opiskelija')">
            <template v-if="perusteenOsa.tavoitteet.length > 0">
              <ul class="mb-0">
                <li v-for="tavoite in perusteenOsa.tavoitteet" :key="tavoite.id">
                  {{$kaanna(tavoite)}}
                </li>
              </ul>
            </template>
            <template v-if="koulutuksenosa.paikallinenTarkennus && paikallisetTavoitteetListana">
              <EpSortableTextList :isEditing="isEditing" v-model="koulutuksenosa.paikallinenTarkennus.tavoitteet">
                {{$t('lisaa-tavoite')}}
              </EpSortableTextList>
            </template>
          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus && !paikallisetTavoitteetListana">
            <b-form-group :label="$t('paikallinen-teksti')">
              <ep-content
                layout="normal"
                v-model="koulutuksenosa.paikallinenTarkennus.tavoitteetKuvaus"
                :is-editable="isEditing"
                v-if="isEditing || koulutuksenosa.paikallinenTarkennus.tavoitteetKuvaus"
                :kuvaHandler="kuvaHandler"/>
              <EpAlert
                v-if="!isEditing && !koulutuksenosa.paikallinenTarkennus.tavoitteetKuvaus"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
            </b-form-group>
          </template>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <h3 slot="label">{{ $t('laaja-alainen-osaaminen') }}</h3>
              <EpContent
                v-if="perusteenOsa.laajaAlaisenOsaamisenKuvaus"
                v-model="perusteenOsa.laajaAlaisenOsaamisenKuvaus"
                layout="normal"
                :is-editable="false"
                :kuvaHandler="kuvaHandler"/>

          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus">
            <EpKoodistoTekstillaSelect
              :isEditing="isEditing"
              :store="laajaAlaisetKoodistoStore"
              :kuvaHandler="kuvaHandler"
              v-model="koulutuksenosa.paikallinenTarkennus.laajaalaisetosaamiset"
              :tekstiField="'laajaAlaisenOsaamisenKuvaus'">
              {{$t('lisaa-laaja-alaisen-osaamisen-kuvaus')}}

              <div slot="lisateksti" slot-scope="{item}">
                <EpContent
                  v-if="laajaAlaisetKoodilla[item.koodiUri]"
                  v-model="laajaAlaisetKoodilla[item.koodiUri].perusteteksti"
                  layout="normal"
                  :is-editable="false"
                  :kuvaHandler="kuvaHandler"/>
              </div>
            </EpKoodistoTekstillaSelect>
            <EpAlert
                v-if="!isEditing && koulutuksenosa.paikallinenTarkennus.laajaalaisetosaamiset.length === 0"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
          </template>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <h3 slot="label">{{ $t('keskeinen-sisalto') }}</h3>
              <EpContent
                v-if="perusteenOsa.keskeinenSisalto"
                v-model="perusteenOsa.keskeinenSisalto"
                layout="normal"
                :is-editable="false"
                :kuvaHandler="kuvaHandler"/>

          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus">
            <b-form-group :label="$t('paikallinen-teksti')">
               <ep-content
              layout="normal"
              v-model="koulutuksenosa.paikallinenTarkennus.keskeinenSisalto"
              :is-editable="isEditing"
              v-if="isEditing || koulutuksenosa.paikallinenTarkennus.keskeinenSisalto"
              :kuvaHandler="kuvaHandler"/>
              <EpAlert
                v-if="!isEditing && !koulutuksenosa.paikallinenTarkennus.keskeinenSisalto"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
            </b-form-group>
          </template>
        </b-col>
      </b-row>
      <hr/>
      <b-row>
        <b-col md="10">
          <b-form-group>
            <h3 slot="label">{{ $t('arviointi-teksti') }}</h3>
              <EpContent
                v-if="perusteenOsa.arvioinninKuvaus"
                v-model="perusteenOsa.arvioinninKuvaus"
                layout="normal"
                :is-editable="false"
                :kuvaHandler="kuvaHandler"/>

          </b-form-group>
          <template v-if="koulutuksenosa.paikallinenTarkennus">
            <b-form-group :label="$t('paikallinen-teksti')">
             <ep-content
              layout="normal"
              v-model="koulutuksenosa.paikallinenTarkennus.arvioinninKuvaus"
              :is-editable="isEditing"
              v-if="isEditing || koulutuksenosa.paikallinenTarkennus.arvioinninKuvaus"
              :kuvaHandler="kuvaHandler"/>
              <EpAlert
                v-if="!isEditing && !koulutuksenosa.paikallinenTarkennus.arvioinninKuvaus"
                :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"/>
            </b-form-group>
          </template>
        </b-col>
      </b-row>
      <template v-if="koulutuksenosa.paikallinenTarkennus && (isEditing || koulutuksenosa.paikallinenTarkennus.koulutuksenJarjestajat.length > 0)">
        <hr/>
        <b-row>
          <b-col md="10">
            <b-form-group>
              <h3 slot="label">{{ $t('koulutuksen-jarjestajat') }}</h3>

              <EpKoulutuksenJarjestajaSelect
                :isEditing="isEditing"
                v-model="koulutuksenosa.paikallinenTarkennus.koulutuksenJarjestajat"
                :kuvaHandler="kuvaHandler"/>

            </b-form-group>
          </b-col>
        </b-row>
      </template>
    </template>
  </EpEditointi>
  <EpSpinner v-else class="my-3"/>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import * as _ from 'lodash';
import draggable from 'vuedraggable';
import { KuvaStore } from '@/stores/KuvaStore';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KoulutuksenosaStore } from '@/stores/KoulutuksenosaStore';
import EpKoodistoTekstillaSelect from '@shared/components/EpKoodistoSelect/EpKoodistoTekstillaSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import EpSortableTextList from '@shared/components/EpSortableTextList/EpSortableTextList.vue';
import EpKoulutuksenJarjestajaSelect from '@shared/components/EpKoulutuksenJarjestajaSelect/EpKoulutuksenJarjestajaSelect.vue';
import { OpetussuunnitelmaDto, Sisaltoviitteet } from '@shared/api/amosaa';
import { AbstractRouteSisalto } from './AbstractRouteSisalto';

@Component({
  components: {
    EpSpinner,
    EpEditointi,
    EpInput,
    EpContent,
    EpButton,
    draggable,
    EpAlert,
    EpKoodistoTekstillaSelect,
    EpSortableTextList,
    EpKoulutuksenJarjestajaSelect,
  },
})
export default class RouteKoulutuksenOsa extends AbstractRouteSisalto {
  private editointiStore: EditointiStore | null = null;
  private laajaAlaisetOsaamiset: any[] = [];

  async mounted() {
    this.laajaAlaisetOsaamiset = (await Sisaltoviitteet.getSisaltoviitteeTyypilla(this.toteutussuunnitelmaId, 'laajaalainenosaaminen', this.koulutustoimijaId)).data;
  }

  get laajaAlaisetKoodilla() {
    return _.keyBy(this.laajaAlaisetOsaamiset, 'tuvaLaajaAlainenOsaaminen.nimiKoodi');
  }

  private readonly laajaAlaisetKoodistoStore = new KoodistoSelectStore({
    koodisto: 'tutkintokoulutukseenvalmentavakoulutuslaajaalainenosaaminen',
    async query(query: string, sivu = 0, koodisto) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 25,
        },
      })).data as any;
    },
  });

  get laajaalaisetKoodit() {
    return this.laajaAlaisetKoodistoStore.data.value?.data;
  }

  get perusteenOsa() {
    return this.editointiStore?.data.value.perusteenOsa || this.editointiStore?.data.value.koulutuksenosa;
  }

  async fetch() {
    this.editointiStore = new EditointiStore(
      new KoulutuksenosaStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.versionumero,
        this,
        () => this.toteutussuunnitelmaStore.initNavigation(),
        this.toteutussuunnitelmaStore.toteutussuunnitelma.value as OpetussuunnitelmaDto));
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.toteutussuunnitelmaId, this.koulutustoimijaId));
  }

  get paikallisetTavoitteetListana() {
    return this.editointiStore?.data.value.koulutuksenosa.nimiKoodi === 'koulutuksenosattuva_104';
  }
}
</script>

<style scoped lang="scss">

</style>

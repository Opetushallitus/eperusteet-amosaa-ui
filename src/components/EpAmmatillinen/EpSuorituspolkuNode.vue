<template>
  <div>
    <div class="d-flex" v-if="depth > 0">
      <div class="w-100">
        <div class="rakenne" :style="style">
          <div class="d-flex w-100 justify-content-between" :class="{'kuvaukseton': !node.kuvaus}">
            <div v-if="node.osat && node.osat.length > 0" @click="toggleOsat()">
              <EpMaterialIcon v-if="!showOsat">expand_more</EpMaterialIcon>
              <EpMaterialIcon  v-else>expand_less</EpMaterialIcon>
            </div>
            <div class="w-75" :class="{'ml-3' : node.osat && node.osat.length > 0}">
              <slot name="nimi">
                <span v-if="isRyhma">
                </span>
                <span v-else>
                  <ep-color-indicator :id="'node-' + node.tunniste" :tooltip="false" :kind="node.pakollinen ? 'pakollinen' : 'valinnainen'" class="mr-2"/>
                  <b-popover :target="'node-' + node.tunniste" :placement="'bottom'" triggers="hover">
                    <span v-if="node.pakollinen">{{$t('pakollinen-tutkinnon-osa')}}</span>
                    <span v-if="!node.pakollinen">{{$t('valinnainen-tutkinnon-osa')}}</span>
                  </b-popover>
                </span>
                <span :style="{ 'text-decoration': paikallinen.piilotettu ? 'line-through' : '' }">
                  {{ $kaanna(info.nimi) }}
                  <span class="ml-1" v-if="info.koodi">({{ info.koodi }})</span>
                </span>
              </slot>
            </div>
            <div class="w-25 text-right">
              <span v-if="isRyhma">
                <span :class="{'text-warning': osienLaajuus < info.minimi}">
                  {{ info.minimi }} - {{ info.maksimi }}
                </span>
              </span>
              <span v-else>
                {{ info.minimi }}
              </span>
              <div class="btn-group" v-if="isEditing">
                <button class="btn btn-link" v-if="!paikallinen.piilotettu" @click="muokkaa()">
                  <EpMaterialIcon>edit</EpMaterialIcon>
                </button>
                <button class="btn btn-link" @click="toggleNode()">
                  <EpMaterialIcon>delete</EpMaterialIcon>
                </button>
              </div>
            </div>
          </div>

          <div class="text-center" v-if="(node.kuvaus || paikallinen.kuvaus) && !naytaKuvaukset" @click="toggleKuvaus()">
            <EpMaterialIcon>more_horiz</EpMaterialIcon>
          </div>
          <div class="kuvaus" v-if="(node.kuvaus || paikallinen.kuvaus) && (showKuvaus || naytaKuvaukset)">
            <div v-html="$kaanna(node.kuvaus)"></div>
            <div v-if="paikallinen && paikallinen.kuvaus" v-html="$kaanna(paikallinen.kuvaus)"></div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="paikalliset" v-if="paikallinen.koodit.length > 0">
        <div class="kiinnitys paikallinen" v-for="kiinnitetty in kiinnitetyt" :key="'osa-' + kiinnitetty.koodi">
          <ep-color-indicator :id="'node-' + node.tunniste" :tooltip="false" kind="pakollinen" class="mr-2"/>
          {{ kiinnitetty.nimi }} ({{ kiinnitetty.koodiArvo }})
          <div class="float-right" v-if="kiinnitetty.laajuus">
            {{ kiinnitetty.laajuus }} {{ $t('OSAAMISPISTE') }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="node.osat && !paikallinen.piilotettu && showOsat">
      <div class="aliosat">
        <div class="osa" v-for="(osa, idx) in osat" :key="'osa-' + idx">
          <EpSuorituspolkuNode v-model="value"
                               :is-editing="isEditing"
                               :tutkinnon-osat="tutkinnonOsat"
                               :tutkinnonOsaViitteet="tutkinnonOsaViitteet"
                               :tutkinnonOsaViitteetByTutkinnonOsaId="tutkinnonOsaViitteetByTutkinnonOsaId"
                               :liitettavat-osat="liitettavatOsat"
                               :node="osa"
                               :nayta-piilotetut="naytaPiilotetut"
                               :nayta-kuvaukset="naytaKuvaukset"
                               :viimeinen="idx === node.osat.length - 1"
                               :depth="depth + 1"
                               :naytaRakenne="naytaRakenne"/>
        </div>
      </div>
    </div>
    <b-modal :id="'suorituspolku-modal-' + node.tunniste"
             ref="muokkausModal"
             size="lg"
             :title="$t('muokkaa') + ': ' + $kaanna(info.nimi)"
             :hide-footer="true">

      <div v-if="modalData">
        <b-form-group :label="$t('kuvaus')">
          <ep-content layout="normal" v-model="modalData.kuvaus" :is-editable="true"></ep-content>
        </b-form-group>
        <div v-if="node.rooli === 'määrittelemätön'">
          <b-table responsive striped
            :items="tutkinnonOsaArvot"
            :fields="tutkinnonOsaFields">
            <template v-slot:cell(nimi)="{ item }">
              <div class="selectable" @click="selectKoodi(item)">
                <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
                <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
                <span>{{item.nimi}} ({{ item.koodiArvo }})</span>
              </div>
            </template>
          </b-table>
        </div>
      </div>
      <div class="float-right">
        <button class="btn btn-link" @click="peruuta()">{{ $t('peruuta') }}</button>
        <button class="btn btn-primary" @click="tallenna()">{{ $t('tallenna') }}</button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import { rakenneNodecolor } from '@shared/utils/perusterakenne';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  name: 'EpSuorituspolkuNode',
  components: {
    EpColorIndicator,
    EpContent,
    EpMaterialIcon,
  },
})
export default class EpSuorituspolkuNode extends Vue {
  @Prop({ required: true })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  @Prop({ required: true })
  tutkinnonOsat!: any;

  @Prop({ required: true })
  tutkinnonOsaViitteet!: any;

  @Prop({ required: true })
  tutkinnonOsaViitteetByTutkinnonOsaId!: any;

  @Prop({ required: true })
  liitettavatOsat!: any;

  @Prop({ required: true })
  node!: any;

  @Prop({ default: 0 })
  depth!: number;

  @Prop({ default: false })
  naytaKuvaukset!: boolean;

  @Prop({ default: false })
  naytaRakenne!: boolean;

  @Prop({ default: false })
  naytaPiilotetut!: boolean;

  @Prop({ default: false })
  viimeinen!: boolean;

  private showKuvaus = false;
  private showOsat = true;
  private modalData = null as any | null;

  get koodiToOsa() {
    return _(this.liitettavatOsat)
      .map(this.mapData)
      .keyBy('koodi')
      .value();
  }

  get kiinnitetyt() {
    return _(this.paikallinen.koodit)
      .map(koodi => this.koodiToOsa[koodi])
      .sortBy('nimi')
      .value();
  }

  mapData(viite) {
    if (viite) {
      if (viite.tosa.omatutkinnonosa) {
        const koodi = viite.tosa.omatutkinnonosa.koodi;
        return {
          nimi: this.$kaanna(viite.tekstiKappale.nimi),
          koodi,
          koodiArvo: koodi,
          paikallinen: viite.tosa,
          laajuus: viite.tosa.omatutkinnonosa.laajuus,
          selected: _.includes(this.modalData?.koodit, koodi),
        };
      }
      else {
        const pviite = this.tutkinnonOsaViitteetByTutkinnonOsaId[viite.tosa.perusteentutkinnonosa];
        return {
          nimi: this.$kaanna(viite.tekstiKappale.nimi),
          koodi: viite.tosa.koodi,
          paikallinen: viite.tosa,
          koodiArvo: _.split(viite.tosa.koodi, '_')[1],
          laajuus: pviite?.laajuus,
          selected: _.includes(this.modalData?.koodit, viite.tosa.koodi),
        };
      }
    }
  }

  get tutkinnonOsaArvot() {
    return _(this.liitettavatOsat)
      .map(this.mapData)
      .filter()
      .filter('koodi')
      .sortBy('nimi')
      .value();
  }

  findPaikallinen(tunniste) {
    return _.find(this.value.rivit, { rakennemoduuli: tunniste });
  }

  get paikallinen() {
    if (this.node.tunniste) {
      return this.findPaikallinen(this.node.tunniste) || {
        id: this.node.id,
        rakennemoduuli: this.node.tunniste,
        piilotettu: false,
        kuvaus: null,
        koodit: [],
      };
    }
    return null;
  }

  get isRyhma() {
    return !!this.node.muodostumisSaanto || !!this.node.tutkintonimike || !!this.node.osaamisala || !!this.node.osat;
  }

  get hasParent() {
    return this.depth > 0;
  }

  get tov() {
    if (!this.isRyhma) {
      const viite = this.node._tutkinnonOsaViite;
      if (viite) {
        return this.tutkinnonOsaViitteet[viite] || null;
      }
    }
    return null;
  }

  get tosa() {
    if (this.tov) {
      return this.tutkinnonOsat[this.tov._tutkinnonOsa] || null;
    }
    return null;
  }

  get osat() {
    return this.suodataOsat(this.node);
  }

  get style() {
    return 'border-color: ' + rakenneNodecolor(this.node, false, this);
  }

  get osienLaajuus() {
    return this.laskettuOsienLaajuus(this.node);
  }

  get info() {
    const result = {
      nimi: this.node.nimi,
      minimi: null as number | null,
      maksimi: null as number | null,
      koodi: _.get(this.tosa, 'koodi.arvo')
        || _.get(this.node, 'tutkintonimike.arvo')
        || _.get(this.node, 'osaamisala.arvo')
        || null,
    };

    if (this.isRyhma) {
      result.nimi = this.node.nimi;
      if (this.node.muodostumisSaanto) {
        result.minimi = _.get(this.node, 'muodostumisSaanto.laajuus.minimi');
        result.maksimi = _.get(this.node, 'muodostumisSaanto.laajuus.maksimi');
      }
      else {
        result.minimi = this.osienLaajuus;
        result.maksimi = this.osienLaajuus;
      }
    }
    else if (this.tov && this.tosa) {
      result.nimi = this.tosa.nimi;
      result.minimi = this.tov.laajuus;
    }
    return result;
  }

  get tutkinnonOsaFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
      sortable: true,
      thStyle: { width: '100%' },
    }];
  };

  selectKoodi(rivi: any) {
    if (_.includes(this.modalData?.koodit, rivi.koodi)) {
      this.modalData.koodit = _.filter(this.modalData.koodit, rivi.koodi);
    }
    else {
      this.modalData.koodit = [...this.modalData.koodit, rivi.koodi];
    }
  }

  muokkaa() {
    this.modalData = {
      kuvaus: null,
      ...this.paikallinen,
      koodit: this.paikallinen.koodit || [],
    };
    (this.$refs.muokkausModal as any).show();
  }

  peruuta() {
    (this.$refs.muokkausModal as any).hide();
    this.modalData = null;
  }

  tallenna() {
    this.updatePaikallinen(this.modalData);
    this.peruuta();
  }

  toggleOsat() {
    this.showOsat = !this.showOsat;
  }

  @Watch('naytaRakenne')
  updateNaytaRakenne() {
    this.showOsat = this.depth === 0 || this.naytaRakenne;
  }

  toggleKuvaus() {
    this.showKuvaus = !this.showKuvaus;
  }

  updatePaikallinen(paikallinen) {
    if (!this.paikallinen) {
      return;
    }
    const filtered = _.reject(this.value.rivit, { rakennemoduuli: this.node.tunniste });
    this.value.rivit = [...filtered, { ...paikallinen }];
  }

  suodataOsat(node) {
    if (!this.naytaPiilotetut) {
      return _.filter(node.osat, osa => {
        const paikallinen = this.findPaikallinen(osa.tunniste);
        return !paikallinen || !paikallinen.piilotettu;
      });
    }
    else {
      return node.osat || [];
    }
  }

  get liitettavatByKoodi() {
    return _.keyBy(this.liitettavatOsat, osa =>
      _.get(osa, 'tosa.omatutkinnonosa.koodi')
        || _.get(osa, 'tosa.koodi'));
  }

  getLaajuusByKoodi(koodi) {
    const liitettava = this.liitettavatByKoodi[koodi];
    if (liitettava.tosa.omatutkinnonosa) {
      return liitettava.tosa.omatutkinnonosa.laajuus;
    }
    else {
      const pviite = this.tutkinnonOsaViitteetByTutkinnonOsaId[liitettava.tosa.perusteentutkinnonosa];
      return pviite?.laajuus || 0;
    }
  }

  laskettuOsienLaajuus(node) {
    const osalaajuus = _(this.paikallinen.koodit)
      .map(this.getLaajuusByKoodi)
      .filter(_.isNumber)
      .sum();

    const ryhmalaajuus = _(this.suodataOsat(node))
      .map(this.laskennallinenLaajuus)
      .sum();

    return osalaajuus + ryhmalaajuus;
  }

  laskennallinenLaajuus(node) {
    return _.get(node, 'muodostumisSaanto.laajuus.maksimi')
      || _.get(node, 'muodostumisSaanto.laajuus.minimi')
      || _.get(this.tutkinnonOsaViitteet[node._tutkinnonOsaViite], 'laajuus')
      || _.get(node, 'tosa.omatutkinnonosa.laajuus')
      || 0;
  }

  toggleNode() {
    this.updatePaikallinen({
      ...this.paikallinen,
      piilotettu: !this.paikallinen.piilotettu,
    });
  }
}
</script>

<style scoped lang="scss">
  @import '@shared/styles/_variables.scss';

  .rakenne {
    border-radius: 0.3rem 0 0 0;
    border: 0;
    border-left: 0.3rem;
    border-style: solid;
    border-color: $gray;
    padding:20px 20px 0px 20px;
    margin-top: 20px;
    background-color: $white;
    cursor: pointer;

    .kuvaus {
      padding: 20px;
    }

    .kuvaukseton {
      padding-bottom: 20px;
    }
  }

  .kiinnitys {
    margin-left: 1rem;
    border-radius: 0.3rem 0 0 0;
    border: 0;
    border-left: 0rem;
    border-style: solid;
    border-color: $gray;
    padding:10px 10px 10px 10px;
    margin-top: 10px;
    background-color: $white;
    cursor: pointer;

    .kuvaus {
      padding: 20px;
    }

    .kuvaukseton {
      padding-bottom: 20px;
    }
  }

  .liitosviiva {
    width: 20px;
    border-top: 2px solid $gray-lighten-3;
    transform: translateY(3rem);
  }

  .parentviiva {
    border-left: 2px solid $gray-lighten-3;
  }

  .parentviiva.viimeinen {
    height: 50px;
  }

  .rakenneosat.viimeinen {
    margin-left: 2px;
  }

  .aliosat {
    margin-left: 20px;
  }

</style>

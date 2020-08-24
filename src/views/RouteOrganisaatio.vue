<template>
  <div id="scroll-anchor" v-if="editointiStore">
    <ep-editointi :store="editointiStore" :use-container="true">
      <template v-slot:header>
        <h1 class="organisaatio-title">{{ $t('organisaation-hallinta') }}</h1>
      </template>

      <template v-slot:default="{ data, isEditing }">
        <div class="container">
          <h2 class="mt-3">{{ $t('koulutusjarjestaja-kuvaus') }}</h2>

          <ep-content v-model="data.kuvaus"
                        layout="minimal"
                        :is-editable="isEditing"
                        class="mb-5" />

          <h2>{{ $t('yhteistyo') }}</h2>

          <div class="mb-5">
            <h3>{{ $t('oma-organisaatiohierarkia') }}</h3>

            <div v-if="hierarkia">

              <!-- Värien merkitys ohjeet -->
              <ul class="colors-menu d-flex flex-row justify-content-end mb-2">
                <li class="oma">{{ $t('oma-organisaatio') }}</li>
                <li class="odotetaan">{{ $t('yhteistyo-kysytty') }}</li>
                <li class="pyynto">{{ $t('yhteistyo-odottaa-hyvaksymista') }}</li>
                <li class="yhteistyo">{{ $t('yhteistyo-organisaation-kanssa') }}</li>
              </ul>

              <ul style="list-style-type: none; padding-left: 0;">
                <ep-organization-tree :value="hierarkia"
                                      :is-editing="isEditing"
                                      :yhteistyo-map="yhteistyoMap" />
              </ul>
            </div>
            <ep-spinner v-else />
          </div>

          <h3>{{ $t('muut-organisaatiot') }}</h3>

          <ep-toggle v-model="data.salliystavat"
                    :isSWitch="false"
                    :is-editing="isEditing"
                    class="my-3"
                    size="lg">
            {{ $t('salli-yhteistyo') }}
          </ep-toggle>

          <div v-if="hasMuut">

            <div v-if="!isMuutEmpty">
              <!-- Värien merkitys ohjeet -->
              <ul class="colors-menu d-flex flex-row justify-content-end mb-2">
                <li class="odotetaan">{{ $t('yhteistyo-kysytty') }}</li>
                <li class="pyynto">{{ $t('yhteistyo-odottaa-hyvaksymista') }}</li>
                <li class="yhteistyo">{{ $t('yhteistyo-organisaation-kanssa') }}</li>
              </ul>

              <div v-for="(node, idx) in muut"
                  :key="idx">
                <ep-organization-node :value="node"
                                      :is-editing="isEditing"
                                      :yhteistyo-map="yhteistyoMap" />
              </div>
            </div>
          </div>
          <ep-spinner v-else />

          <ep-button v-if="!isEditing"
                     variant="primary"
                     @click="$refs['laheta-yhteistyopyynto-modal'].show()"
                     :show-spinner="!hasYhteistyoKoulutustoimijatFormatted">
            {{ $t('laheta-yhteistyopyynto') }}
          </ep-button>

          <b-modal id="laheta-yhteistyopyynto-modal"
                   ref="laheta-yhteistyopyynto-modal"
                   :title="$t('tee-yhteistyopyynto')"
                   :hide-footer="true"
                   size="lg">

            <p>{{ $t('tee-yhteistyopyynto-kuvaus') }}</p>

            <ep-search v-model="nimiFilter"
                       :placeholder="$t('etsi-organisaatiota')"
                       class="mb-3" />

            <b-table responsive
                     striped
                     :items="yhteistyoKoulutustoimijatFormatted"
                     :fields="fields"
                     :per-page="perPage"
                     :current-page="currentPage">
              <template v-slot:cell(actions)="row">
                <div class="float-right">
                  <ep-button v-if="row.item.status"
                             variant="link"
                             disabled>
                      <span v-if="row.item.status === 'oma'">{{ $t('oma-organisaatio') }}</span>
                      <span v-else-if="row.item.status === 'odotetaan'">{{ $t('yhteistyo-kysytty') }}</span>
                      <span v-else-if="row.item.status === 'pyynto'">{{ $t('yhteistyo-odottaa-hyvaksymista') }}</span>
                      <span v-else-if="row.item.status === 'yhteistyo'">{{ $t('yhteistyo-organisaation-kanssa') }}</span>
                  </ep-button>
                  <ep-button v-else
                             variant="link"
                             @click="lahetaYhteistyopyynto(row.item)">
                      {{ $t('laheta-yhteistyopyynto') }}
                  </ep-button>
                </div>
              </template>
            </b-table>

            <b-pagination v-model="currentPage"
                          :total-rows="rows"
                          :per-page="perPage"
                          align="center"
                          aria-controls="laheta-yhteistyopyynto-modal"></b-pagination>
          </b-modal>
        </div>
      </template>
    </ep-editointi>
  </div>
</template>

<script lang="ts">
import _, { get } from 'lodash';
import { Prop, Vue, Component, Mixins, Watch } from 'vue-property-decorator';

import { fail, success } from '@shared/utils/notifications';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Koulutustoimijat, OrganisaatioHierarkiaDto, KoulutustoimijaYstavaDto, KoulutustoimijaBaseDto } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';

import { KayttajaStore } from '@/stores/kayttaja';
import { OrganisaatioStore } from '@/stores/OrganisaatioStore';
import { OrganizationEventBus } from '@/components/EpOrganizationTree/OrganizationEventBus';

import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpColorCircle from '@shared/components/EpColorIndicator/EpColorCircle.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';

import EpOrganizationTree from '@/components/EpOrganizationTree/EpOrganizationTree.vue';
import EpOrganizationNode from '@/components/EpOrganizationTree/EpOrganizationNode.vue';

const logger = createLogger('RouteOrganisaatio');

@Component({
  components: {
    EpMainView,
    EpButton,
    EpContent,
    EpToggle,
    EpEditointi,
    EpColorCircle,
    EpOrganizationTree,
    EpOrganizationNode,
    EpSpinner,
    EpSearch,
  },
})
export default class RouteOrganisaatio extends Vue {
  private editointiStore: EditointiStore | null = null;
  private hierarkia: OrganisaatioHierarkiaDto | null = null;
  private ystavat: KoulutustoimijaYstavaDto[] | null = null;
  private pyynnot: KoulutustoimijaBaseDto[] | null = null;
  private yhteistyoKoulutustoimijat: KoulutustoimijaBaseDto[] | null = null;
  private currentPage = 1;
  private perPage = 5;
  private nimiFilter = '';

  mounted() {
    OrganizationEventBus.$off(); // Prevent duplicate listener on hot reload
    OrganizationEventBus.$on('peruuta-yhteistyopyynto', this.peruutaYhteistyopyynto);
    OrganizationEventBus.$on('hylkaa-yhteistyopyynto', this.hylkaaYhteistyopyynto);
    OrganizationEventBus.$on('hyvaksy-yhteistyopyynto', this.hyvaksyYhteistyopyynto);
    OrganizationEventBus.$on('lopeta-yhteistyo', this.lopetaYhteistyo);
    OrganizationEventBus.$on('laheta-yhteistyopyynto', this.lahetaYhteistyopyynto);
  }

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      this.fetch();
    }
  }

  async fetch() {
    this.editointiStore = new EditointiStore(new OrganisaatioStore(this.koulutustoimijaId));

    const res = _.map(await (Promise.all([
      Koulutustoimijat.getHierarkia(this.koulutustoimijaId),
      Koulutustoimijat.getOmatYstavat(this.koulutustoimijaId),
      Koulutustoimijat.getPyynnot(this.koulutustoimijaId),
      Koulutustoimijat.getYhteistyoKoulutustoimijat(this.koulutustoimijaId),
    ])), 'data') as any;

    this.hierarkia = res[0];
    this.ystavat = res[1];
    this.pyynnot = res[2];
    this.yhteistyoKoulutustoimijat = res[3];
  }

  get hierarkiaFlatten() {
    const nodes: any[] = [];
    const self = this;
    function traverseTree(node, depth) {
      nodes.push({
        oid: node.oid,
        parentOid: node.parentOid,
        nimi: node.nimi,
        depth,
      });
      return _.map(node.children, child => traverseTree(child, depth + 1));
    }

    if (this.hierarkia) {
      traverseTree(this.hierarkia, 0);
      return nodes;
    }
  }

  get muut() {
    return _(this.ystavat || [])
      .concat(this.pyynnot || [])
      .filter(node => !_.find(this.hierarkiaFlatten, { oid: node.organisaatio }))
      .sortBy(node => node.nimi ? this.$kaanna(node.nimi) : Number.MAX_SAFE_INTEGER)
      .value();
  }

  get hasMuut() {
    return this.ystavat || this.pyynnot;
  }

  get isMuutEmpty() {
    return _.isEmpty(this.muut);
  }

  get yhteistyoMap() {
    const map = {};
    if (this.hierarkia && this.hierarkiaFlatten) {
      // Oma organisaatio
      const kt = this.editointiStore!.data.value;
      if (kt && kt.organisaatio) {
        map[kt.organisaatio] = {
          ...map[kt.organisaatio],
          id: kt.id,
          status: 'oma',
        };
      }

      if (this.ystavat) {
        _.each(this.ystavat, ystava => {
          if (ystava.organisaatio && ystava.status) {
            map[ystava.organisaatio] = {
              ...map[ystava.organisaatio],
              id: ystava.id,
              status: ystava.status,
            };
          }
        });
        _.each(this.pyynnot, pyynto => {
          if (pyynto.organisaatio) {
            map[pyynto.organisaatio] = {
              ...map[pyynto.organisaatio],
              id: pyynto.id,
              status: 'pyynto',
            };
          }
        });
      }
    }
    return map;
  }

  get fields() {
    return [{
      key: 'nimiLocalized',
      label: this.$t('nimi'),
      sortable: true,
    }, {
      key: 'actions',
      label: this.$t('toiminto'),
      class: 'toiminto-cell',
    }];
  }

  get rows() {
    return this.yhteistyoKoulutustoimijat ? this.yhteistyoKoulutustoimijat.length : 0;
  }

  get yhteistyoKoulutustoimijatFormatted() {
    if (this.yhteistyoMap) {
      return _(this.yhteistyoKoulutustoimijat)
        .filter('organisaatio')
        .map(kt => {
          const yhteistyo = this.yhteistyoMap[kt.organisaatio!];
          return {
            ...kt,
            nimiLocalized: this.$kaanna(kt.nimi!),
            status: yhteistyo ? yhteistyo.status : undefined,
          };
        })
        .filter(this.$filterBy('nimiLocalized', this.nimiFilter))
        .sortBy(kt => kt.nimiLocalized ? kt.nimiLocalized : Number.MAX_SAFE_INTEGER)
        .value();
    }
  }

  get hasYhteistyoKoulutustoimijatFormatted() {
    return !_.isEmpty(this.yhteistyoKoulutustoimijatFormatted);
  }

  async peruutaYhteistyopyynto(event) {
    if (await this.$bvModal.msgBoxConfirm(this.$t('varmista-yhteistyopyynto-perutus', { nimi: this.$kaanna(event.nimi) }) as string, {
      title: this.$t('peruuta-yhteistyopyynto') as string,
      okVariant: 'primary',
      okTitle: this.$t('kylla') as string,
      cancelVariant: 'link',
      cancelTitle: this.$t('ei') as string,
      centered: true,
    })) {
      try {
        const kt = this.editointiStore!.data.value;
        const id = _.toString(event.id);
        if (this.ystavat && kt && _.includes(kt.ystavat, id)) {
          kt.ystavat.splice(_.indexOf(kt.ystavat, id), 1);
          await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
          this.$delete(this.ystavat, _.indexOf(this.ystavat, event));
          success('yhteistyopyynto-peruutettu');
          return;
        }
      }
      catch (err) {
        logger.error('yhteistyopyynto-peruutus-epaonnistui', err);
      }
      fail('yhteistyopyynto-peruutus-epaonnistui');
      this.fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
    }
  }

  async hylkaaYhteistyopyynto(event) {
    if (await this.$bvModal.msgBoxConfirm(this.$t('varmista-hylkaa-yhteistyopyynto', { nimi: this.$kaanna(event.nimi) }) as string, {
      title: this.$t('hylkaa-yhteistyopyynto') as string,
      okVariant: 'primary',
      okTitle: this.$t('hylkaa-yhteistyopyynto') as string,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as string,
      centered: true,
    })) {
      try {
        if (this.pyynnot) {
          await Koulutustoimijat.hylkaaYhteistyopyynto(event.id, _.toString(this.koulutustoimijaId));
          this.$delete(this.pyynnot, _.indexOf(this.pyynnot, event));
          success('yhteistyopyynto-hylkaa');
          return;
        }
      }
      catch (err) {
        logger.error('yhteistyopyynto-hylkaaminen-epaonnistui', err);
      }
      fail('yhteistyopyynto-hylkaaminen-epaonnistui');
      this.fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
    }
  }

  async hyvaksyYhteistyopyynto(event) {
    if (await this.$bvModal.msgBoxConfirm(this.$t('varmista-hyvaksy-yhteistyopyynto', { nimi: this.$kaanna(event.nimi) }) as string, {
      title: this.$t('hyvaksy-yhteistyopyynto') as string,
      okVariant: 'primary',
      okTitle: this.$t('hyvaksy-yhteistyopyynto') as string,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as string,
      centered: true,
    })) {
      try {
        const kt = this.editointiStore!.data.value;
        const id = _.toString(event.id);
        if (this.ystavat && this.pyynnot && kt && !_.includes(kt.ystavat, id)) {
          kt.ystavat.push(id);
          await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
          this.$delete(this.pyynnot, _.indexOf(this.pyynnot, event));
          this.ystavat.push({
            ...event,
            status: 'yhteistyo',
          });
          success('yhteistyopyynto-hyvaksytty');
          return;
        }
      }
      catch (err) {
        logger.error('yhteistyopyynto-lahetys-epaonnistui', err);
      }
      fail('yhteistyopyynto-hyvaksyminen-epaonnistui');
      this.fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
    }
  }

  async lopetaYhteistyo(event) {
    if (await this.$bvModal.msgBoxConfirm(this.$t('varmista-lopeta-yhteistyopyynto', { nimi: this.$kaanna(event.nimi) }) as string, {
      title: this.$t('lopeta-yhteistyo') as string,
      okVariant: 'primary',
      okTitle: this.$t('lopeta-yhteistyo') as string,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as string,
      centered: true,
    })) {
      try {
        const kt = this.editointiStore!.data.value;
        const id = _.toString(event.id);
        if (this.pyynnot && this.ystavat && kt && _.includes(kt.ystavat, id)) {
          kt.ystavat.splice(_.indexOf(kt.ystavat, id), 1);
          await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
          await Koulutustoimijat.hylkaaYhteistyopyynto(event.id, _.toString(kt.id));
          this.$delete(this.ystavat, _.indexOf(this.ystavat, event));
          success('yhteistyo-lopetettu');
          return;
        }
      }
      catch (err) {
        logger.error('yhteistyo-lopetus-epaonnistui', err);
      }
      fail('yhteistyo-lopetus-epaonnistui');
      this.fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
    }
  }

  async lahetaYhteistyopyynto(event) {
    if (await this.$bvModal.msgBoxConfirm(this.$t('varmista-laheta-yhteistyopyynto', { nimi: this.$kaanna(event.nimi) }) as string, {
      title: this.$t('laheta-yhteistyopyynto') as string,
      okVariant: 'primary',
      okTitle: this.$t('laheta-yhteistyopyynto') as string,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as string,
      centered: true,
    })) {
      try {
        const kt = this.editointiStore!.data.value;
        const id = _.toString(event.id);
        if (this.ystavat && kt && !_.includes(kt.ystavat, id)) {
          kt.ystavat.push(id);
          await Koulutustoimijat.updateKoulutustoimija(_.toString(kt.id), kt);
          this.ystavat.push({
            ...event,
            status: 'odotetaan',
          });
          success('yhteistyopyynto-lahetetty');
          return;
        }
      }
      catch (err) {
        logger.error('yhteistyopyynto-lahetys-epaonnistui', err);
      }
      fail('yhteistyopyynto-lahetys-epaonnistui');
      this.fetch(); // Näkymän sisältö muuttunut välissä? Ladataan näkymän sisältö uudestaan.
    }
  }
}
</script>

<style scoped lang="scss">
.organisaatio-title {
  font-size: 1.25rem;
  margin-bottom: 0;
}

ul.colors-menu {
  padding: 0;
  li {
    font-size: 0.8rem;
    font-weight: 300;
    display: inline-block;

    margin-left: 1rem;
    padding-left: 1.5rem;
    position: relative;

    &:before {
      content: '\2B24';
      font-size: 1rem;
      position: absolute;
      top: -0.3rem;
      left: 0rem;
      color-adjust: exact;
      -webkit-print-color-adjust: exact
    }

    &:first-child {
      margin-left: 0;
    }
  }

  .oma {
    &:before {
      color: #E60895;
    }
  }

  .odotetaan {
    &:before {
      color: #99B3F1;
    }
  }

  .pyynto {
    &:before {
      color: #FFCD32;
    }
  }

  .yhteistyo {
    &:before {
      color: #BEEAA0;
    }
  }
}

/deep/ .toiminto-cell {
  width: 30%;
}

</style>

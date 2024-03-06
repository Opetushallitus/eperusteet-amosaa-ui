<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero" :muokkausOikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      <template v-slot:header="{ data }">
        <h2 class="m-0" v-if="data.opintokokonaisuus.koodiArvo">{{ $kaanna(data.opintokokonaisuus.kooditettuNimi) }}</h2>
        <h2 class="m-0" v-else>{{ $kaanna(data.tekstiKappale.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation, data: { opintokokonaisuus }, data: { opintokokonaisuus: { tyyppi } } }">
        <b-row>
          <b-col md="7" v-if="tyyppi === TyyppiSource.OMA || tyyppi === TyyppiSource.PERUSTEESTA && !isEditing">
            <b-form-group
              :label="$t(tyyppikielistys['nimiotsikko']) + (isEditing ? ' *' : '')"
              required>
              <EpField
                v-if="opintokokonaisuus.koodiArvo"
                v-model="opintokokonaisuus.kooditettuNimi"/>
              <EpField
                v-else
                v-model="data.tekstiKappale.nimi"
                :is-editing="isEditing"
                :validation="validation.tekstiKappale.nimi"/>
            </b-form-group>
          </b-col>
          <b-col md="3">
            <b-form-group :label="$t('laajuus')">
              <EpLaajuusYksikkoInput
                v-model="data.opintokokonaisuus"
                :is-editing="isEditing"
                :validation="validation.opintokokonaisuus">
              </EpLaajuusYksikkoInput>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="10">
            <b-form-group>
              <div slot="label" class="d-flex align-items-center">
                <div>{{$t('opintokokonaisuuden-koodi')}}</div>
                <div class="ml-4 default-icon clickable" v-b-popover.hover.right="$t('opintokokonaisuus-koodi-selite')">
                  <EpMaterialIcon icon-shape="outlined">info</EpMaterialIcon>
                </div>
              </div>
              <div v-if="opintokokonaisuus.koodiArvo">{{opintokokonaisuus.koodiArvo}}</div>
              <div v-else class="font-italic">{{$t('koodi-generoidaan-julkaisussa')}}</div>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="10">
            <b-form-group :label="$t('kuvaus') + (isEditing && tyyppi === TyyppiSource.OMA ? ' *' : '')" required>
              <EpContent
                v-model="opintokokonaisuus.kuvaus"
                layout="normal"
                :is-editable="isEditing && tyyppi === TyyppiSource.OMA"
                :validation="validation.opintokokonaisuus.kuvaus"
                :kuvaHandler="kuvaHandler"/>
            </b-form-group>
          </b-col>
        </b-row>
        <hr/>
        <h3 class="pt-3">{{ $t(tyyppikielistys['tavoiteotsikko']) }}</h3>
        <b-row>
          <b-col md="10">
            <b-form-group :label="$t('tavoitteiden-otsikko') + (isEditing && !isOpsPohja ? ' *' : '')" required>
              <ep-input
                v-model="opintokokonaisuus.opetuksenTavoiteOtsikko"
                :is-editing="isEditing"
                :validation="validation.opintokokonaisuus.opetuksenTavoiteOtsikko"/>
            </b-form-group>
            <h4 class="pb-2">{{ $t('tavoitteiden-kuvaus') }}</h4>
            <b-form-group v-if="isEditing || opintokokonaisuus.tavoitteidenKuvaus && !isEditing">
              <EpContent
                v-model="opintokokonaisuus.tavoitteidenKuvaus"
                layout="normal"
                :is-editable="isEditing"
                :kuvaHandler="kuvaHandler"/>
            </b-form-group>
            <EpAlert
              v-if="!opintokokonaisuus.tavoitteidenKuvaus && !isEditing"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"/>
          </b-col>
        </b-row>
        <b-form-group :label="$t('tavoitteet') + (isEditing && !isOpsPohja ? ' *' : '')" required>
          <div v-if="isEditing">
            <draggable
              v-bind="tavoitteetOptions"
              tag="div"
              v-model="opintokokonaisuus.tavoitteet">
              <b-row v-for="(tavoiteItem, index) in opintokokonaisuus.tavoitteet" :key="tavoiteItem.id" class="pb-2">
                <b-col cols="11" md="10">
                  <EpKoodistoSelect
                    :store="koodisto"
                    :value="opintokokonaisuus.tavoitteet[index]"
                    @add="updateTavoiteByIndex($event, index)"
                    :is-editing="isEditing"
                    :naytaArvo="false">
                    <template #default="{ open }">
                      <b-input-group>
                        <EpInput
                          v-model="tavoiteItem.tavoite"
                          :is-editing="isEditing"
                          :disabled="tavoiteItem.perusteesta || !!tavoiteItem.tavoiteKoodi"
                          :validation="validation.opintokokonaisuus.tavoitteet.$each.$iter[index].tavoite"
                          class="input-wrapper">
                          <div class="order-handle m-2" slot="left">
                            <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                          </div>
                        </EpInput>
                        <b-input-group-append>
                          <b-button @click="open" variant="primary">
                            {{ $t('hae-koodistosta') }}
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </template>
                  </EpKoodistoSelect>
                </b-col>
                <b-col cols="1" v-if="isEditing && !tavoiteItem.perusteesta">
                  <div class="default-icon clickable mt-2" @click="onRemoveListItem(tavoiteItem, 'tavoitteet')">
                    <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </draggable>
            <EpButton variant="outline" icon="add" @click="onAddListItem('tavoitteet')" v-if="isEditing">
              {{ $t('lisaa-tavoite') }}
            </EpButton>
          </div>
          <div v-else>
            <ul>
              <li v-for="tavoiteItem in opintokokonaisuus.tavoitteet" :key="tavoiteItem.id">
                {{ $kaanna(tavoiteItem.tavoite)}}
              </li>
            </ul>
          </div>
        </b-form-group>
        <hr/>
        <h3 class="py-3">{{ $t('keskeiset-sisallot') }}</h3>
        <b-row>
          <b-col md="10">
            <b-form-group v-if="isEditing || opintokokonaisuus.keskeisetSisallot && !isEditing">
              <EpContent
                v-model="opintokokonaisuus.keskeisetSisallot"
                layout="normal"
                :is-editable="isEditing"
                :kuvaHandler="kuvaHandler"/>
            </b-form-group>
            <EpAlert
              v-if="!opintokokonaisuus.keskeisetSisallot && !isEditing"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"/>
          </b-col>
        </b-row>
        <hr/>
        <h3 class="pt-3">{{ $t('arviointi') }}</h3>
        <b-row>
          <b-col md="10" class="py-3">
            <h4 class="pb-2">{{ $t('arvioinnin-kuvaus') }}</h4>
            <b-form-group v-if="isEditing || opintokokonaisuus.arvioinninKuvaus && !isEditing">
              <EpContent
                v-model="opintokokonaisuus.arvioinninKuvaus"
                layout="normal"
                :is-editable="isEditing"
                :kuvaHandler="kuvaHandler"/>
            </b-form-group>
            <EpAlert
              v-if="!opintokokonaisuus.arvioinninKuvaus && !isEditing"
              :text="$t('ei-sisaltoa') + '. ' + $t('kirjoita-sisaltoa-valitsemalla-muokkaa') + '.'"
              class="pb-3"/>
          </b-col>
        </b-row>
        <b-form-group :label="$t('opiskelijan-osaamisen-arvioinnin-kohteet') + (isEditing && !isOpsPohja ? ' *' : '')" required>
          <div v-if="isEditing">
            <draggable
              v-bind="arvioinnitOptions"
              tag="div"
              v-model="opintokokonaisuus.arvioinnit">

              <b-row v-for="(arviointiItem, index) in opintokokonaisuus.arvioinnit" :key="arviointiItem.id" class="pb-2">
                <b-col md="10">
                  <EpInput
                    v-model="arviointiItem.arviointi"
                    :is-editing="isEditing"
                    :disabled="arviointiItem.perusteesta"
                    :validation="validation.opintokokonaisuus.arvioinnit.$each.$iter[index].arviointi">
                    <div class="order-handle m-2" slot="left">
                      <EpMaterialIcon>drag_indicator</EpMaterialIcon>
                    </div>
                  </EpInput>
                </b-col>
                <b-col cols="1" v-if="isEditing && !arviointiItem.perusteesta">
                  <div class="default-icon clickable mt-2" @click="onRemoveListItem(arviointiItem, 'arvioinnit')">
                    <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
                  </div>
                </b-col>
              </b-row>
            </draggable>

            <div class="d-flex">
              <EpButton variant="outline" icon="add" @click="onAddListItem('arvioinnit')" v-if="isEditing">
                {{ $t('lisaa-arvioinnin-kohde') }}
              </EpButton>
              <EpOpintokokonaisuusArviointiImport
                v-if="isEditing && hasPohja"
                :toteutussuunnitelmaId="toteutussuunnitelmaId"
                :koulutustoimijaId="koulutustoimijaId"
                :addArvioinnit="addPohjanArvioinnit"/>
            </div>
          </div>
          <div v-else>
            <ul>
              <li v-for="arviointiItem in opintokokonaisuus.arvioinnit" :key="arviointiItem.id">
                {{ $kaanna(arviointiItem.arviointi)}}
              </li>
            </ul>
          </div>
        </b-form-group>
      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpLaajuusYksikkoInput from '@shared/components/forms/EpLaajuusYksikkoInput.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { Koodisto } from '@shared/api/eperusteet';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { Murupolku } from '@shared/stores/murupolku';
import { OpetussuunnitelmaDtoTyyppiEnum } from '@shared/api/amosaa';
import EpOpintokokonaisuusArviointiImport from '@/components/EpOpintokokonaisuusArviointiImport/EpOpintokokonaisuusArviointiImport.vue';

enum TyyppiSource {
  PERUSTEESTA = 'perusteesta',
  OMA = 'oma'
}

@Component({
  components: {
    EpEditointi,
    EpField,
    EpContent,
    EpLaajuusYksikkoInput,
    EpInput,
    EpButton,
    EpAlert,
    EpKoodistoSelect,
    draggable,
    EpOpintokokonaisuusArviointiImport,
    EpMaterialIcon,
  },
})
export default class RouteOpintokokonaisuus extends Vue {
  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  @Prop({ required: true })
  private sisaltoviiteId!: number;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  private editointiStore: EditointiStore | null = null;

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'opintokokonaisuustavoitteet',
    async query(query: string, sivu = 0, koodisto) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  TyyppiSource = TyyppiSource;

  @Watch('sisaltoviiteId', { immediate: true })
  sisaltoviiteChange() {
    this.fetch();
  }

  @Watch('versionumero', { immediate: true })
  versionumeroChange() {
    this.fetch();
  }

  fetch() {
    this.editointiStore = new EditointiStore(
      new OpintokokonaisuusStore(
        this.toteutussuunnitelmaId,
        this.koulutustoimijaId,
        this.sisaltoviiteId,
        this.versionumero,
        this,
        this.toteutussuunnitelmaStore.toteutussuunnitelma,
        () => this.toteutussuunnitelmaStore.initNavigation()));
  }

  updateTavoiteByIndex(val, index) {
    const updatedTavoitteet = [...this.editointiStore?.data.value.opintokokonaisuus.tavoitteet];
    updatedTavoitteet[index] = {
      perusteesta: false,
      tavoite: val.nimi,
      tavoiteKoodi: val.uri,
    };

    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      opintokokonaisuus: {
        ...this.editointiStore?.data.value.opintokokonaisuus,
        tavoitteet: [
          ...updatedTavoitteet,
        ],
      },
    });
  }

  onAddListItem(array: string, values?) {
    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      opintokokonaisuus: {
        ...this.editointiStore?.data.value.opintokokonaisuus,
        [array]: [
          ..._.get(this.editointiStore?.data.value.opintokokonaisuus, array),
          {
            perusteesta: false,
            ...(!_.isEmpty(values) && values),
          },
        ],
      },
    });
  }

  onRemoveListItem(poistettavaRivi: { [key: string]: any }, array: string) {
    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      opintokokonaisuus: {
        ...this.editointiStore?.data.value.opintokokonaisuus,
        [array]: _.filter(_.get(this.editointiStore?.data.value.opintokokonaisuus, array), rivi => rivi !== poistettavaRivi),
      },
    });
  }

  get versionumero() {
    return _.toNumber(this.$route.query.versionumero);
  }

  get defaultDragOptions() {
    return {
      animation: 300,
      emptyInsertThreshold: 10,
      handle: '.order-handle',
      disabled: !this.editointiStore!.isEditing,
      ghostClass: 'dragged',
    };
  }

  get tavoitteetOptions() {
    return {
      ...this.defaultDragOptions,
      group: {
        name: 'tavoitteet',
      },
    };
  }

  get arvioinnitOptions() {
    return {
      ...this.defaultDragOptions,
      group: {
        name: 'arvioinnit',
      },
    };
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.toteutussuunnitelmaId, this.koulutustoimijaId));
  }

  get opintokokonaisuustyyppi() {
    return this.editointiStore?.data.value?.opintokokonaisuus.tyyppi;
  }

  @Watch('opintokokonaisuustyyppi')
  tyyppiChange(val) {
    if (this.tyyppikielistys) {
      Murupolku.aseta('opintokokonaisuus', this.$t(this.tyyppikielistys['murupolku']));
    }
  }

  get tyyppikielistys() {
    return this.tyyppitekstit[this.opintokokonaisuustyyppi];
  }

  get tyyppitekstit() {
    return {
      [TyyppiSource.OMA]: {
        nimiotsikko: 'opintokokonaisuuden-nimi',
        tavoiteotsikko: 'osaamistavoitteet',
        murupolku: 'opintokokonaisuus',
      },
      [TyyppiSource.PERUSTEESTA]: {
        nimiotsikko: 'osaamiskokonaisuuden-nimi',
        tavoiteotsikko: 'opetuksen-tavoitteet',
        murupolku: 'osaamiskokonaisuus',
      },
    };
  }

  get isOpsPohja() {
    return this.toteutussuunnitelmaStore.toteutussuunnitelma.value?.tyyppi === _.toLower(OpetussuunnitelmaDtoTyyppiEnum.OPSPOHJA);
  }

  get hasPohja() {
    return _.get(this.toteutussuunnitelmaStore.toteutussuunnitelma.value, '_pohja');
  }

  addPohjanArvioinnit(arvioinnit) {
    _.forEach(arvioinnit, arviointi => this.onAddListItem('arvioinnit',
      {
        'arviointi': {
          ...arviointi,
        },
      }));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep fieldset {
    padding-right: 0;
  }

  ::v-deep .input-wrapper {
    flex: 1 1 0;

    input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
</style>

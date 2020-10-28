<template>
  <div id="scroll-anchor" v-if="editointiStore" >
    <EpEditointi :store="editointiStore" :versionumero="versionumero">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.tekstiKappale.nimi) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing, validation }">
        <b-row>
          <b-col md="7">
            <b-form-group :label="$t('opintokokonaisuuden-nimi') + (isEditing ? ' *' : '')" required>
              <EpField v-model="data.tekstiKappale.nimi" :is-editing="isEditing"/>
            </b-form-group>
          </b-col>
          <b-col md="3">
            <b-form-group :label="$t('minimilaajuus') + (isEditing ? ' *' : '')" required>
              <EpLaajuusInput v-model="data.opintokokonaisuus.minimilaajuus" :is-editing="isEditing">
                {{$t('opintopiste')}}
              </EpLaajuusInput>
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col md="10">
            <b-form-group :label="$t('kuvaus')  + (isEditing ? ' *' : '')" required>
              <EpContent
                v-model="data.opintokokonaisuus.kuvaus"
                layout="normal"
                :is-editable="isEditing"/>
            </b-form-group>
          </b-col>
        </b-row>
        <hr/>
        <h3 class="pt-3">{{ $t('opetuksen-tavoitteet') }}</h3>
        <b-row>
          <b-col md="10">
            <b-form-group :label="$t('tavoitteiden-otsikko')  + (isEditing ? ' *' : '')" required>
              <EpInput
                v-model="data.opintokokonaisuus.opetuksenTavoiteOtsikko"
                :is-editing="isEditing"/>
            </b-form-group>
            <b-form-group :label="$t('tavoitteet')  + (isEditing ? ' *' : '')" required>
              <div v-if="isEditing">
                <draggable
                  v-bind="tavoitteetOptions"
                  tag="div"
                  v-model="data.opintokokonaisuus.tavoitteet">

                  <b-row v-for="tavoiteItem in data.opintokokonaisuus.tavoitteet" :key="tavoiteItem.id" class="pb-2">
                    <b-col cols="10" lg="8">
                      <EpInput v-model="tavoiteItem.tavoite" :is-editing="isEditing" :disabled="tavoiteItem.uri !== undefined">
                        <div class="order-handle m-2" slot="left">
                          <fas icon="grip-vertical"></fas>
                        </div>
                      </EpInput>
                    </b-col>
                    <b-col cols="1" v-if="isEditing">
                      <fas icon="roskalaatikko" class="default-icon clickable mt-2" @click="onRemoveListItem(tavoiteItem, 'tavoitteet')"/>
                    </b-col>
                  </b-row>
                </draggable>

                <EpButton variant="outline" icon="plus" @click="onAddListItem('tavoitteet')" v-if="isEditing">
                  {{ $t('lisaa-tavoite') }}
                </EpButton>
              </div>
              <div v-else>
                <ul>
                  <li v-for="tavoiteItem in data.opintokokonaisuus.tavoitteet" :key="tavoiteItem.id">
                    {{ $kaanna(tavoiteItem.tavoite)}}
                  </li>
                </ul>
              </div>
            </b-form-group>
          </b-col>
        </b-row>
        <hr/>
        <h3 class="pt-3">{{ $t('keskeiset-sisallot') }}</h3>
        <b-row>
          <b-col>
            <b-form-group v-if="isEditing || data.opintokokonaisuus.keskeisetSisallot && !isEditing">
              <EpContent
                v-model="data.opintokokonaisuus.keskeisetSisallot"
                layout="normal"
                :is-editable="isEditing"/>
            </b-form-group>
            <p v-if="!data.opintokokonaisuus.keskeisetSisallot && !isEditing">{{ $t('ei-sisaltoa') }}</p>
          </b-col>
        </b-row>
        <hr/>
        <h3 class="pt-3">{{ $t('arviointi') }}</h3>
        <b-row>
          <b-col class="py-3">
            <h4>{{ $t('arvioinnin-kuvaus') }}</h4>
            <p v-if="data.opintokokonaisuus.arvioinninKuvaus">Content</p>
            <p v-else>{{ $t('ei-sisaltoa') }}</p>
            <h4>{{ $t('opiskelijan-osaamisen-arvioinnin-kohteet') }}</h4>
            <ul>
              <li v-for="arviointiItem in data.opintokokonaisuus.arvioinnit" :key="arviointiItem.id">
                {{$kaanna(arviointiItem.arviointi)}}
              </li>
            </ul>
          </b-col>
        </b-row>
      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Mixins, Component, Vue, Watch } from 'vue-property-decorator';
import draggable from 'vuedraggable';

import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpLaajuusInput from '@shared/components/forms/EpLaajuusInput.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpintokokonaisuusStore } from '@/stores/OpintokokonaisuusStore';

@Component({
  components: {
    EpEditointi,
    EpField,
    EpContent,
    EpLaajuusInput,
    EpInput,
    EpButton,
    draggable,
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
        () => this.toteutussuunnitelmaStore.initNavigation(this.koulutustoimijaId, this.toteutussuunnitelmaId)));
  }

  onAddListItem(array: string) {
    this.editointiStore?.setData({
      ...this.editointiStore?.data.value,
      opintokokonaisuus: {
        ...this.editointiStore?.data.value.opintokokonaisuus,
        [array]: [
          ..._.get(this.editointiStore?.data.value.opintokokonaisuus, array),
          { perusteesta: false },
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
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep fieldset {
    padding-right: 0px;
  }

  .container {
    margin-left: 0;
    margin-right: 0;
  }

</style>

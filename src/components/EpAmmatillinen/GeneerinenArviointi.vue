<template>
  <div v-if="vaihtoehdot">
    <slot name="header">
      <h4>{{ $t('arviointi') }}</h4>
    </slot>
    <div v-if="isEditing">
      <b-form-group>
        <b-form-radio v-model="model"
                      v-for="vaihtoehto in vaihtoehdot"
                      :value="vaihtoehto.id"
                      :key="vaihtoehto.id">{{ $kaanna(vaihtoehto.nimi) }}</b-form-radio>
      </b-form-group>
    </div>
    <div v-else>
      <div v-if="valittu && osaamistasot">
        <ep-form-content class="m-3">
          <div>{{$kaanna(valittu.kohde)}}</div>
          <b-container fluid class="osaamistasot mt-3">
            <b-row v-for="(osaamistasonKriteeri,index) in valittu.osaamistasonKriteerit" :key="'osaamistasokriteeri'+index">
              <b-col class="pt-3" md="12" lg="4">
                <span>{{$kaanna(osaamistasot[osaamistasonKriteeri._osaamistaso].otsikko)}}</span>
              </b-col>
              <b-col class="pt-3" md="12" lg="8">
                <ul class="pl-3">
                  <li v-for="(kriteeri, index) in osaamistasonKriteeri.kriteerit" :key="'kriteeri'+index">
                    {{$kaanna(kriteeri)}}
                  </li>
                </ul>
              </b-col>
            </b-row>
          </b-container>
        </ep-form-content>
      </div>
      <div v-else class="alert alert-warning">
        {{ $t('arviointia-ei-valittu') }}
      </div>

    </div>
  </div>
  <EpSpinner v-else />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { PerusteetStore } from '@/stores/PerusteetStore';
import * as _ from 'lodash';

@Component({
  components: {
    EpFormContent,
    EpSpinner,
  },
})
export default class GeneerinenArviointi extends Vue {
  @Prop({ required: true })
  isEditing!: boolean;

  @Prop({ required: true })
  value!: any;

  private vaihtoehdot = null as any | null;
  private asteikot = null as any | null;

  get model() {
    return this.value;
  }

  set model(val) {
    this.$emit('input', val);
  }

  get vaihtoehdotMap() {
    if (!this.vaihtoehdot) {
      return {};
    }
    return _.keyBy(this.vaihtoehdot, 'id');
  }

  get valittu() {
    if (this.value) {
      return this.vaihtoehdotMap[this.value] || null;
    }
    return null;
  }

  get osaamistasot() {
    if (this.asteikot && this.valittu && this.valittu._arviointiAsteikko) {
      return this.asteikot[this.valittu._arviointiAsteikko].osaamistasot || null;
    }
    return null;
  }

  async mounted() {
    this.vaihtoehdot = await PerusteetStore.fetchGeneeriset();
    this.asteikot = await PerusteetStore.fetchArviointiasteikot();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .osaamistasot {
    .row:nth-of-type(even) {
      background-color: $table-even-row-bg-color;
    }
    .row:nth-of-type(odd) {
      background-color: $table-odd-row-bg-color;
    }
  }

</style>

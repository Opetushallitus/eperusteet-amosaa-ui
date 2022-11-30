<template>
  <div v-if="!arviointi">
    <div class="alert alert-danger">{{ $t('virheellinen-arviointi') }}</div>
  </div>
  <ep-form-content v-else class="col-md-12 mb-5">
    <slot name="header">
    </slot>
    <div>{{$kaanna(arviointi.kohde)}}</div>
    <b-container fluid="lg" class="osaamistasot mt-3">
      <b-row v-for="(osaamistaso, index) in arviointi.osaamistasonKriteerit" :key="'osaamistasokriteeri'+index">
        <b-col class="pt-3" md="12" lg="4">
          <span>{{$kaanna(osaamistaso.osaamistaso.otsikko)}}</span>
        </b-col>
        <b-col class="pt-3" md="12" lg="8">
          <ul class="pl-3">
            <li v-for="(kriteeri, index) in osaamistaso.kriteerit" :key="'kriteeri'+index">
              {{$kaanna(kriteeri)}}
            </li>
          </ul>
        </b-col>
      </b-row>
    </b-container>
  </ep-form-content>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import * as _ from 'lodash';

@Component({
  components: {
    EpFormContent,
    EpAlert,
  },
})
export default class GeneerinenArviointiTaulukko extends Vue {
  @Prop({ required: true })
  private arviointi!: any;

  get osaamistasonKriteeritFields() {
    return [{
      key: 'osaamistaso',
      label: this.$t('osaamistaso') as string,
      thStyle: { display: 'none' },
    }, {
      key: 'kriteerit',
      label: this.$t('kriteerit') as string,
      thStyle: { display: 'none' },
    }] as any[];
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

<template>
  <div>
    <b-row>
      <b-col md="10">
        <b-form-group :label="$t('osaamismerkkien-suorittaminen')" required>
          <EpContent v-model="value.kuvaus"
                     layout="normal"
                     :is-editable="isEditing"
                     :kuvaHandler="kuvaHandler"/>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="10">
        <b-form-group :label="$t('osaamismerkit')">
          <div v-for="(merkki, idx) in osaamismerkkiKoodit" :key="idx" class="p-3 rivi">
            <div v-if="isEditing" class="d-flex">
              <div>{{ $kaanna(merkki.nimi) }} ({{merkki.koodi}})</div>
              <div class="default-icon clickable ml-auto" @click="onRemoveListItem(merkki)">
                <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
              </div>
            </div>
            <div v-else>
              <EpLinkki :url="merkki.url">
                <div>{{ $kaanna(merkki.nimi) }} ({{merkki.koodi}})</div>
              </EpLinkki>
            </div>
          </div>
          <EpKoodistoSelect :store="koodisto"
                            @add="onAddListItem($event)"
                            :is-editing="isEditing"
                            :naytaArvo="true"
                            :multiple="true" class="mt-4">
            <template #default="{ open }">
              <b-input-group>
                <b-input-group-append>
                  <EpButton variant="outline" icon="add" @click="open" v-if="isEditing">
                    {{ $t('lisaa-osaamismerkkeja') }}
                  </EpButton>
                </b-input-group-append>
              </b-input-group>
            </template>
            <template v-slot:empty>
              <div v-if="value.osaamismerkkiKoodit && value.osaamismerkkiKoodit.length > 0"></div>
              <div v-else>
                {{ $t('ei-lisattyja-osaamismerkkeja') }}
              </div>
            </template>
          </EpKoodistoSelect>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpKoodistoSelect from '@shared/components/EpKoodistoSelect/EpKoodistoSelect.vue';
import { KoodistoSelectStore } from '@shared/components/EpKoodistoSelect/KoodistoSelectStore';
import { Koodisto } from '@shared/api/eperusteet';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { KuvaStore } from '@/stores/KuvaStore';
import { osaamismerkkiUrl } from '@shared/utils/esikatselu';
import { Kielet } from '@shared/stores/kieli';
import _ from 'lodash';
import EpLinkki from '@shared/components/EpLinkki/EpLinkki.vue';

@Component({
  components: {
    EpLinkki,
    EpKoodistoSelect,
    EpContent,
  },
})
export default class EpOsaamismerkkiKappale extends Vue {
  @Prop({ required: true })
  value!: any;

  @Prop({ required: false, default: false, type: Boolean })
  private isEditing!: Boolean;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'osaamismerkit',
    async query(query: string, sivu = 0, koodisto) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
        },
      })).data as any;
    },
  });

  get osaamismerkkiKoodit() {
    return _.map(this.value.osaamismerkkiKoodit, koodi => {
      return {
        ...koodi,
        url: osaamismerkkiUrl(Kielet.getSisaltoKieli.value, koodi.koodi),
      };
    });
  }

  onAddListItem(merkit) {
    this.$emit('addListItem', merkit);
  }

  onRemoveListItem(poistettavaRivi: any) {
    this.$emit('removeListItem', poistettavaRivi);
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.toteutussuunnitelmaId, this.koulutustoimijaId));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.rivi:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.rivi:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>

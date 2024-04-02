<template>
  <div>
    <b-row>
      <b-col md="10">
        <b-form-group :label="$t('osaamismerkkien-suorittaminen')" required>
          <EpContent v-model="innerModel.kuvaus"
                     layout="normal"
                     :is-editable="isEditing"
                     :kuvaHandler="kuvaHandler"/>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="10">
        <b-form-group :label="$t('osaamismerkit')">
          <div v-for="(merkki, idx) in osaamismerkkiKoodit" :key="'koodi-'+idx" class="p-3 rivi">
            <div v-if="isEditing" class="d-flex">
              <div class="d-flex">
                <span>{{ $kaanna(merkki.nimi) }} ({{merkki.koodi}})</span>
                <span v-if="merkki.vanhentunut" class="ml-2 vanhentunut">{{$t('vanhentunut')}}</span>
              </div>
              <div class="default-icon clickable ml-auto" @click="onRemoveListItem(merkki)">
                <EpMaterialIcon icon-shape="outlined">delete</EpMaterialIcon>
              </div>
            </div>
            <div v-else>
              <EpLinkki :url="merkki.url">
                <div class="d-flex">
                  <span>{{ $kaanna(merkki.nimi) }} ({{merkki.koodi}})</span>
                  <span v-if="merkki.vanhentunut" class="ml-2 vanhentunut">{{$t('vanhentunut')}}</span>
                </div>
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
              <div v-if="innerModel.osaamismerkkiKoodit && innerModel.osaamismerkkiKoodit.length > 0"></div>
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
  private value!: any;

  @Prop({ required: false, default: false, type: Boolean })
  private isEditing!: Boolean;

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelmaId!: number;

  private readonly koodisto = new KoodistoSelectStore({
    koodisto: 'osaamismerkit',
    async query(query: string, sivu = 0, koodisto, onlyValidKoodis) {
      return (await Koodisto.kaikkiSivutettuna(koodisto, query, {
        params: {
          sivu,
          sivukoko: 10,
          onlyValidKoodis: onlyValidKoodis,
        },
      })).data as any;
    },
  });

  onAddListItem(merkit) {
    this.innerModel = {
      ...this.innerModel,
      osaamismerkkiKoodit: [
        ...this.innerModel.osaamismerkkiKoodit,
        ...this.addMerkit(merkit),
      ],
    };
  }

  addMerkit(merkit) {
    return _.map(merkit, merkki => {
      return {
        nimi: merkki.nimi,
        koodi: merkki.arvo,
      };
    });
  }

  onRemoveListItem(poistettavaRivi: any) {
    this.innerModel = {
      ...this.innerModel,
      osaamismerkkiKoodit: _.filter(this.osaamismerkkiKoodit, rivi => rivi.koodi !== poistettavaRivi.koodi),
    };
  }

  get innerModel() {
    return this.value;
  }

  set innerModel(val) {
    this.$emit('input', val);
  }

  get osaamismerkkiKoodit() {
    return _.map(this.innerModel.osaamismerkkiKoodit, koodi => {
      return {
        ...koodi,
        url: osaamismerkkiUrl(Kielet.getSisaltoKieli.value, koodi.koodi),
        vanhentunut: this.isVanhentunut(koodi.voimassaLoppuPvm),
      };
    });
  }

  get kuvaHandler() {
    return createKuvaHandler(new KuvaStore(this.toteutussuunnitelmaId, this.koulutustoimijaId));
  }

  private isVanhentunut(voimassaLoppuPvm) {
    let currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    return voimassaLoppuPvm && _.toNumber(voimassaLoppuPvm) < currentDate.getTime();
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.vanhentunut {
  color: $invalid;
}

.rivi:nth-of-type(even) {
  background-color: $table-even-row-bg-color;
}
.rivi:nth-of-type(odd) {
  background-color: $table-odd-row-bg-color;
}
</style>

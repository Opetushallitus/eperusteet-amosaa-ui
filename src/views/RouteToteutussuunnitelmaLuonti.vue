<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:toteutussuunnitelma>

           <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-4 pt-0 " :label="$t('kayta-pohjana')+' *'">

                <b-form-radio class="p-2 pl-4 pt-3" v-if="opetussuunnitelmanTyyppi === 'ops'" v-model="pohjanTyyppi" value="peruste" name="pohjanTyyppi" :disabled="!perusteet || perusteet.length === 0">{{ $t('perusteprojektia') }}</b-form-radio>
                <b-form-radio class="p-2 pl-4" v-if="opetussuunnitelmanTyyppi === 'ops'" v-model="pohjanTyyppi" value="toteutussuunnitelma" name="pohjanTyyppi" :disabled="!toteutussuunnitelmat || toteutussuunnitelmat.length === 0">{{ $t('toista-toteutussuunnitelmaa') }}</b-form-radio>

                <b-form-radio class="p-2 pl-4" v-if="opetussuunnitelmanTyyppi === 'yleinen'" v-model="pohjanTyyppi" value="toteutussuunnitelma" name="pohjanTyyppi" :disabled="!toteutussuunnitelmat || toteutussuunnitelmat.length === 0">{{ $t('toista-jaettua-osaa') }}</b-form-radio>
                <b-form-radio class="p-2 pl-4" v-if="opetussuunnitelmanTyyppi === 'yleinen'" v-model="pohjanTyyppi" value="uusi" name="pohjanTyyppi">{{ $t('luo-uusi') }}</b-form-radio>

              </b-form-group>

              <b-form-group :label="pohjaOtsikko +' *'" v-if="pohjanTyyppi && pohjanTyyppi !== 'uusi'">
                <div v-if="pohjanTyyppi === 'peruste'">
                  <EpMultiSelect
                    v-if="perusteet"
                    v-model="peruste"
                    :placeholder="$t('valitse-perusteprojekti')"
                    :is-editing="true"
                    :options="perusteet"
                    :validation="$v.peruste">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

                <div v-if="pohjanTyyppi === 'toteutussuunnitelma'">
                  <EpMultiSelect
                    v-if="toteutussuunnitelmat"
                    v-model="toteutussuunnitelma"
                    :placeholder="pohjaValintaPlaceholder"
                    :is-editing="true"
                    :options="toteutussuunnitelmat"
                    :validation="$v.toteutussuunnitelma">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }}
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

              </b-form-group>

              <b-form-group :label="nimiOtsikko +' *'" v-if="pohjanTyyppi">
                <ep-field v-model="nimi" :is-editing="true" :validation="$v.nimi"></ep-field>
              </b-form-group>

            </div>
           </div>
        </template>

        <template v-slot:luo>
          <span v-if="opetussuunnitelmanTyyppi === 'ops'">
            {{$t('luo-toteutussuunnitelma')}}
          </span>
          <span v-if="opetussuunnitelmanTyyppi === 'yleinen'">
            {{$t('luo-jaettu-osa')}}
          </span>
        </template>

      </EpSteps>
    </b-container>
  </EpMainView>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';
import EpMainView from '@shared/components/EpMainView/EpMainView.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSteps, { Step } from '@shared/components/EpSteps/EpSteps.vue';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { requiredOneLang, minValue, notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import { ToteutussuunnitelmatStore } from '@/stores/ToteutussuunnitelmatStore';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaDto, Ulkopuoliset, PerusteDto } from '@shared/api/amosaa';
import { PerusteetStore } from '@/stores/PerusteetStore';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

@Component({
  components: {
    EpMainView,
    EpMultiSelect,
    EpField,
    EpSpinner,
    EpSteps,
  },
  validations() {
    return {
      ...this.validator,
    };
  },
} as any)
export default class RouteToteutussuunnitelmaLuonti extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmaPohjatStore!: ToteutussuunnitelmatStore;

  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: false })
  private perusteetStore!: PerusteetStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private opetussuunnitelmanTyyppi!: 'ops' | 'yleinen';

  @Prop({ required: false })
  private opetussuunnitelmanSuoritustapa!: string;

  private pohjanTyyppi: 'toteutussuunnitelma' | 'peruste' | null = null;

  private peruste: PerusteDto | null = null;
  private toteutussuunnitelma: OpetussuunnitelmaDto | null = null;
  private nimi: any | null = null;

  async mounted() {
    this.toteutussuunnitelmaPohjatStore.updateQuery(_.toNumber(this.koulutustoimijaId),
      {
        sivukoko: 1000,
        tila: ['poistettu', 'luonnos', 'valmis', 'julkaistu'],
        tyyppi: [this.opetussuunnitelmanTyyppi],
      });

    if (this.perusteetStore) {
      this.perusteetStore.updateQuery();
    }
  }

  @Watch('pohjanTyyppi')
  onPohjantyyppiChange() {
    this.peruste = null;
    this.toteutussuunnitelma = null;
  }

  get steps() {
    const self = this;
    return [{
      key: 'toteutussuunnitelma',
      name: this.opetussuunnitelmanTyyppi === 'ops' ? this.$t('uusi-toteutussuunnitelma') : this.$t('uusi-jaettu-osa'),
      isValid() {
        return !self.$v.$invalid;
      },
    }];
  }

  get pohjaOtsikko() {
    return this.opetussuunnitelmanTyyppi === 'ops' ? this.$t('toteutussuunnitelman-pohja') : this.$t('jaetun-osan-pohja');
  }

  get pohjaValintaPlaceholder() {
    return this.opetussuunnitelmanTyyppi === 'ops' ? this.$t('valitse-toteutussuunnitelma') : this.$t('valitse-jaettu-osa');
  }

  get nimiOtsikko() {
    return this.opetussuunnitelmanTyyppi === 'ops' ? this.$t('toteutussuunnitelman-nimi') : this.$t('jaetun-osan-nimi');
  }

  async onSave() {
    const luotu = await this.toteutussuunnitelmaStore.create(_.toString(this.koulutustoimijaId), {
      perusteId: this.peruste ? this.peruste.id : undefined,
      perusteDiaarinumero: this.peruste ? this.peruste.diaarinumero : undefined,
      opsId: this.toteutussuunnitelma ? this.toteutussuunnitelma.id : undefined,
      tyyppi: this.opetussuunnitelmanTyyppi as any,
      suoritustapa: this.opetussuunnitelmanSuoritustapa,
      nimi: this.nimi,
    });

    this.$router.push({
      name: 'toteutussuunnitelma',
      params: {
        toteutussuunnitelmaId: _.toString(luotu.id),
      },
    });
  }

  onCancel() {
    this.$router.push({
      name: 'toteutussuunnitelmat',
    });
  }

  get validator() {
    let validation = {
      nimi: {
        ...requiredLokalisoituTeksti(),
      },
    } as any;

    if (this.pohjanTyyppi === 'peruste') {
      validation = {
        ...validation,
        peruste: notNull(),
      };
    }

    if (this.pohjanTyyppi === 'toteutussuunnitelma') {
      validation = {
        ...validation,
        toteutussuunnitelma: notNull(),
      };
    }

    return validation;
  }

  get toteutussuunnitelmat() {
    if (this.toteutussuunnitelmaPohjatStore.opetussuunnitelmat.value) {
      return (this.toteutussuunnitelmaPohjatStore.opetussuunnitelmat.value as any).data;
    }
  }

  get perusteet() {
    if (this.perusteetStore) {
      return this.perusteetStore.perusteet.value;
    }
  }
}
</script>

<style lang="scss" scoped>

.tieto {
  padding: 20px 20px 20px 0px;

  .nimi {
    font-weight: 600;
  }
}

</style>

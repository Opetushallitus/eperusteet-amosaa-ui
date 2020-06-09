<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:toteutussuunnitelma>

           <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-4 pt-0 " :label="$t('kayta-pohjana')+' *'">
                <b-form-radio class="p-2 pl-4 pt-3" v-model="tyyppi" value="peruste" name="tyyppi" :disabled="!perusteet || perusteet.length === 0">{{ $t('perusteprojektia') }}</b-form-radio>
                <b-form-radio class="p-2 pl-4" v-model="tyyppi" value="toteutussuunnitelma" name="tyyppi" :disabled="!toteutussuunnitelmat || toteutussuunnitelmat.length === 0">{{ $t('toista-toteutussuunnitelmaa') }}</b-form-radio>
              </b-form-group>

              <b-form-group :label="$t('toteutussuunnitelman-pohja')+' *'" v-if="tyyppi">
                <div v-if="tyyppi === 'peruste'">
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

                <div v-if="tyyppi === 'toteutussuunnitelma'">
                  <EpMultiSelect
                    v-if="toteutussuunnitelmat"
                    v-model="toteutussuunnitelma"
                    :placeholder="$t('valitse-toteutussuunnitelma')"
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

              <b-form-group :label="$t('toteutussuunnitelman-nimi')+' *'" v-if="tyyppi">
                <ep-field v-model="nimi" :is-editing="true" :validation="$v.nimi"></ep-field>
              </b-form-group>

            </div>
           </div>
        </template>

        <template v-slot:luo>
          {{$t('luo-toteutussuunnitelma')}}
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

  @Prop({ required: true })
  private perusteetStore!: PerusteetStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  private tyyppi: 'toteutussuunnitelma' | 'peruste' | null = null;

  private peruste: PerusteDto | null = null;
  private toteutussuunnitelma: OpetussuunnitelmaDto | null = null;
  private nimi: any | null = null;

  async mounted() {
    this.toteutussuunnitelmaPohjatStore.updateQuery(_.toNumber(this.koulutustoimijaId),
      {
        sivukoko: 1000,
        tila: ['poistettu', 'luonnos', 'valmis', 'julkaistu'],
        tyyppi: ['ops'],
      });

    this.perusteetStore.updateQuery();
  }

  @Watch('tyyppi')
  onTyyppiChange() {
    this.peruste = null;
    this.toteutussuunnitelma = null;
  }

  get steps() {
    const self = this;
    return [{
      key: 'toteutussuunnitelma',
      name: this.$t('uusi-toteutussuunnitelma'),
      isValid() {
        return !self.$v.$invalid;
      },
    }];
  }

  async onSave() {
    const luotu = await this.toteutussuunnitelmaStore.create(_.toString(this.koulutustoimijaId), {
      perusteId: this.peruste ? this.peruste.id : undefined,
      perusteDiaarinumero: this.peruste ? this.peruste.diaarinumero : undefined,
      opsId: this.toteutussuunnitelma ? this.toteutussuunnitelma.id : undefined,
      tyyppi: 'ops' as any,
      suoritustapa: 'reformi',
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

    if (this.tyyppi === 'peruste') {
      validation = {
        ...validation,
        peruste: notNull(),
      };
    }

    if (this.tyyppi === 'toteutussuunnitelma') {
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
    return _.sortBy(this.perusteetStore.perusteet.value, [(peruste: any) => {
      return this.$kaanna(peruste.nimi);
    }]);
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

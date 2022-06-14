<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:pohja>

          <div class="row">
            <div class="col-sm-10 mb-4">

              <b-form-group :label="$t(kielistykset['nimi']) +' *'">
                <ep-field v-model="nimi" :is-editing="true" :validation="$v.nimi"></ep-field>
              </b-form-group>

            </div>
          </div>

          <div class="row" v-if="perusteValinta">
            <div class="col-sm-10 mb-4">

              <b-form-group :label="$t('peruste') +' *'">
                <EpMultiSelect
                  v-if="perusteet"
                  v-model="peruste"
                  :is-editing="true"
                  :options="perusteet"
                  :validation="$v.peruste"
                  :search-identity="nimiSearchIdentity">
                  <template slot="singleLabel" slot-scope="{ option }">
                    {{ $kaanna(option.nimi) }} ({{option.diaarinumero}}<span v-if="option.voimassaoloAlkaa">, {{$sd(option.voimassaoloAlkaa)}}</span>)
                  </template>
                  <template slot="option" slot-scope="{ option }">
                    {{ $kaanna(option.nimi) }} ({{option.diaarinumero}}<span v-if="option.voimassaoloAlkaa">, {{$sd(option.voimassaoloAlkaa)}}</span>)
                  </template>
                </EpMultiSelect>
                <EpSpinner v-else />
              </b-form-group>

            </div>
          </div>
        </template>

        <template v-slot:luo>
          <span>
            {{$t('luo-pohja')}}
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
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSteps, { Step } from '@shared/components/EpSteps/EpSteps.vue';
import * as _ from 'lodash';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaLuontiDtoTyyppiEnum, PerusteDto } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';
import { notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import { OpetussuunnitelmaPohjaLuontiStepSetups } from '@/utils/toteutustypes';
import { PerusteetStore } from '@/stores/PerusteetStore';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import { Validations } from 'vuelidate-property-decorators';
import { Toteutus } from '@shared/utils/perusteet';

@Component({
  components: {
    EpMainView,
    EpField,
    EpSpinner,
    EpSteps,
    EpMultiSelect,
  },
} as any)
export default class RouteOpsPohjaLuonti extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: false })
  private perusteetStore!: PerusteetStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  private nimi: any | null = null;
  private peruste: PerusteDto | null = null;

  async mounted() {
    if (this.perusteetStore && this.perusteValinta) {
      this.perusteetStore.fetchJulkaistutPerusteet();
    }
  }

  get perusteet() {
    if (this.perusteetStore && this.perusteetStore.perusteetKevyt.value) {
      return _.sortBy(this.perusteetStore.perusteetKevyt.value, [(peruste: any) => {
        return this.$kaanna(peruste.nimi);
      }]);
    }

    return undefined;
  }

  get steps() {
    const self = this;
    return [{
      key: 'pohja',
      name: this.$t(this.kielistykset['stepName']),
      isValid() {
        return !self.$v.$invalid;
      },
    }];
  }

  async onSave() {
    try {
      const luotu = await this.toteutussuunnitelmaStore.create(_.toString(this.koulutustoimijaId), {
        tyyppi: OpetussuunnitelmaLuontiDtoTyyppiEnum.OPSPOHJA,
        suoritustapa: 'reformi',
        koulutustyyppi: OpetussuunnitelmaPohjaLuontiStepSetups[this.toteutus]['koulutustyyppi'] as any,
        nimi: this.nimi,
        perusteId: this.peruste?.id,
      });

      this.$router.push({
        name: 'toteutussuunnitelma',
        params: {
          toteutussuunnitelmaId: _.toString(luotu.id),
        },
      });
    }
    catch (e) {
      createLogger('RouteToteutussuunnitelmaLuonti').error(e);
      this.$fail(this.$t('virhe-palvelu-virhe') as string);
    }
  }

  onCancel() {
    this.$router.push({
      name: 'opetussuunnitelmaPohjatListaus',
    });
  }

  @Validations()
    validations = {
      nimi: {
        ...requiredLokalisoituTeksti(),
      },
      ...(this.perusteValinta && { peruste: notNull() }),
    }

  get kielistykset() {
    return OpetussuunnitelmaPohjaLuontiStepSetups[this.toteutus];
  }

  get perusteValinta() {
    return OpetussuunnitelmaPohjaLuontiStepSetups[this.toteutus]['perustevalinta'];
  }

  nimiSearchIdentity(tietue: any) {
    return _.toLower(this.$kaanna(tietue.nimi));
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.tieto {
  padding: 20px 20px 20px 0px;

  .nimi {
    font-weight: 600;
  }
}

.checked {
  color: $paletti-blue;
}

</style>

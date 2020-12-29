<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:pohja>

          <div class="row">
            <div class="col-sm-10 mb-4">

              <b-form-group :label="$t('pohjan-nimi') +' *'">
                <ep-field v-model="nimi" :is-editing="true" :validation="$v.nimi"></ep-field>
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
import { Kielet } from '@shared/stores/kieli';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaLuontiDtoTyyppiEnum } from '@shared/api/amosaa';
import { createLogger } from '@shared/utils/logger';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import { Murupolku } from '@shared/stores/murupolku';
import { Koulutustyyppi } from '@shared/tyypit';

@Component({
  components: {
    EpMainView,
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
export default class RouteOpsPohjaLuonti extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  private nimi: any | null = null;

  get steps() {
    const self = this;
    return [{
      key: 'pohja',
      name: this.$t('luo-uusi-pohja'),
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
        koulutustyyppi: Koulutustyyppi.vapaasivistystyo as any,
        nimi: this.nimi,
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

  get validator() {
    let validation = {
      nimi: {
        ...requiredLokalisoituTeksti(),
      },
    } as any;

    return validation;
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

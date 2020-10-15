<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:toteutussuunnitelma>

           <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-4 pt-2 " :label="$t('kayta-pohjana')+' *'">
                <b-form-radio v-for="(radiobutton, index) in tyypinRadioButtons" :key="'radiobutton'+index" class="p-2 pl-4" v-model="pohjanTyyppi" :value="radiobutton.value" :disabled="radiobutton.disabled">
                  {{$t(radiobutton.text)}}
                </b-form-radio>
              </b-form-group>

              <b-form-group :label="$t(kaannokset[pohjanTyyppi].pohjaLabel) +' *'" v-if="pohjanTyyppi && pohjanTyyppi !== 'uusi'">
                <div v-if="pohjanTyyppi === 'peruste'">
                  <EpMultiSelect
                    v-if="perusteet"
                    v-model="peruste"
                    :placeholder="$t(kaannokset[pohjanTyyppi].pohjaValintaPlaceHolder)"
                    :is-editing="true"
                    :options="perusteet"
                    :validation="$v.peruste"
                    :search-identity="nimiSearchIdentity">
                    <template slot="singleLabel" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }} ({{option.diaarinumero}}, {{$sd(option.voimassaoloAlkaa)}})
                    </template>
                    <template slot="option" slot-scope="{ option }">
                      {{ $kaanna(option.nimi) }} ({{option.diaarinumero}}, {{$sd(option.voimassaoloAlkaa)}})
                    </template>
                  </EpMultiSelect>
                  <EpSpinner v-else />
                </div>

                <div v-if="pohjanTyyppi === 'toteutussuunnitelma' || pohjanTyyppi === 'ophPohja'">
                  <EpMultiSelect
                    v-if="pohjat"
                    v-model="toteutussuunnitelma"
                    :placeholder="$t(kaannokset[pohjanTyyppi].pohjaValintaPlaceHolder)"
                    :is-editing="true"
                    :options="pohjat"
                    :validation="$v.toteutussuunnitelma"
                    :search-identity="nimiSearchIdentity">
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

              <b-form-group :label="$t(kaannokset.nimiLabel) +' *'" v-if="pohjanTyyppi">
                <ep-field v-model="nimi" :is-editing="true" :validation="$v.nimi"></ep-field>
              </b-form-group>

            </div>
           </div>
        </template>

        <template v-slot:luo>
          <span>
            {{$t(kaannokset.luoLabel)}}
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
import { OphPohjatStore } from '@/stores/OphPohjatStore';

export type ProjektiFilter = 'koulutustyyppi' | 'tila' | 'voimassaolo';

const kielistykset = {
  'ops': {
    stepName: 'uusi-toteutussuunnitelma',
    peruste: {
      pohjaLabel: 'toteutussuunnitelman-pohja',
      pohjaValintaPlaceHolder: 'valitse-perusteprojekti',
    },
    toteutussuunnitelma: {
      pohjaLabel: 'toteutussuunnitelman-pohja',
      pohjaValintaPlaceHolder: 'valitse-toteutussuunnitelma',
    },
    nimiLabel: 'toteutussuunnitelman-nimi',
    luoLabel: 'luo-toteutussuunnitelma',
  },
  'yleinen': {
    stepName: 'uusi-jaettu-osa',
    toteutussuunnitelma: {
      pohjaLabel: 'jaetun-osan-pohja',
      pohjaValintaPlaceHolder: 'valitse-jaettu-osa',
    },
    nimiLabel: 'jaetun-osan-nimi',
    luoLabel: 'luo-jaettu-osa',
  },
  'yhteinen': {
    stepName: 'uusi-yhteinen-osa',
    toteutussuunnitelma: {
      pohjaLabel: 'koulutustoimijan-yhteinen-osuus',
      pohjaValintaPlaceHolder: 'valitse-yhteinen-osuus',
    },
    ophPohja: {
      pohjaLabel: 'suunnitelman-pohja',
      pohjaValintaPlaceHolder: 'valitse-pohja',
    },
    nimiLabel: 'toteutussuunnitelman-nimi',
    luoLabel: 'luo-suunnitelma',
  },
};

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

  @Prop({ required: false })
  private ophPohjatStore!: OphPohjatStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private opetussuunnitelmanTyyppi!: 'ops' | 'yleinen' | 'yhteinen';

  @Prop({ required: false })
  private opetussuunnitelmanSuoritustapa!: string;

  @Prop({ required: true })
  private toteutus!: string;

  private pohjanTyyppi: 'toteutussuunnitelma' | 'peruste' | 'uusi' | 'ophPohja' | null = null;

  private peruste: PerusteDto | null = null;
  private toteutussuunnitelma: OpetussuunnitelmaDto | null = null;
  private nimi: any | null = null;

  async mounted() {
    this.toteutussuunnitelmaPohjatStore.updateQuery(
      _.toNumber(this.koulutustoimijaId),
      this.toteutus,
      {
        sivukoko: 1000,
        tila: ['poistettu', 'luonnos', 'valmis', 'julkaistu'],
        tyyppi: [this.opetussuunnitelmanTyyppi],
      });

    if (this.perusteetStore) {
      this.perusteetStore.fetchJulkaistutPerusteet();
    }

    if (this.ophPohjatStore) {
      await this.ophPohjatStore.fetch();
    }
  }

  get kaannokset() {
    return kielistykset[this.opetussuunnitelmanTyyppi];
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
      name: this.$t(this.kaannokset.stepName),
      isValid() {
        return !self.$v.$invalid;
      },
    }];
  }

  get tyypinRadioButtons() {
    return this.radioButtons[this.opetussuunnitelmanTyyppi];
  }

  get radioButtons() {
    return {
      ops: [
        {
          value: 'peruste',
          text: 'perusteprojektia',
        },
        {
          value: 'toteutussuunnitelma',
          text: 'toista-toteutussuunnitelmaa',
        },
      ],
      yleinen: [
        {
          value: 'toteutussuunnitelma',
          text: 'toista-jaettua-osaa',
        },
        {
          value: 'uusi',
          text: 'luo-uusi',
        },
      ],
      yhteinen: [
        {
          value: 'ophPohja',
          text: 'suunnitelman-pohjaa',
        },
        {
          value: 'toteutussuunnitelma',
          text: 'koulutustoimijan-yhteista-osuutta',
        },
      ],
    };
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

    if (this.pohjanTyyppi === 'toteutussuunnitelma' || this.pohjanTyyppi === 'ophPohja') {
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

    return undefined;
  }

  get pohjat() {
    if (this.pohjanTyyppi === 'toteutussuunnitelma') {
      return this.toteutussuunnitelmat;
    }

    if (this.pohjanTyyppi === 'ophPohja') {
      return this.ophPohjat;
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

  get ophPohjat() {
    return this.ophPohjatStore?.pohjat.value || undefined;
  }

  nimiSearchIdentity(tietue: any) {
    return _.toLower(this.$kaanna(tietue.nimi));
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

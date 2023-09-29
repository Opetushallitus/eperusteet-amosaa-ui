<template>
  <EpMainView>
    <b-container>
      <EpSteps ref="epsteps" :steps="steps" :initial-step="0" :on-save="onSave" @cancel="onCancel">

        <template v-slot:toteutussuunnitelma>
          <div class="row">
            <div class="col-sm-10 mb-4">
              <b-form-group class="mt-4 pt-2 " v-if="pohjanValinta">
                <div slot="label" class="d-flex">
                  <span>{{$t('kayta-pohjana')+' *'}}</span>
                  <div class="ml-2 default-icon clickable" id="infopopup">
                    <EpMaterialIcon icon-shape="outlined">info</EpMaterialIcon>
                  </div>
                  <b-popover
                    target="infopopup"
                    triggers="hover click blur" v-if="tyypinRadioButtons">
                      <div class="mb-3" v-for="(radiobutton, index) in tyypinRadioButtons" :key="'infopopup'+index">
                        <span class="font-weight-bold">{{$t(radiobutton.text)}}: </span>
                        <span>{{$t('uusi-opetussuunnitelma-ohje-' + radiobutton.text)}}</span>
                      </div>
                  </b-popover>
                </div>
                <b-form-radio v-for="(radiobutton, index) in tyypinRadioButtons" :key="'radiobutton'+index" class="p-2 pl-4" v-model="pohjanTyyppi" :value="radiobutton.value" :disabled="radiobutton.disabled">
                  {{$t(radiobutton.text)}}
                </b-form-radio>
              </b-form-group>

              <template v-if="pohjanTyyppi !== 'pohjaton'">
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
                        {{ $kaanna(option.nimi) }} ({{option.diaarinumero}}<span v-if="option.voimassaoloAlkaa">, {{$sd(option.voimassaoloAlkaa)}}</span>)
                      </template>
                      <template slot="option" slot-scope="{ option }">
                        {{ $kaanna(option.nimi) }} ({{option.diaarinumero}}<span v-if="option.voimassaoloAlkaa">, {{$sd(option.voimassaoloAlkaa)}}</span>)
                      </template>
                    </EpMultiSelect>
                    <EpSpinner v-else />
                  </div>

                  <div v-if="pohjanTyyppi === 'toteutussuunnitelma' || pohjanTyyppi === 'ophPohja' || pohjanTyyppi === 'opsPohja'">
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
              </template>

              <b-form-group :label="$t(kaannokset.nimiLabel) +' *'" v-if="pohjanTyyppi || !pohjanValinta">
                <ep-field v-model="nimi" :is-editing="true" :validation="$v.nimi"></ep-field>
              </b-form-group>

              <div v-if="korvaavaPeruste" class="korvaavaPeruste" v-html="$t('tutkinnolla-korvaava-peruste-selite', {korvaavaPerusteNimi})"/>

              <b-form-group :label="$t(kaannokset.tutkinnonosatLabel) +' *'" v-if="tutkinnonosatValinta">
                <ep-spinner v-if="!tutkinnonosat" />

                <b-table
                  v-else
                  responsive
                  borderless
                  striped
                  fixed
                  hover
                  :items="tutkinnonosat"
                  :fields="tutkinnonosatFields"
                  :selectable="true"
                  @row-selected="onRowSelected"
                  select-mode="single"
                  selected-variant=''>

                  <template v-slot:cell(nimi)="{ item }">
                    <EpMaterialIcon v-if="item.selected" class="checked mr-2">check_box</EpMaterialIcon>
                    <EpMaterialIcon v-else class="checked mr-2">check_box_outline_blank</EpMaterialIcon>
                    {{ $kaanna(item.nimi) }}
                  </template>
                </b-table>
              </b-form-group>

              <EpJotpaSelect v-if="pohjanTyyppi && pohjanTyyppi === 'pohjaton'" :toteutus="toteutus" :isEditing="true" v-model="jotpa" asRows/>
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
import EpSteps from '@shared/components/EpSteps/EpSteps.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import * as _ from 'lodash';
import { notNull, requiredLokalisoituTeksti } from '@shared/validators/required';
import { ToteutussuunnitelmaStore } from '@/stores/ToteutussuunnitelmaStore';
import { OpetussuunnitelmaDto, PerusteDto, Perusteet } from '@shared/api/amosaa';
import { PerusteetStore } from '@/stores/PerusteetStore';
import { OphPohjatStore } from '@/stores/OphPohjatStore';
import { OphOpsPohjatStore } from '@/stores/OphOpsPohjatStore';
import { PohjanTutkinnonosatStore } from '@/stores/PohjanTutkinnonosatStore';
import { OpetussuunnitelmaPohjatStore } from '@/stores/OpetussuunnitelmaPohjatStore';
import { OpetussuunnitelmaLuontiKielistykset } from '@/utils/toteutustypes';
import { minLength, required } from 'vuelidate/lib/validators';
import { createLogger } from '@shared/utils/logger';
import { EperusteetKoulutustyyppiRyhmat, isAmmatillinenKoulutustyyppi, perusteenSuoritustapa, Toteutus } from '@shared/utils/perusteet';
import { KayttajaStore } from '@/stores/kayttaja';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpJotpaSelect, { OpsJotpa } from '@/components/EpJotpa/EpJotpaSelect.vue';

@Component({
  components: {
    EpMainView,
    EpMultiSelect,
    EpField,
    EpSpinner,
    EpSteps,
    EpToggle,
    EpJotpaSelect,
    EpMaterialIcon,
  },
  validations() {
    return {
      ...this.validator,
    };
  },
} as any)
export default class RouteToteutussuunnitelmaLuonti extends Vue {
  @Prop({ required: true })
  private toteutussuunnitelmaStore!: ToteutussuunnitelmaStore;

  @Prop({ required: false })
  private perusteetStore!: PerusteetStore;

  @Prop({ required: false })
  private ophPohjatStore!: OphPohjatStore;

  @Prop({ required: false })
  private ophOpsPohjatStore!: OphOpsPohjatStore;

  @Prop({ required: true })
  private pohjanTutkinnonosatStore!: PohjanTutkinnonosatStore;

  @Prop({ required: true })
  private kayttajaStore!: KayttajaStore;

  @Prop({ required: true })
  private koulutustoimijaId!: string | number;

  @Prop({ required: true })
  private opetussuunnitelmanTyyppi!: 'ops' | 'yleinen' | 'yhteinen' | 'pohja' | 'tunnistamisraportti';

  @Prop({ required: false })
  private opetussuunnitelmanSuoritustapa!: string;

  @Prop({ required: false })
  private opetussuunnitelmaPohjatStore!: OpetussuunnitelmaPohjatStore;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  private pohjanTyyppi: 'toteutussuunnitelma' | 'peruste' | 'uusi' | 'ophPohja' | 'opsPohja' | 'pohjaton' | null = null;

  private peruste: PerusteDto | null = null;
  private toteutussuunnitelma: OpetussuunnitelmaDto | null = null;
  private nimi: any | null = null;
  private tutkinnonosaKoodit: string[] = [];
  private toteutussuunnitelmaPohjatStore: OpetussuunnitelmaPohjatStore | null = null;
  private jotpa: OpsJotpa = { jotpa: false, jotpatyyppi: null };
  private korvaavaPeruste: PerusteDto | null = null;

  async mounted() {
    this.toteutussuunnitelmaPohjatStore = new OpetussuunnitelmaPohjatStore();
    this.toteutussuunnitelmaPohjatStore.fetch(_.toNumber(this.koulutustoimijaId), this.toteutus, ['luonnos', 'valmis', 'julkaistu'], this.tyyppi);

    if (this.opetussuunnitelmaPohjatStore) {
      this.opetussuunnitelmaPohjatStore.fetch(_.toNumber(this.koulutustoimijaId), this.toteutus, ['luonnos', 'valmis', 'julkaistu'], 'opsPohja');
    }

    if (this.perusteetStore) {
      this.perusteetStore.fetchJulkaistutPerusteet();
    }

    if (this.ophPohjatStore) {
      await this.ophPohjatStore.fetch();
    }

    if (this.ophOpsPohjatStore) {
      await this.ophOpsPohjatStore.fetch(EperusteetKoulutustyyppiRyhmat[this.toteutus]);
    }
  }

  get tyyppi() {
    return this.opetussuunnitelmanTyyppi !== 'tunnistamisraportti' ? this.opetussuunnitelmanTyyppi : 'ops';
  }

  get kaannokset() {
    return this.kielistykset[this.opetussuunnitelmanTyyppi];
  }

  @Watch('pohjanTyyppi')
  onPohjantyyppiChange() {
    this.peruste = null;
    this.toteutussuunnitelma = null;
    this.korvaavaPeruste = null;
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
      ops: OpetussuunnitelmaLuontiKielistykset[this.toteutus]['radioButtons'],
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
      tunnistamisraportti: [
        {
          value: 'peruste',
          text: 'perusteprojektia',
        },
        {
          value: 'toteutussuunnitelma',
          text: 'toista-oppimisympariston-tunnistamisraporttia',
        },
      ],
    };
  }
  get kielistykset() {
    return {
      'ops': OpetussuunnitelmaLuontiKielistykset[this.toteutus],
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
      'pohja': {
        stepName: 'uusi-yhteisten-osien-pohja',
        nimiLabel: 'pohjan-nimi',
        luoLabel: 'luo-pohja',
      },
      'tunnistamisraportti': {
        stepName: 'uusi-oppimisympariston-tunnistamisraportti',
        peruste: {
          pohjaLabel: 'pohja',
          pohjaValintaPlaceHolder: 'valitse-pohja',
        },
        toteutussuunnitelma: {
          pohjaLabel: 'pohja',
          pohjaValintaPlaceHolder: 'valitse-tunnistamisraportti',
        },
        nimiLabel: 'oppimisympariston-tunnistamisraportin-nimi',
        luoLabel: 'luo-tunnistamisraportti',
        tutkinnonosatLabel: 'valitse-tutkinnonosat-jotka-tuodaan-pohjasta',
      },
    };
  }

  async onSave() {
    try {
      const luotu = await this.toteutussuunnitelmaStore.create(_.toString(this.koulutustoimijaId), {
        perusteId: this.peruste ? this.peruste.id : undefined,
        perusteDiaarinumero: this.peruste ? this.peruste.diaarinumero : undefined,
        opsId: this.toteutussuunnitelma?.id,
        tyyppi: this.tyyppi as any,
        suoritustapa: this.tallennettavaSuoritustapa,
        nimi: this.nimi,
        tutkinnonOsaKoodiIncludes: this.tutkinnonosaKoodit,
        koulutustyyppi: this.peruste ? undefined : this.koulutustyyppi,
        jotpatyyppi: this.jotpa ? this.jotpa.jotpatyyppi as any : null,
      } as any);

      this.$router.push({
        name: 'toteutussuunnitelma',
        params: {
          toteutussuunnitelmaId: _.toString(luotu.id),
        },
      });
    }
    catch (e) {
      createLogger('RouteToteutussuunnitelmaLuonti').error(e);
      this.$fail(this.$t('toteutussuunnitelman-luonti-virhe') as string);
    }
  }

  get koulutustyyppi(): any {
    return EperusteetKoulutustyyppiRyhmat[this.toteutus][0];
  }

  get tallennettavaSuoritustapa() {
    if (this.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && this.peruste) {
      return perusteenSuoritustapa(this.pohjanTutkinnonosatStore.peruste.value);
    }

    return this.opetussuunnitelmanSuoritustapa;
  }

  onCancel() {
    history.back();
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

    if (this.pohjanTyyppi === 'toteutussuunnitelma' || this.pohjanTyyppi === 'ophPohja' || this.pohjanTyyppi === 'opsPohja') {
      validation = {
        ...validation,
        toteutussuunnitelma: notNull(),
      };
    }

    if (this.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && this.pohjanTyyppi === 'peruste') {
      validation = {
        ...validation,
        tutkinnonosaKoodit: {
          'min-length': minLength(1),
          required,
        },
      };
    }

    if (this.jotpa?.jotpa) {
      validation = {
        ...validation,
        jotpa: {
          jotpatyyppi: notNull(),
        },
      };
    }

    return validation;
  }

  get toteutussuunnitelmat() {
    if (this.toteutussuunnitelmaPohjatStore?.opetussuunnitelmat.value) {
      return _.sortBy(this.toteutussuunnitelmaPohjatStore.opetussuunnitelmat.value, ops => this.$kaanna(ops.nimi!));
    }

    return undefined;
  }

  get opsPohjat() {
    if (this.opetussuunnitelmaPohjatStore?.opetussuunnitelmat.value) {
      return this.opetussuunnitelmaPohjatStore?.opetussuunnitelmat.value;
    }

    return undefined;
  }

  get ophOpsPohjat() {
    return this.ophOpsPohjatStore?.opsPohjat.value;
  }

  get pohjat() {
    if (this.pohjanTyyppi === 'toteutussuunnitelma') {
      return this.toteutussuunnitelmat;
    }

    if (this.pohjanTyyppi === 'ophPohja') {
      return this.ophPohjat;
    }

    if (this.pohjanTyyppi === 'opsPohja') {
      return _.sortBy(
        _.uniqBy([
          ...(this.opsPohjat ? this.opsPohjat : []),
          ...(this.ophOpsPohjat ? this.ophOpsPohjat : []),
        ], ops => ops.id),
        ops => this.$kaanna(ops.nimi!));
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

  get pohjanValinta() {
    return this.opetussuunnitelmanTyyppi !== 'pohja';
  }

  @Watch('peruste')
  async perusteChange() {
    this.tutkinnonosaKoodit = [];

    if (this.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && this.peruste) {
      await this.pohjanTutkinnonosatStore.fetchPerusteesta(this.peruste.id);
    }
  }

  @Watch('toteutussuunnitelma')
  async toteutussuunnitelmaChange() {
    this.tutkinnonosaKoodit = [];

    if (this.toteutussuunnitelma && isAmmatillinenKoulutustyyppi(this.toteutussuunnitelma.peruste?.koulutustyyppi)) {
      this.korvaavaPeruste = (await Perusteet.getKoulutuskoodillaKorvaavaPeruste(this.toteutussuunnitelma?.id!, _.toString(this.koulutustoimijaId))).data;
    }
  }

  get tutkinnonosatValinta() {
    return this.opetussuunnitelmanTyyppi === 'tunnistamisraportti' && (this.peruste !== null);
  }

  get tutkinnonosat() {
    if (!this.pohjanTutkinnonosatStore.tutkinnonosat.value) {
      return this.pohjanTutkinnonosatStore.tutkinnonosat.value;
    }

    return _.map(this.pohjanTutkinnonosatStore.tutkinnonosat.value, tutkinnonosa => {
      return {
        ...tutkinnonosa,
        selected: _.includes(this.tutkinnonosaKoodit, tutkinnonosa.koodi),
      };
    });
  }

  get tutkinnonosatFields() {
    return [{
      key: 'nimi',
      label: this.$t('nimi'),
    }, {
      key: 'laajuus',
      label: this.$t('laajuus'),
      thStyle: { width: '10rem' },
    }];
  }

  onRowSelected(item) {
    if (!_.isEmpty(item)) {
      if (_.includes(this.tutkinnonosaKoodit, item[0].koodi)) {
        this.tutkinnonosaKoodit = _.filter(this.tutkinnonosaKoodit, koodi => koodi !== item[0].koodi);
      }
      else {
        this.tutkinnonosaKoodit.push(item[0].koodi);
      }
    }
  }

  get korvaavaPerusteNimi() {
    return `${this.$kaanna(this.korvaavaPeruste?.nimi!)} (${this.korvaavaPeruste?.diaarinumero}, ${this.$sd(this.korvaavaPeruste?.voimassaoloAlkaa!)} - ${(this.korvaavaPeruste?.voimassaoloLoppuu ? this.$sd(this.korvaavaPeruste?.voimassaoloLoppuu) : '')})`;
  }
}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.tieto {
  padding: 20px 20px 20px 0;

  .nimi {
    font-weight: 600;
  }
}

.checked {
  color: $paletti-blue;
}

.korvaavaPeruste {
  border-radius: 10px;
  border: 1px solid $blue-lighten-3;
  padding: 12px;
  margin-right: 10px;
  background-color: $blue-lighten-4;
}

</style>

<template>
  <div>
    <EpButton
      icon="add"
      variant="outline"
      v-b-modal.oatModal
      @click="lisaaOat"
      v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'toteutussuunnitelma' }">
      {{ $t('lisaa-osaamisen-arvioinnin-toteutussuunnitelma') }}
    </EpButton>

    <b-modal ref="oatModal" size="lg">

      <template v-slot:modal-header>
        <div class="row w-100">
          <div class="col">
            <h2>{{ oat.id ? $t('osaamisen-arvioinnin-toteutussuunnitelma') : $t('lisaa-osaamisen-arvioinnin-toteutussuunnitelma') }}</h2>
          </div>
          <div class="col text-right">
            <EpKielivalinta />
          </div>
        </div>
      </template>

      <div class="mb-4">
        <b-form-radio
          v-model="tyyppi"
          value="oat"
          name="tyyppi">{{ $t('osaamisen-arvioinnin-toteutussuunnitelma') }}
        </b-form-radio>
        <b-form-radio
          v-model="tyyppi"
          value="url"
          name="tyyppi">{{ $t('ulkoinen-linkki') }}
        </b-form-radio>
      </div>

      <div class="mb-5" v-if="tyyppi === 'oat'">
        <EpMultiSelect
          v-if="oatit"
          v-model="oat.oatOpetussuunnitelma"
          :placeholder="$t('valitse-osaamisen-arvioinnin-toteutussuunnitelma')"
          :is-editing="true"
          :options="oatit"
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

      <div class="mb-5" v-if="tyyppi === 'url'">
        <b-form-group :label="$t('oat-nimi') + (editing ? ' *' : '')">
          <EpField v-model="oat.nimi" :is-editing="editing" :showValidValidation="false"/>
        </b-form-group>
        <b-form-group :label="$t('linkki') + (editing ? ' *' : '')">
          <EpField v-model="oat.url" :is-editing="editing" :showValidValidation="false"/>
        </b-form-group>
      </div>

      <template v-slot:modal-footer>

        <div class="footer w-100 footer pt-2">
          <div class="d-flex justify-content-end">
            <EpButton @click="sulje" variant="link">{{ $t('peruuta') }}</EpButton>
            <EpButton variant="link" icon="delete" @click="poista" v-oikeustarkastelu="{oikeus:'hallinta'}">
              {{ $t('poista') }}
            </EpButton>
            <EpButton @click="tallenna" class="ml-3" :disabled="!valid">{{ $t('tallenna') }}</EpButton>
          </div>
        </div>

      </template>

    </b-modal>

  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpKielivalinta from '@shared/components/EpKielivalinta/EpKielivalinta.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OsaamisenArvioinninToteutussuunnitelmaDto } from '@shared/api/amosaa';
import { OpetussuunnitelmaPohjatStore } from '@/stores/OpetussuunnitelmaPohjatStore';
import { Toteutus } from '@shared/utils/perusteet';
import { nimiSearchIdentity } from '@shared/utils/helpers';

@Component({
  components: {
    EpButton,
    EpFormContent,
    EpField,
    EpKielivalinta,
    EpMaterialIcon,
  },
})
export default class EpOatValintaModal extends Vue {
  private editing: boolean = true;
  private oat: OsaamisenArvioinninToteutussuunnitelmaDto | {} = {};
  private toteutussuunnitelmaPohjatStore: OpetussuunnitelmaPohjatStore | null = null;
  private tyyppi: 'oat' | 'url' | null = null;
  private index: number | null = null;

  async lisaaOat() {
    this.oat = {};
    this.tyyppi = null;
    (this.$refs['oatModal'] as any).show();
    await this.haeOatit();
  }

  sulje() {
    this.index = null;
    (this.$refs['oatModal'] as any).hide();
  }

  async muokkaa(oat: OsaamisenArvioinninToteutussuunnitelmaDto, index) {
    this.index = index;
    (this.$refs['oatModal'] as any).show();
    this.oat = _.cloneDeep(oat);
    if (_.get(this.oat, 'oatOpetussuunnitelma.id')) {
      this.tyyppi = 'oat';
    }
    else {
      this.tyyppi = 'url';
    }
    await this.haeOatit();
  }

  async haeOatit() {
    if (this.toteutussuunnitelmaPohjatStore == null) {
      this.toteutussuunnitelmaPohjatStore = new OpetussuunnitelmaPohjatStore();
      await this.toteutussuunnitelmaPohjatStore.fetch(_.toNumber(this.koulutustoimijaId), this.toteutus, ['julkaistu'], 'yhteinen');
    }
  }

  get oatit() {
    return this.toteutussuunnitelmaPohjatStore?.opetussuunnitelmat.value;
  }

  get koulutustoimijaId() {
    return this.$route.params.koulutustoimijaId;
  }

  get toteutus() {
    return Toteutus[_.toUpper(this.$route.params.toteutus)];
  }

  async poista() {
    const poista = await this.$bvModal.msgBoxConfirm(' ', {
      title: this.$t('poista-osaamisen-arvioinnin-toteutussuunnitelma-kysymys'),
      okVariant: 'primary',
      okTitle: this.$t('poista') as any,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as any,
      centered: true,
      ...{} as any,
    });

    if (poista) {
      this.$emit('poistaOat', this.index);
      this.sulje();
    }
  }

  async tallenna() {
    this.$emit('tallennaOat', this.oat, this.index);
    this.sulje();
  }

  get nimiSearchIdentity() {
    return nimiSearchIdentity;
  }

  get valid() {
    if (this.tyyppi === 'oat') {
      return _.has(this.oat, 'oatOpetussuunnitelma.id');
    }
    else if (this.tyyppi === 'url') {
      return _.has(this.oat, 'nimi') && _.has(this.oat, 'url');
    }

    return false;
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.footer {
  border-top: 1px solid $gray-lighten-8;
}

</style>

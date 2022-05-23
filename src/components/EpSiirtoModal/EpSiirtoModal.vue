<template>
  <div>
    <ep-button class="siirra-opetussuunnitelma" variant="link" @click="$refs['epsiirtomodaali'].show()">
          {{$t(kielistykset['siirratoteutusystavaorganisaatiolle'])}}
    </ep-button>

    <b-modal id="epsiirtomodaali"
             ref="epsiirtomodaali"
             size="lg"
             :title="$t(kielistykset['siirratoteutusystavaorganisaatiolle'])"
             :hide-footer="true">
      <p>{{ $t('siirra-kuvaus') }}</p>
      <div v-if="ystavatFormatted">
        <ep-search v-model="nimiFilter"
            :placeholder="$t('etsi-organisaatiota')"
            class="mb-3" />
        <b-table responsive
                striped
                :items="ystavatFormatted"
                :fields="fields"
                :per-page="perPage"
                :current-page="currentPage">
          <template v-slot:cell(actions)="row">
              <ep-button
                class="siirra"
                @click="siirraToteutussuunnitelma(row.item)"
                v-if="row.item.siirrettavissa"
                variant="link">
              {{ $t(kielistykset['siirratoteutus']) }}
            </ep-button>
          </template>
        </b-table>
        <b-pagination v-model="currentPage"
                      :total-rows="rows"
                      :per-page="perPage"
                      align="center"
                      aria-controls="epsiirtomodaali"></b-pagination>
      </div>
      <ep-spinner v-else />
    </b-modal>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { Koulutustoimijat, KoulutustoimijaYstavaDto, Opetussuunnitelmat } from '@shared/api/amosaa';
import { fail, success } from '@shared/utils/notifications';
import { Kielet } from '@shared/stores/kieli';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { ToteutussuunnitelmaSiirtoKielistykset } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';
import { OphOrgOid } from '@/stores/kayttaja';

@Component({
  components: {
    EpButton,
    EpSpinner,
    EpSearch,
  },
})
export default class EpSiirtoModal extends Vue {
  private ystavat: KoulutustoimijaYstavaDto[] | null = null;
  private currentPage = 1;
  private perPage = 5;
  private nimiFilter = '';

  @Prop({ required: true })
  private koulutustoimijaId!: string;

  @Prop({ required: true })
  private toteutussuunnitelma!: any;

  @Prop({ required: true })
  private toteutus!: Toteutus;

  @Watch('koulutustoimijaId', { immediate: true })
  async onKoulutustoimijaIdChange(newValue: number, oldValue: number) {
    if (newValue && newValue !== oldValue) {
      this.fetch();
    }
  }

  async fetch() {
    this.ystavat = (await Koulutustoimijat.getOmatYstavat(this.koulutustoimijaId)).data;
  }

  get fields() {
    return [{
      key: 'nimiLocalized',
      label: this.$t('nimi'),
    }, {
      key: 'actions',
      label: this.$t('toiminto'),
    }];
  }

  get ystavatFormatted() {
    return _(this.ystavat)
      .map(org => ({
        ...org,
        nimiLocalized: this.$kaanna(org.nimi!),
        siirrettavissa: org.organisaatio !== OphOrgOid,
      }))
      .filter(this.$filterBy('nimiLocalized', this.nimiFilter))
      .value();
  }

  get rows() {
    if (this.ystavatFormatted) {
      return this.ystavatFormatted.length;
    }
  }

  get kieli() {
    return Kielet.uiKieli;
  }

  async siirraToteutussuunnitelma(org) {
    (this.$refs['epsiirtomodaali'] as any).hide();
    if (await this.$bvModal.msgBoxConfirm(this.$t('siirra-toteutussuunnitelma-varmistus', { nimi: this.$kaanna(this.toteutussuunnitelma.nimi) }) as string, {
      title: this.$t('siirra-toteutussuunnitelma') as string,
      okVariant: 'primary',
      okTitle: this.$t('siirra-toteutussuunnitelma') as string,
      cancelVariant: 'link',
      cancelTitle: this.$t('peruuta') as string,
      centered: true,
    })) {
      try {
        await Opetussuunnitelmat.updateOpetussuunnitelmaKoulutustoimija(_.parseInt(this.toteutussuunnitelma.id), this.koulutustoimijaId, org);
        success('siirra-toteutussuunnitelma-onnistui');
        this.$router.replace({
          name: 'toteutussuunnitelmat',
          params: {
            lang: this.kieli.value,
            koulutustoimijaId: this.koulutustoimijaId,
          },
        });
      }
      catch (err) {
        fail('siirra-toteutussuunnitelma-epaonnistui');
      }
    }
  }

  get kielistykset() {
    return ToteutussuunnitelmaSiirtoKielistykset[this.toteutus];
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  ::v-deep .siirra .btn .teksti, ::v-deep .siirra .btn{
    padding-left: 0px !important;
  }

</style>

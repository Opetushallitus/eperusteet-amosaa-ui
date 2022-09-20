<template>
  <div
    class="opsbox opsbox--published"
    :style="ops.bannerImage">
    <RouterLink
      class="d-block h-100"
      tag="a"
      :to="{ name: 'toteutussuunnitelma', params: { toteutussuunnitelmaId: ops.id, koulutustoimijaId: ops.koulutustoimija.id } }"
      :key="ops.id">
      <div class="opsbox__info opsbox__info--published d-flex flex-column">
        <div class="opsbox__name">
          {{ $kaanna(ops.nimi) }}
        </div>
        <div>
          <div v-if="ops.jotpatyyppi" class="opsbox__jotpa">
            {{$t('jotpa')}}
          </div>
        </div>
        <div class="opsbox__info--footer mt-auto" v-if="ops.viimeisinJulkaisuAika">
          {{$t('julkaistu')}} {{$sd(ops.viimeisinJulkaisuAika)}}
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class OpsJulkaistutTile extends Vue {
  @Prop({ required: true })
  private ops!: any;
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';
@import '@shared/styles/_mixins.scss';

$box-radius: 10px;
$box-height: 230px;
$box-width: 192px;
$new-tile-top-bg-color:#1E49CF;
$new-tile-bottom-bg-color:#0f3284;

.opsbox {
  user-select: none;
  margin: 10px;
  border-radius: $box-radius;
  @include tile-background-shadow;

  &:hover {
    @include tile-background-shadow-selected;
  }

  &--published {
    height: $box-height;
    width: $box-width;
    background-repeat: no-repeat;
    background-size: contain;
    text-align: center;
  }

  &__info {
    color: #2B2B2B;
    border-radius: 0 0 $box-radius $box-radius;
    text-align: center;
    height: 92px;
    width: $box-width;
    padding: 10px 10px;
    margin: 0 auto;
    border: 1px solid #E7E7E7;
    border-top-width: 0;
    overflow-y: auto;

    &--published {
      height: 100%;
      padding-top: 80px;
    }

    &--footer {
      padding-top: 5px;
      border-top: 1px solid $gray-lighten-9;
      color: $gray-lighten-11;
      font-size: 0.8rem;
    }
  }

  &__name {

    text-align: center;
    hyphens: none;
    font-size: 14px;
    font-weight: 600;
  }

  &__jotpa {
    padding: 2px 15px;
    display: inline-block;
    margin-top: 5px;
    color: $white;
    background-color: $jotpa-color;
    border-radius: 1rem;
    font-size: 0.8rem;
  }

}

</style>

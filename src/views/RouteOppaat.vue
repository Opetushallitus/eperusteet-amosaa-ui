<template>
  <EpOppaat :koulutustyypit="koulutustyypit"/>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Vue, Component } from 'vue-property-decorator';
import EpOppaat from '@shared/components/EpOppaat/EpOppaat.vue';
import { ToteutuksenKoulutustyypit } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';

@Component({
  components: {
    EpOppaat,
  },
})
export default class RouteOppaat extends Vue {
  @Prop({ required: true })
  private toteutus!: Toteutus;

  get koulutustyypit() {
    return ToteutuksenKoulutustyypit[this.toteutus];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

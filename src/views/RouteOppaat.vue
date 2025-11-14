<template>
  <EpOppaat :koulutustyypit="koulutustyypit" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EpOppaat from '@shared/components/EpOppaat/EpOppaat.vue';
import { ToteutuksenKoulutustyypit } from '@/utils/toteutustypes';
import { Toteutus } from '@shared/utils/perusteet';

const props = defineProps<{
  toteutus: Toteutus;
}>();

const koulutustyypit = computed(() => {
  if (props.toteutus === Toteutus.VAPAASIVISTYSTYO) {
    return [...ToteutuksenKoulutustyypit[props.toteutus], 'koulutustyyppi_muu'];
  }
  return ToteutuksenKoulutustyypit[props.toteutus];
});
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

</style>

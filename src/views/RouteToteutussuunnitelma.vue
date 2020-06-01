<template>
  <div class="minfull p-0 m-0">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Watch, Prop, Component, Vue } from 'vue-property-decorator';

@Component
export default class RouteToteutussuunnitelma extends Vue {

}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables';

</style>

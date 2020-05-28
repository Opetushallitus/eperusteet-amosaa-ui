<template>
<div>
  <router-view/>
  <notifications style="margin-right: 6px; margin-top: 90px;"
                 position="top right"
                 :max="3" />
</div>
</template>

<style lang="scss">
@import "~@shared/styles/app";

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
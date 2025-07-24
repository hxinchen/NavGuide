<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <v-app id="app-root">
    <router-view />
  </v-app>
</template>

<style scoped>
#app-root {
  width: 100%;
  height: 100%;
}
</style>

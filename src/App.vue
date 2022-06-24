<script setup lang="ts">
import MediaPreview from "./components/MediaPreview.vue";
import { SettingsProvider } from "./hooks/useSettings";
</script>

<template>
  <SettingsProvider>
    <MediaPreview />
  </SettingsProvider>
</template>

<style>
* {
  box-sizing: border-box;
}

p,
h1,
h2,
h3,
h4,
h5,
h6,
ul,
ol,
li {
  margin: 0;
  padding: 0;
}

body {
  background: #283328;
  height: 100vh;
  display: flex;
  margin: 0;
  width: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ccc;
  width: 100%;
}
</style>

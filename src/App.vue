<script setup lang="ts">
import CastReceiver from "./components/CastReceiver.vue";
import RemoteControl from "./components/RemoteControl.vue";
import DebugViewer from "./components/DebugViewer.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
</script>

<template>
  <div id="app-root">
    <!-- Main Cast Receiver Component -->
    <CastReceiver />

    <!-- Remote Control Handler (no visual output, just keyboard handling) -->
    <RemoteControl />

    <!-- UI Overlays -->
    <DebugViewer />
    <SettingsPanel />
  </div>
</template>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
}

#app-root {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>

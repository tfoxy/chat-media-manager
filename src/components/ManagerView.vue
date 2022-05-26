<script setup lang="ts">
import { ref } from "vue";
import { useEvent } from "~/hooks/useEvent";
import { useSettings } from "~/hooks/useSettings";
import { logger } from "~/model/logger";
import { Reader } from "~/model/reader";
import { Writer } from "~/model/writer";
import LoggerArea from "./LoggerArea.vue";

type Log = InstanceType<typeof LoggerArea>["$props"]["logs"][number];

const reader = new Reader();

const settings = useSettings();
const logs = ref<Log[]>([]);
const logId = ref(0);
const writer = ref<Writer>();
const loading = ref(false);

useEvent(logger, "info", ({ type, detail }) => addLog(type, detail));
useEvent(logger, "warn", ({ type, detail }) => addLog(type, detail.message));
useEvent(logger, "error", ({ type, detail }) => addLog(type, detail.message));

function addLog(type: Log["type"], message: string) {
  if (type !== "info") console[type](message);
  if (logs.value.length >= 1000) {
    logs.value.shift();
  }
  logs.value.push({
    id: ++logId.value,
    type,
    message,
  });
}

async function selectWhatsAppFolder() {
  try {
    const handle = await self.showDirectoryPicker();
    loading.value = true;
    writer.value = await reader.readAndQueryDatabase(handle, settings.me);
    addLog("info", "WhatsApp directory successfully loaded");
  } catch (err) {
    if (err instanceof DOMException && err.code === DOMException.ABORT_ERR) {
      // User cancelled directory picker
      return;
    }
    addLog("error", String(err));
  } finally {
    loading.value = false;
  }
}

async function writeToDisk() {
  if (!writer.value) {
    throw new Error("Cannot write to disk when WhatsApp folder was not loaded");
  }
  try {
    loading.value = true;
    await writer.value.createMediaFolderByContact();
    addLog("info", "Successfully created media folder!");
  } catch (err) {
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      return;
    }
    addLog("error", String(err));
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="manager">
    <h1>Chat Media Manager</h1>

    <div>
      <label>
        Me:
        <input type="text" :disabled="loading" v-model="settings.me" />
      </label>
      <button type="button" :disabled="loading" @click="selectWhatsAppFolder">
        Select WhatsApp folder
      </button>
    </div>

    <div v-if="writer">
      <button type="button" :disabled="loading" @click="writeToDisk">
        Write to disk
      </button>
    </div>

    <LoggerArea class="logger" :logs="logs" />
  </div>
</template>

<style scoped>
.manager {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logger {
  flex-grow: 1;
}
</style>

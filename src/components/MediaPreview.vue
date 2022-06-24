<script setup lang="ts">
import { ref, watch } from "vue";
import {
  loadContactMapFromWaFile,
  loadMediaFromKey,
} from "~/model/inputHandler";
import { RowMessageMedia } from "~/model/mediaTransformer";
import { Contact } from "~/model/sql";
import MediaTable from "./MediaTable.vue";

const keyFileBuffer = ref<ArrayBuffer>();
const contactMap = ref<Map<string, Contact>>();
const mediaList = ref<RowMessageMedia[]>();

async function handleKeyFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const { files } = target;
  if (files?.length) {
    const keyFile = files[0];
    keyFileBuffer.value = await keyFile.arrayBuffer();
  }
}

async function handleWaFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const { files } = target;
  if (files?.length) {
    const waFile = files[0];
    const waFileBuffer = await waFile.arrayBuffer();
    contactMap.value = await loadContactMapFromWaFile(waFileBuffer);
  }
}

watch([keyFileBuffer, contactMap], async () => {
  if (!keyFileBuffer.value || !contactMap.value) return;
  mediaList.value = await loadMediaFromKey(
    keyFileBuffer.value,
    contactMap.value
  );
});
</script>

<template>
  <input type="file" @change="handleKeyFileChange" />
  <input type="file" @change="handleWaFileChange" />
  <MediaTable v-if="mediaList" :data="mediaList" />
</template>

<style scoped></style>

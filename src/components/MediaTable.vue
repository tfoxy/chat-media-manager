<script setup lang="ts">
import { Tabulator, TabulatorFull } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.css";
import { ref, onMounted, watch } from "vue";
import { RowMessageMedia } from "~/model/mediaTransformer";
import { getMediaTableColumns } from "./mediaTableHelper";
import "~/model/tabulatorSetup";
import electronAPI from "~/model/electronAPI";

const props = defineProps<{
  data: RowMessageMedia[];
}>();

const table = ref<HTMLElement>();
const tabulator = ref<TabulatorFull>();

onMounted(() => {
  if (!table.value) return;
  tabulator.value = new TabulatorFull(table.value, {
    data: props.data,
    columns: getMediaTableColumns(),
    pagination: true,
    paginationSize: 20,
    selectable: true,
    history: true,
    initialSort: [{ column: "timestamp", dir: "desc" }],
  });
  console.log(tabulator.value);
  tabulator.value.on("rowDeleted", async (row) => {
    const media = row.getData() as RowMessageMedia;
    await electronAPI.deleteMedia(media.file_path);
  });
  tabulator.value.on("historyUndo", async (action, component) => {
    if (action === "rowDelete") {
      const row = component as Tabulator.RowComponent;
      const media = row.getData() as RowMessageMedia;
      await electronAPI.recoverMedia(media.file_path);
    }
  });
});

watch([props.data], () => {
  if (!tabulator.value) return;
  tabulator.value.updateOrAddData(props.data);
});
</script>

<template>
  <div ref="table"></div>
</template>

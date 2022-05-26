<script setup lang="ts">
import { ref, watch } from "vue";

interface Log {
  id: number;
  type: "info" | "warn" | "error";
  message: string;
}

const { logs } = defineProps<{ logs: Log[] }>();

const logger = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);

watch(logs, () => {
  const el = logger.value;
  if (!el) return;
  const scrollBottom = el.scrollTop + el.clientHeight;
  const rowHeight = 20;
  isAtBottom.value = scrollBottom >= el.scrollHeight - rowHeight;
});

watch(
  logs,
  () => {
    const el = logger.value;
    if (el && isAtBottom.value) {
      el.scrollTo({ top: el.scrollHeight });
    }
  },
  { flush: "post" }
);
</script>

<template>
  <ul class="logger" ref="logger">
    <li
      v-for="log of logs"
      :key="log.id"
      :class="{
        info: log.type === 'info',
        warn: log.type === 'warn',
        error: log.type === 'error',
      }"
    >
      {{ log.message }}
    </li>
  </ul>
</template>

<style scoped>
.logger {
  width: 100%;
  height: 100%;
  background: #ddd;
  text-align: left;
  overflow: auto;
  padding: 5px;
}

.info {
  color: green;
}

.warn {
  color: orange;
}

.error {
  color: red;
}
</style>

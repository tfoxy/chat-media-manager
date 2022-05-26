import {
  defineComponent,
  inject,
  InjectionKey,
  provide,
  reactive,
  watch,
} from "vue";

interface Settings {
  me: string;
}

const defaultValues: Settings = {
  me: "Me",
};

const settingsKey = "chatMediaManager-settings";
const settingsSymbol: InjectionKey<Settings> = Symbol(settingsKey);

function loadSettings(): Settings {
  return {
    ...defaultValues,
    ...JSON.parse(localStorage.getItem(settingsKey) || "{}"),
  };
}

function saveSettings(settings: Settings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export const SettingsProvider = defineComponent({
  setup() {
    const state = reactive(loadSettings());
    watch([state], () => {
      saveSettings(state);
    });
    provide(settingsSymbol, state);
  },
  render() {
    return this.$slots.default?.();
  },
});

export function useSettings(): Settings {
  const settings = inject(settingsSymbol);
  if (!settings) {
    throw new Error("Settings must be provided by using SettingsProvider");
  }
  return settings;
}

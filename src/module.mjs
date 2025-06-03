import { MODULE_TITLE } from "./constants.mjs";
import { log } from "./utils.mjs";
import { onRenderActiveEffectConfig, onUpdateWorldTime } from "./hooks.mjs";

function onInit() {
  log(`Initializing ${MODULE_TITLE}.`);
}

Hooks.on("init", onInit);
Hooks.on("updateWorldTime", onUpdateWorldTime);
Hooks.on("renderActiveEffectConfig", onRenderActiveEffectConfig);

import "./styles/style.less";

import { MODULE_TITLE } from "./constants.mjs";
import { log } from "./utils.mjs";
import * as hooks from "./hooks/_module.mjs";

function onInit() {
  log(`Initializing ${MODULE_TITLE}.`);

  hooks.initInjectConfig();

  hooks.initExpirationWorldTime();

  hooks.initExpirationCombatStart();
  hooks.initExpirationCombatEnd();
  hooks.initExpirationTurnChange();

  if (game.system.id === "dnd5e") {
    //TODO: Hooks for short rest, long rest, new day long rest
  }
}

Hooks.on("init", onInit);

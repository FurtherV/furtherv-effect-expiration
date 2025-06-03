import "./less/furtherv-effect-expiration.less";

import { MODULE_TITLE } from "./scripts/constants.mjs";
import { log } from "./scripts/utils.mjs";
import * as hooks from "./scripts/hooks/_module.mjs";

function onInit() {
  log(`Initializing ${MODULE_TITLE}.`);

  hooks.initInjectConfig();
  hooks.initMessageHandler();

  hooks.initExpirationWorldTime();

  hooks.initExpirationCombatStart();
  hooks.initExpirationCombatEnd();
  hooks.initExpirationTurnChange();

  if (game.system.id === "dnd5e") {
    hooks.initDND5eRest();
  }
}

Hooks.on("init", onInit);
